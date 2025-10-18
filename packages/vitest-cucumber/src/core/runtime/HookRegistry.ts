import type { StepContext } from '~/types';
import { __getCurrentFeatureContext__ } from './StepRegistry';

/**
 * Hook function type
 */
export type HookFunction = (this: StepContext) => void | Promise<void>;

/**
 * Hook definition
 */
export interface HookDefinition {
  type: 'Before' | 'After' | 'BeforeAll' | 'AfterAll';
  fn: HookFunction;
}

// Global type augmentation
declare global {
  var __VITEST_CUCUMBER_HOOK_REGISTRY__: HookRegistry | undefined;
}

/**
 * Global registry for Cucumber hooks with feature-scoped isolation support
 */
export class HookRegistry {
  private hooks: HookDefinition[] = [];

  private constructor() {}

  /**
   * Get the singleton instance (with feature context support)
   */
  public static getInstance(): HookRegistry {
    // Priority 1: Use feature context if available (modern mode)
    const featureContext = __getCurrentFeatureContext__();
    if (featureContext) {
      return featureContext.hookRegistry;
    }

    // Priority 2: Fall back to global singleton (legacy mode)
    if (!globalThis.__VITEST_CUCUMBER_HOOK_REGISTRY__) {
      globalThis.__VITEST_CUCUMBER_HOOK_REGISTRY__ = new HookRegistry();
    }
    return globalThis.__VITEST_CUCUMBER_HOOK_REGISTRY__;
  }

  /**
   * Create a new feature-scoped registry (called by CodeGenerator)
   */
  public static createFeatureScoped(): HookRegistry {
    return new HookRegistry();
  }

  /**
   * Register a hook
   */
  public register(hook: HookDefinition): void {
    this.hooks.push(hook);
  }

  /**
   * Get all hooks of a specific type
   */
  public getHooks(
    type: 'Before' | 'After' | 'BeforeAll' | 'AfterAll',
  ): HookDefinition[] {
    return this.hooks.filter((hook) => hook.type === type);
  }

  /**
   * Execute all hooks of a specific type
   */
  public async executeHooks(
    type: 'Before' | 'After' | 'BeforeAll' | 'AfterAll',
    context: StepContext,
  ): Promise<void> {
    const hooks = this.getHooks(type);
    for (const hook of hooks) {
      await hook.fn.call(context);
    }
  }

  /**
   * Clear all registered hooks (useful for testing)
   */
  public clear(): void {
    this.hooks = [];
  }

  /**
   * Get all registered hooks
   */
  public getAll(): HookDefinition[] {
    return [...this.hooks];
  }
}
