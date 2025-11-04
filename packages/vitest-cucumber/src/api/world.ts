/**
 * World configuration API
 */

/**
 * Type representing various World constructor patterns
 * - Class constructor (ES6 class or ES5 constructor function)
 * - Factory function (arrow or regular function returning object)
 */
export type WorldConstructor<T = any> = (new () => T) | (() => T);

/**
 * Check if a function is a class/constructor (has prototype properties)
 */
function isConstructor(fn: Function): boolean {
  // Arrow functions cannot be constructors
  if (!fn.prototype) {
    return false;
  }

  // Check if prototype has constructor property
  if (fn.prototype.constructor === fn) {
    return true;
  }

  // Check if prototype has custom properties (methods)
  const protoProps = Object.getOwnPropertyNames(fn.prototype);
  return (
    protoProps.length > 1 ||
    (protoProps.length === 1 && protoProps[0] !== 'constructor')
  );
}

/**
 * Register a World constructor or factory function that will be used to create
 * context for each scenario.
 *
 * Supports multiple patterns for maximum Cucumber.js compatibility:
 *
 * @example ES6 Class (Standard Cucumber.js pattern)
 * ```typescript
 * class CustomWorld {
 *   value: number;
 *   constructor() {
 *     this.value = 0;
 *   }
 *   increment() {
 *     this.value++;
 *   }
 * }
 * setWorldConstructor(CustomWorld);
 * ```
 *
 * @example ES5 Constructor Function
 * ```typescript
 * function CustomWorld() {
 *   this.value = 0;
 * }
 * CustomWorld.prototype.increment = function() {
 *   this.value++;
 * };
 * setWorldConstructor(CustomWorld);
 * ```
 *
 * @example Factory Function (arrow)
 * ```typescript
 * setWorldConstructor(() => ({
 *   value: 0,
 *   increment() { this.value++; }
 * }));
 * ```
 *
 * @example Factory Function (regular)
 * ```typescript
 * setWorldConstructor(function() {
 *   return {
 *     value: 0,
 *     increment() { this.value++; }
 *   };
 * });
 * ```
 */
export function setWorldConstructor<T = any>(
  constructorOrFactory: WorldConstructor<T>,
): void {
  if (typeof constructorOrFactory !== 'function') {
    throw new TypeError(
      'setWorldConstructor expects a constructor or factory function, ' +
        `but received: ${typeof constructorOrFactory}`,
    );
  }

  // Detect constructor vs factory function
  if (isConstructor(constructorOrFactory)) {
    // It's a constructor (class or ES5 function) - wrap in factory
    globalThis.__VITEST_CUCUMBER_WORLD_FACTORY__ = () =>
      new (constructorOrFactory as new () => T)();
  } else {
    // It's a factory function - use directly
    globalThis.__VITEST_CUCUMBER_WORLD_FACTORY__ =
      constructorOrFactory as () => T;
  }
}
