import type { StepDefinition, StepType } from '~/types';
import {
  ParameterTypeConverter,
  type ParameterInfo,
} from './ParameterTypeConverter';
import type { HookRegistry } from './HookRegistry';

/**
 * Extended step definition with parameter type information
 */
export interface ExtendedStepDefinition extends StepDefinition {
  parameterTypes: ParameterInfo[];
  regex: RegExp;
}

/**
 * Feature context for isolation
 */
export interface FeatureContext {
  stepRegistry: StepRegistry;
  hookRegistry: HookRegistry;
}

// Feature context state (set during step file loading)
let __CURRENT_FEATURE_CONTEXT__: FeatureContext | null = null;
let __WARNING_SHOWN__ = false;
let __REGISTRATION_WARNING_SHOWN__ = false;

// Global type augmentation
declare global {
  var __VITEST_CUCUMBER_STEP_REGISTRY__: StepRegistry | undefined;
}

/**
 * Global registry for step definitions with feature-scoped isolation support
 */
export class StepRegistry {
  private steps: ExtendedStepDefinition[] = [];
  private isFeatureScoped: boolean = false;

  private constructor(isFeatureScoped: boolean = false) {
    this.isFeatureScoped = isFeatureScoped;
  }

  /**
   * Get the singleton instance (with feature context support)
   */
  public static getInstance(): StepRegistry {
    // Priority 1: Use feature context if available (modern mode)
    if (__CURRENT_FEATURE_CONTEXT__) {
      return __CURRENT_FEATURE_CONTEXT__.stepRegistry;
    }

    // Priority 2: Fall back to global singleton (legacy mode)
    if (!globalThis.__VITEST_CUCUMBER_STEP_REGISTRY__) {
      globalThis.__VITEST_CUCUMBER_STEP_REGISTRY__ = new StepRegistry(false);
    }

    // Warn about legacy usage (only in development, only once)
    if (
      !__WARNING_SHOWN__ &&
      process.env.NODE_ENV !== 'test' &&
      process.env.NODE_ENV !== 'production'
    ) {
      __WARNING_SHOWN__ = true;
      console.warn(
        '\n⚠️  [vitest-cucumber] Step definitions are being registered outside of feature context.\n' +
          '   This may cause memory leaks in long-running test suites.\n' +
          '\n' +
          '   Common causes:\n' +
          '   1. Calling StepRegistry.getInstance() at module top-level\n' +
          '   2. Importing step files outside of generated test code\n' +
          '\n' +
          '   Recommended: Use Given/When/Then APIs directly instead of getInstance().\n' +
          '   See: https://github.com/Deepractice/EnhancedVitest/wiki/Best-Practices\n',
      );
    }

    return globalThis.__VITEST_CUCUMBER_STEP_REGISTRY__;
  }

  /**
   * Create a new feature-scoped registry (called by CodeGenerator)
   */
  public static createFeatureScoped(): StepRegistry {
    return new StepRegistry(true);
  }

  /**
   * Register a step definition
   */
  public register(step: StepDefinition): void {
    // Warn if registering to global registry (legacy mode)
    if (
      !this.isFeatureScoped &&
      !__REGISTRATION_WARNING_SHOWN__ &&
      process.env.NODE_ENV !== 'test' &&
      process.env.NODE_ENV !== 'production'
    ) {
      __REGISTRATION_WARNING_SHOWN__ = true;
      console.warn(
        '\n⚠️  [vitest-cucumber] Step registered to global registry.\n' +
          '   This is deprecated and may cause issues in future versions.\n' +
          '\n' +
          '   Location: ' +
          step.pattern.toString() +
          '\n' +
          '\n' +
          '   Please ensure your step files are only imported by generated test code.\n',
      );
    }

    // Extract parameter types and convert to regex if needed
    const parameterTypes = ParameterTypeConverter.extractParameterTypes(
      step.pattern,
    );

    const regex =
      typeof step.pattern === 'string'
        ? ParameterTypeConverter.cucumberExpressionToRegex(step.pattern)
        : step.pattern;

    const extendedStep: ExtendedStepDefinition = {
      ...step,
      parameterTypes,
      regex,
    };

    // Check for duplicates (warn only, don't block)
    const existing = this.steps.find(
      (s) =>
        s.pattern.toString() === step.pattern.toString() &&
        s.type === step.type,
    );

    if (
      existing &&
      process.env.NODE_ENV !== 'test' &&
      process.env.NODE_ENV !== 'production'
    ) {
      console.warn(
        '\n⚠️  [vitest-cucumber] Duplicate step definition detected.\n' +
          '   Type: ' +
          step.type +
          '\n' +
          '   Pattern: ' +
          step.pattern.toString() +
          '\n' +
          '\n' +
          '   This may indicate that step files are being imported multiple times.\n' +
          '   Each step should only be defined once.\n',
      );
    }

    this.steps.push(extendedStep);
  }

  /**
   * Find a step definition that matches the given text
   */
  public findMatch(
    type: StepType,
    text: string,
  ): { step: ExtendedStepDefinition; matches: RegExpMatchArray | null } | null {
    for (const step of this.steps) {
      // Skip if type doesn't match (except for And/But which inherit from previous)
      if (type !== 'And' && type !== 'But' && step.type !== type) {
        continue;
      }

      // Use the compiled regex for matching
      const matches = text.match(step.regex);
      if (matches) {
        return { step, matches };
      }
    }

    return null;
  }

  /**
   * Clear all registered steps (useful for testing and cleanup)
   */
  public clear(): void {
    this.steps = [];
  }

  /**
   * Get all registered steps
   */
  public getAll(): ExtendedStepDefinition[] {
    return [...this.steps];
  }
}

/**
 * Set current feature context (called by CodeGenerator)
 * @internal
 */
export function __setCurrentFeatureContext__(context: FeatureContext | null) {
  __CURRENT_FEATURE_CONTEXT__ = context;

  // Reset warning flag when entering new feature context
  if (context) {
    __WARNING_SHOWN__ = false;
  }
}

/**
 * Get current feature context (for debugging and testing)
 * @internal
 */
export function __getCurrentFeatureContext__(): FeatureContext | null {
  return __CURRENT_FEATURE_CONTEXT__;
}

/**
 * Reset warning flag (for testing)
 * @internal
 */
export function __resetWarningFlag__() {
  __WARNING_SHOWN__ = false;
  __REGISTRATION_WARNING_SHOWN__ = false;
}
