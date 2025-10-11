import type { StepContext } from "~/types";

// Use globalThis to share World factory across modules
declare global {
  var __VITEST_CUCUMBER_WORLD_FACTORY__: (() => any) | undefined;
}

/**
 * Manages step context (this binding)
 */
export class ContextManager {
  private context: StepContext;

  constructor() {
    this.context = this.createContext();
  }

  /**
   * Create context using registered World factory or default empty object
   */
  private createContext(): StepContext {
    const factory = globalThis.__VITEST_CUCUMBER_WORLD_FACTORY__;
    return factory ? factory() : {};
  }

  /**
   * Get the context object
   */
  public getContext(): StepContext {
    return this.context;
  }

  /**
   * Reset the context (creates new World instance)
   */
  public reset(): void {
    this.context = this.createContext();
  }

  /**
   * Set a value in the context
   */
  public set(key: string, value: any): void {
    this.context[key] = value;
  }

  /**
   * Get a value from the context
   */
  public get(key: string): any {
    return this.context[key];
  }
}
