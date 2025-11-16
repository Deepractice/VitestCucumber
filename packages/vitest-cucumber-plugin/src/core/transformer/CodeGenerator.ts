import type { Feature, Scenario, Step, Background, Rule } from '~/types';

/**
 * Generate Vitest test code from Feature
 */
export class CodeGenerator {
  private runtimeModule: string;

  constructor(runtimeModule: string = '@deepracticex/vitest-cucumber') {
    this.runtimeModule = runtimeModule;
  }

  private hasBackground: boolean = false;

  /**
   * Generate test code for a feature
   */
  public generate(feature: Feature, stepFiles: string[] = []): string {
    // Track if feature has background to determine where to execute Before hooks
    this.hasBackground = !!feature.background;
    const lines: string[] = [];

    // Import statements
    lines.push(
      "import { describe, it, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';",
    );
    // IMPORTANT: Import from main entry point to ensure singleton module instance
    lines.push(
      `import { StepExecutor, ContextManager, DataTable, HookRegistry, StepRegistry, __setCurrentFeatureContext__ } from '${this.runtimeModule}';`,
    );
    lines.push('');

    // Create feature-scoped registries
    lines.push('// Create feature-scoped registries for test isolation');
    lines.push(
      'const __featureStepRegistry__ = StepRegistry.createFeatureScoped();',
    );
    lines.push(
      'const __featureHookRegistry__ = HookRegistry.createFeatureScoped();',
    );
    lines.push('');

    // Feature describe block
    lines.push(`describe('${this.escapeString(feature.name)}', () => {`);

    // Unhandled rejection handler (defined in describe scope)
    lines.push('');
    lines.push('  // Track unhandled rejections to prevent test hangs');
    lines.push('  const unhandledRejections = [];');
    lines.push('  const rejectionHandler = (error) => {');
    lines.push(
      '    console.error("[vitest-cucumber] Unhandled Promise Rejection:", error);',
    );
    lines.push('    unhandledRejections.push(error);');
    lines.push('  };');

    // Load step files in beforeAll to avoid ES module hoisting issues
    lines.push('');
    lines.push('  beforeAll(async () => {');
    lines.push('    // Register unhandled rejection handler');
    lines.push('    process.on("unhandledRejection", rejectionHandler);');
    lines.push('');
    lines.push('    // Load step definitions with feature context active');
    lines.push('    // Using dynamic import to avoid ES module hoisting');
    lines.push('    __setCurrentFeatureContext__({');
    lines.push('      stepRegistry: __featureStepRegistry__,');
    lines.push('      hookRegistry: __featureHookRegistry__,');
    lines.push('    });');
    lines.push('');

    // Dynamic imports for step files
    if (stepFiles.length > 0) {
      lines.push(
        '    // Import step definitions and hooks (registered to feature-scoped registries)',
      );
      for (const stepFile of stepFiles) {
        // Convert to forward slashes and remove .ts extension
        // Use absolute path with file:// protocol for ESM compatibility
        const normalizedPath = stepFile
          .replace(/\\/g, '/')
          .replace(/\.ts$/, '');
        // Vite needs absolute paths starting from project root with leading slash
        const importPath = normalizedPath.startsWith('/')
          ? normalizedPath
          : `/${normalizedPath}`;
        lines.push(`    await import('${importPath}');`);
      }
      lines.push('');
    }

    lines.push('    // Clear feature context after loading');
    lines.push('    __setCurrentFeatureContext__(null);');
    lines.push('');
    lines.push('    // Execute BeforeAll hooks');
    lines.push('    const contextManager = new ContextManager();');
    lines.push(
      "    await __featureHookRegistry__.executeHooks('BeforeAll', contextManager.getContext());",
    );
    lines.push('  });');
    lines.push('');
    lines.push('  afterAll(async () => {');
    lines.push('    // Remove unhandled rejection handler');
    lines.push('    process.off("unhandledRejection", rejectionHandler);');
    lines.push('');
    lines.push('    const contextManager = new ContextManager();');
    lines.push(
      "    await __featureHookRegistry__.executeHooks('AfterAll', contextManager.getContext());",
    );
    lines.push('');
    lines.push(
      '    // Clean up feature-scoped registries to prevent memory leaks and allow worker process to exit',
    );
    lines.push('    __featureHookRegistry__.clear();');
    lines.push('    __featureStepRegistry__.clear();');
    lines.push('  });');

    // Generate feature-level background
    if (feature.background) {
      lines.push(this.generateBackground(feature.background, 1));
    }

    // Generate scenarios
    for (const scenario of feature.scenarios) {
      if (scenario.isOutline && scenario.examples) {
        lines.push(this.generateScenarioOutline(scenario, 1));
      } else {
        lines.push(this.generateScenario(scenario, 1));
      }
    }

    // Generate rules
    if (feature.rules) {
      for (const rule of feature.rules) {
        lines.push(this.generateRule(rule, 1));
      }
    }

    lines.push('});');

    return lines.join('\n');
  }

