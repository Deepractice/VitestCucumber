/**
 * Configuration options for the Vitest Cucumber plugin
 */
export interface VitestCucumberPluginOptions {
  /**
   * Glob patterns to match feature files
   * @default ['**\/*.feature']
   */
  features?: string[];

  /**
   * Directory containing step definitions
   * @default 'tests/steps'
   */
  steps?: string;

  /**
   * Module path for runtime imports in generated code
   * @default '@deepracticex/vitest-cucumber'
   * @example '@deepracticex/testing-utils/cucumber'
   */
  runtimeModule?: string;

  /**
   * Enable verbose logging
   * @default false
   */
  verbose?: boolean;
}
