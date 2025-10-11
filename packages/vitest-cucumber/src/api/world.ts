/**
 * World configuration API
 */

/**
 * Register a World factory function that will be used to create
 * context for each scenario.
 *
 * @example
 * ```typescript
 * interface MyWorld {
 *   value: string;
 *   set(key: string, val: any): void;
 * }
 *
 * setWorldConstructor(function(): MyWorld {
 *   return {
 *     value: '',
 *     set(key, val) { this[key] = val; }
 *   };
 * });
 * ```
 */
export function setWorldConstructor<T = any>(factory: () => T): void {
  globalThis.__VITEST_CUCUMBER_WORLD_FACTORY__ = factory;
}