  /**
   * Generate code for a scenario
   */
  private generateScenario(scenario: Scenario, indent: number): string {
    const lines: string[] = [];
    const ind = '  '.repeat(indent);

    lines.push('');
    lines.push(
      `${ind}it('${this.escapeString(scenario.name)}', async (context) => {`,
    );
    lines.push(`${ind}  // Reuse ContextManager from Background if available`);
    lines.push(
      `${ind}  const contextManager = context.contextManager || new ContextManager();`,
    );
    lines.push(`${ind}  const cucumberContext = contextManager.getContext();`);
    lines.push(
      `${ind}  const executor = new StepExecutor(cucumberContext, __featureStepRegistry__);`,
    );
    lines.push('');

    // Execute Before hooks if no Background (otherwise they run in beforeEach)
    if (!this.hasBackground) {
      lines.push(`${ind}  // Execute Before hooks`);
      lines.push(
        `${ind}  await __featureHookRegistry__.executeHooks('Before', cucumberContext);`,
      );
      lines.push('');
    }

    // Generate steps
    lines.push(`${ind}  // Execute steps`);
    for (const step of scenario.steps) {
      lines.push(this.generateStep(step, indent + 1));
    }

    // Execute After hooks
    lines.push(`${ind}  // Execute After hooks`);
    lines.push(
      `${ind}  await __featureHookRegistry__.executeHooks('After', cucumberContext);`,
    );

    lines.push(`${ind}});`);

    return lines.join('\n');
  }

  /**
   * Generate code for a step
   */
  private generateStep(step: Step, indent: number): string {
    const lines: string[] = [];
    const ind = '  '.repeat(indent);

    // Create step object
    lines.push(`${ind}await executor.execute({`);
    lines.push(`${ind}  keyword: '${step.keyword}',`);
    lines.push(`${ind}  text: '${this.escapeString(step.text)}',`);

    if (step.dataTable) {
      lines.push(
        `${ind}  dataTable: new DataTable(${JSON.stringify(step.dataTable.raw())}),`,
      );
    }

    if (step.docString) {
      lines.push(`${ind}  docString: {`);
      if (step.docString.contentType) {
        lines.push(
          `${ind}    contentType: '${this.escapeString(step.docString.contentType)}',`,
        );
      }
      lines.push(
        `${ind}    content: ${JSON.stringify(step.docString.content)}`,
      );
      lines.push(`${ind}  },`);
    }

    lines.push(`${ind}});`);
    lines.push('');

    return lines.join('\n');
  }

  /**
   * Escape string for JavaScript code
   */
  private escapeString(str: string): string {
    return str
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t');
  }

  /**
   * Generate code for a background block
   */
  private generateBackground(background: Background, indent: number): string {
    const lines: string[] = [];
    const ind = '  '.repeat(indent);

    lines.push('');
    lines.push(`${ind}beforeEach(async (context) => {`);
    lines.push(
      `${ind}  // Create shared ContextManager for Background and Scenario`,
    );
    lines.push(`${ind}  context.contextManager = new ContextManager();`);
    lines.push(
      `${ind}  const cucumberContext = context.contextManager.getContext();`,
    );
    lines.push('');

    // Execute Before hooks BEFORE Background steps (Cucumber standard)
    lines.push(`${ind}  // Execute Before hooks (must run before Background)`);
    lines.push(
      `${ind}  await __featureHookRegistry__.executeHooks('Before', cucumberContext);`,
    );
    lines.push('');

    // Now execute Background steps
    lines.push(
      `${ind}  const executor = new StepExecutor(cucumberContext, __featureStepRegistry__);`,
    );
    lines.push('');

    // Generate background steps
    for (const step of background.steps) {
      lines.push(this.generateStep(step, indent + 1));
    }

    lines.push(`${ind}});`);

    return lines.join('\n');
  }

