import { setWorldConstructor } from '@deepracticex/vitest-cucumber';

console.log('[SUPPORT] world.ts loaded');

/**
 * Custom World class - Standard Cucumber.js pattern
 *
 * This example demonstrates the ES6 class pattern which is the standard
 * way to define World in Cucumber.js. It provides better type safety,
 * proper `this` binding, and cleaner code organization.
 */
export class CustomWorld {
  public hookExecuted?: boolean;
  public initializedData?: {
    message: string;
    timestamp: number;
  };

  constructor() {
    console.log('[WORLD] CustomWorld instance created');
    this.hookExecuted = undefined;
    this.initializedData = undefined;
  }

  /**
   * Custom method only available if World is loaded from support
   */
  getCustomMessage(): string {
    return 'This method comes from support/world.ts';
  }

  /**
   * Verify that hooks have executed properly
   */
  verifyHookExecution(): boolean {
    return this.hookExecuted === true;
  }
}

// Register the World class - Standard Cucumber.js API
setWorldConstructor(CustomWorld);

/**
 * Alternative: Factory function pattern (also supported)
 *
 * If you prefer the factory function pattern, you can use:
 *
 * setWorldConstructor(() => ({
 *   hookExecuted: undefined,
 *   initializedData: undefined,
 *   getCustomMessage() {
 *     return 'This method comes from support/world.ts';
 *   },
 *   verifyHookExecution() {
 *     return this.hookExecuted === true;
 *   }
 * }));
 */
