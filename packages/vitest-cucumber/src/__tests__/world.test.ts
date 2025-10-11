import { describe, it, expect, beforeEach } from 'vitest';
import { setWorldConstructor } from '../api/world';
import { ContextManager } from '../core/runtime/ContextManager';

describe('World Constructor', () => {
  beforeEach(() => {
    // Reset world constructor before each test
    setWorldConstructor(undefined as any);
  });

  it('should set custom world constructor', () => {
    interface CustomWorld {
      customProperty: string;
    }

    const worldFn = function (): CustomWorld {
      return {
        customProperty: 'test-value',
      };
    };

    setWorldConstructor(worldFn);

    const manager = new ContextManager();
    const context = manager.getContext();

    expect(context.customProperty).toBe('test-value');
  });

  it('should create default context when no constructor set', () => {
    const manager = new ContextManager();
    const context = manager.getContext();

    expect(context).toBeDefined();
    expect(typeof context).toBe('object');
  });

  it('should allow adding properties to context', () => {
    const manager = new ContextManager();
    const context = manager.getContext();

    context.testProperty = 'test-value';

    expect(context.testProperty).toBe('test-value');
  });

  it('should preserve context properties', () => {
    interface MyWorld {
      counter: number;
      increment(): void;
    }

    setWorldConstructor(function (): MyWorld {
      return {
        counter: 0,
        increment() {
          this.counter++;
        },
      };
    });

    const manager = new ContextManager();
    const context = manager.getContext();

    context.increment();
    context.increment();

    expect(context.counter).toBe(2);
  });
});
