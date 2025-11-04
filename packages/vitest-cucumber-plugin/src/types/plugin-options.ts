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
   * Directory or patterns for support files (hooks, world, custom types)
   * Support files are loaded BEFORE step definitions
   *
   * @default Auto-discovered from:
   * - Same parent as steps dir (e.g., if steps='tests/bdd/steps', checks 'tests/bdd/support')
   * - `${steps}/../support/**\/*.ts`
   * - `${steps}/support/**\/*.ts`
   * - Common fallbacks: 'tests/e2e/support', 'tests/support'
   *
   * @example
   * support: 'tests/bdd/support'          // Single directory
   * support: ['tests/support', 'src/test/support']  // Multiple directories
   */
  support?: string | string[];

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