  /**
   * Generate code for a rule block
   */
  private generateRule(rule: Rule, indent: number): string {
    const lines: string[] = [];
    const ind = '  '.repeat(indent);

    lines.push('');
    lines.push(`${ind}describe('${this.escapeString(rule.name)}', () => {`);

    // Generate rule-level background
    if (rule.background) {
      lines.push(this.generateBackground(rule.background, indent + 1));
    }

    // Generate scenarios in the rule
    for (const scenario of rule.scenarios) {
      if (scenario.isOutline && scenario.examples) {
        lines.push(this.generateScenarioOutline(scenario, indent + 1));
      } else {
        lines.push(this.generateScenario(scenario, indent + 1));
      }
    }

    lines.push(`${ind}});`);

    return lines.join('\n');
  }

  /**
   * Generate code for a scenario outline with examples
   */
  private generateScenarioOutline(scenario: Scenario, indent: number): string {
    const lines: string[] = [];
    const ind = '  '.repeat(indent);

    if (!scenario.examples || scenario.examples.length === 0) {
      return this.generateScenario(scenario, indent);
    }

    lines.push('');
    lines.push(`${ind}describe('${this.escapeString(scenario.name)}', () => {`);

    // Generate a test for each example row
    for (const exampleSet of scenario.examples) {
      const headers = exampleSet.headers;

      for (const row of exampleSet.rows) {
        // Create example map
        const exampleMap: Record<string, string> = {};
        headers.forEach((header, i) => {
          exampleMap[header] = row[i] || '';
        });

        // Create test name from example values
        const exampleDesc = headers
          .map((h) => `${h}=${exampleMap[h]}`)
          .join(', ');

        lines.push('');
        lines.push(
          `${ind}  it('Example: ${this.escapeString(exampleDesc)}', async (context) => {`,
        );
        lines.push(
          `${ind}    // Reuse ContextManager from Background if available`,
        );
        lines.push(
          `${ind}    const contextManager = context.contextManager || new ContextManager();`,
        );
        lines.push(
          `${ind}    const cucumberContext = contextManager.getContext();`,
        );
        lines.push(
          `${ind}    const executor = new StepExecutor(cucumberContext, __featureStepRegistry__);`,
        );
        lines.push('');

        // Execute Before hooks if no Background (otherwise they run in beforeEach)
        if (!this.hasBackground) {
          lines.push(`${ind}    // Execute Before hooks`);
          lines.push(
            `${ind}    await __featureHookRegistry__.executeHooks('Before', cucumberContext);`,
          );
          lines.push('');
        }

        // Generate steps with replaced placeholders
        lines.push(`${ind}    // Execute steps`);
        for (const step of scenario.steps) {
          const replacedStep = {
            ...step,
            text: this.replacePlaceholders(step.text, exampleMap),
          };
          lines.push(this.generateStep(replacedStep, indent + 2));
        }

        // Execute After hooks
        lines.push(`${ind}    // Execute After hooks`);
        lines.push(
          `${ind}    await __featureHookRegistry__.executeHooks('After', cucumberContext);`,
        );

        lines.push(`${ind}  });`);
      }
    }

    lines.push(`${ind}});`);

    return lines.join('\n');
  }

  /**
   * Replace placeholders in text with example values
   */
  private replacePlaceholders(
    text: string,
    example: Record<string, string>,
  ): string {
    let result = text;

    for (const [key, value] of Object.entries(example)) {
      const placeholder = `<${key}>`;
      result = result.replace(new RegExp(placeholder, 'g'), value);
    }

    return result;
  }
}
