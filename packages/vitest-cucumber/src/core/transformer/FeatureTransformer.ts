import { FeatureParser } from '~/core/parser';
import { CodeGenerator } from './CodeGenerator';
import { globSync } from 'glob';
import { resolve, dirname } from 'node:path';

/**
 * Main transformation orchestrator
 */
export class FeatureTransformer {
  private parser: FeatureParser;
  private generator: CodeGenerator;
  private stepsDir: string;

  constructor(stepsDir: string = 'tests/steps') {
    this.parser = new FeatureParser();
    this.stepsDir = stepsDir;
    this.generator = new CodeGenerator();
  }

  /**
   * Transform feature file content to test code
   */
  public transform(content: string, featureFilePath: string): string {
    // Parse feature file
    const feature = this.parser.parse(content);

    // Find step definition files relative to the feature file
    const featureDir = dirname(featureFilePath);
    const stepFiles = this.discoverStepFiles(featureDir);

    // Generate test code with step imports
    const code = this.generator.generate(feature, stepFiles);

    return code;
  }

  /**
   * Discover step definition files
   */
  private discoverStepFiles(featureDir: string): string[] {
    // Try multiple possible step locations
    const patterns = [
      `${this.stepsDir}/**/*.steps.ts`,
      `${this.stepsDir}/**/*.ts`,
      `tests/e2e/steps/**/*.ts`,
      `tests/e2e/support/**/*.ts`,
    ];

    const stepFiles = new Set<string>();

    for (const pattern of patterns) {
      try {
        const files = globSync(pattern, {
          absolute: false,
          cwd: process.cwd(),
        });
        files.forEach((f) => stepFiles.add(f));
      } catch (error) {
        // Ignore errors for patterns that don't match
      }
    }

    return Array.from(stepFiles);
  }
}
