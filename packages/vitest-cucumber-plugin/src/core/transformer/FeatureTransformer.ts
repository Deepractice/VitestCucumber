import { FeatureParser } from '~/core/parser';
import { CodeGenerator } from './CodeGenerator';
import { globSync } from 'glob';

/**
 * Main transformation orchestrator
 */
export class FeatureTransformer {
  private parser: FeatureParser;
  private generator: CodeGenerator;
  private stepsDir: string;
  private supportDirs?: string | string[];

  constructor(
    stepsDir: string = 'tests/steps',
    runtimeModule: string = '@deepracticex/vitest-cucumber',
    supportDirs?: string | string[],
  ) {
    this.parser = new FeatureParser();
    this.stepsDir = stepsDir;
    this.supportDirs = supportDirs;
    this.generator = new CodeGenerator(runtimeModule);
  }

  /**
   * Transform feature file content to test code
   */
  public transform(content: string, _featureFilePath: string): string {
    // Parse feature file
    const feature = this.parser.parse(content);

    // Find step definition files
    const stepFiles = this.discoverStepFiles();

    // Generate test code with step imports
    const code = this.generator.generate(feature, stepFiles);

    return code;
  }

  /**
   * Discover step definition files with support files loaded first
   */
  private discoverStepFiles(): string[] {
    // Phase 1: Build support file patterns
    const supportPatterns: string[] = [];

    if (this.supportDirs) {
      // User explicitly configured support directories
      const dirs = Array.isArray(this.supportDirs)
        ? this.supportDirs
        : [this.supportDirs];
      dirs.forEach((dir) => {
        supportPatterns.push(`${dir}/**/*.ts`);
      });
    } else {
      // Auto-discovery: smart detection based on steps directory structure
      // Example: if steps='tests/bdd/steps', check 'tests/bdd/support'
      const parentDir = this.stepsDir.replace(/\/steps\/?$/, ''); // Remove /steps suffix

      supportPatterns.push(
        // 1. Sibling support directory (same parent as steps)
        `${parentDir}/support/**/*.ts`,

        // 2. Support subdirectory under steps
        `${this.stepsDir}/**/support/**/*.ts`,

        // 3. Common fallback locations
        'tests/e2e/support/**/*.ts',
        'tests/support/**/*.ts',
        'tests/bdd/support/**/*.ts',
      );
    }

    // Phase 2: Discover step definition files
    const stepPatterns = [
      `${this.stepsDir}/**/*.steps.ts`,
      `${this.stepsDir}/**/*.ts`,
      'tests/e2e/steps/**/*.ts',
    ];

    const supportFiles = this.findAndSortFiles(supportPatterns);
    const stepFiles = this.findAndSortFiles(stepPatterns);

    // Remove duplicates: exclude support files from step files
    const uniqueStepFiles = stepFiles.filter(
      (f) => !supportFiles.includes(f) && !f.includes('/support/'),
    );

    // Return with guaranteed order: support files FIRST, then step files
    return [...supportFiles, ...uniqueStepFiles];
  }

  /**
   * Find and sort files matching the given patterns
   */
  private findAndSortFiles(patterns: string[]): string[] {
    const files = new Set<string>();

    for (const pattern of patterns) {
      try {
        const matches = globSync(pattern, {
          absolute: false,
          cwd: process.cwd(),
        }).sort(); // Sort alphabetically for deterministic order

        matches.forEach((f) => files.add(f));
      } catch (error) {
        // Ignore errors for patterns that don't match
      }
    }

    return Array.from(files).sort(); // Ensure consistent order
  }
}
