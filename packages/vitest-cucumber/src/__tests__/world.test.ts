import { describe, it, expect, beforeEach } from 'vitest';
import { setWorldConstructor } from '../api/world';
import { ContextManager } from '../core/runtime/ContextManager';

describe('World Constructor', () => {
  beforeEach(() => {
    // Reset world constructor before each test
    globalThis.__VITEST_CUCUMBER_WORLD_FACTORY__ = undefined;
  });

  describe('ES6 Class Constructor Pattern (Standard Cucumber.js)', () => {
    it('should support ES6 class with methods', () => {
      class CustomWorld {
        public value: number;
        public items: string[];

        constructor() {
          this.value = 10;
          this.items = [];
        }

        increment() {
          this.value++;
        }

        addItem(item: string) {
          this.items.push(item);
        }

        getTotal() {
          return this.value + this.items.length;
        }
      }

      setWorldConstructor(CustomWorld);

      const manager = new ContextManager();
      const context = manager.getContext() as CustomWorld;

      expect(context.value).toBe(10);
      expect(context.items).toEqual([]);

      context.increment();
      context.addItem('test');

      expect(context.value).toBe(11);
      expect(context.items).toEqual(['test']);
      expect(context.getTotal()).toBe(12);
    });

    it('should support class with bound methods', () => {
      class CustomWorld {
        public counter: number;

        constructor() {
          this.counter = 0;
          // Bind methods in constructor
          this.increment = this.increment.bind(this);
        }

        increment() {
          this.counter++;
        }
      }

      setWorldConstructor(CustomWorld);

      const manager = new ContextManager();
      const context = manager.getContext() as CustomWorld;

      // Test bound method
      const incrementFn = context.increment;
      incrementFn();
      incrementFn();

      expect(context.counter).toBe(2);
    });

    it('should support class with getters and setters', () => {
      class CustomWorld {
        private _value: number = 0;

        get value() {
          return this._value;
        }

        set value(val: number) {
          this._value = val;
        }

        increment() {
          this._value++;
        }
      }

      setWorldConstructor(CustomWorld);

      const manager = new ContextManager();
      const context = manager.getContext() as CustomWorld;

      expect(context.value).toBe(0);
      context.value = 5;
      expect(context.value).toBe(5);
      context.increment();
      expect(context.value).toBe(6);
    });
  });

  describe('ES5 Constructor Function Pattern', () => {
    it('should support ES5 constructor with prototype methods', () => {
      function CustomWorld(this: any) {
        this.value = 42;
        this.data = [];
      }

      CustomWorld.prototype.addData = function (item: any) {
        this.data.push(item);
      };

      CustomWorld.prototype.getValue = function () {
        return this.value;
      };

      setWorldConstructor(CustomWorld as any);

      const manager = new ContextManager();
      const context = manager.getContext();

      expect(context.value).toBe(42);
      expect(context.data).toEqual([]);

      context.addData('item1');
      context.addData('item2');

      expect(context.data).toEqual(['item1', 'item2']);
      expect(context.getValue()).toBe(42);
    });
  });

  describe('Factory Function Patterns', () => {
    it('should support arrow function factory', () => {
      interface CustomWorld {
        customProperty: string;
      }

      setWorldConstructor(() => ({
        customProperty: 'test-value',
      }));

      const manager = new ContextManager();
      const context = manager.getContext() as CustomWorld;

      expect(context.customProperty).toBe('test-value');
    });

    it('should support regular function factory', () => {
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
      const context = manager.getContext() as MyWorld;

      context.increment();
      context.increment();

      expect(context.counter).toBe(2);
    });

    it('should support factory with closure state', () => {
      interface MyWorld {
        getInstanceId(): number;
        increment(): void;
      }

      let instanceCounter = 0;

      setWorldConstructor(function (): MyWorld {
        const instanceId = ++instanceCounter;
        let counter = 0;

        return {
          getInstanceId() {
            return instanceId;
          },
          increment() {
            counter++;
          },
        };
      });

      const manager1 = new ContextManager();
      const context1 = manager1.getContext() as MyWorld;

      const manager2 = new ContextManager();
      const context2 = manager2.getContext() as MyWorld;

      expect(context1.getInstanceId()).toBe(1);
      expect(context2.getInstanceId()).toBe(2);
    });
  });

  describe('Default Behavior', () => {
    it('should create default context when no constructor set', () => {
      const manager = new ContextManager();
      const context = manager.getContext();

      expect(context).toBeDefined();
      expect(typeof context).toBe('object');
    });

    it('should allow adding properties to default context', () => {
      const manager = new ContextManager();
      const context = manager.getContext();

      context.testProperty = 'test-value';

      expect(context.testProperty).toBe('test-value');
    });
  });

  describe('Error Handling', () => {
    it('should throw error for non-function input', () => {
      expect(() => {
        setWorldConstructor('not a function' as any);
      }).toThrow(TypeError);

      expect(() => {
        setWorldConstructor(123 as any);
      }).toThrow(TypeError);

      expect(() => {
        setWorldConstructor(null as any);
      }).toThrow(TypeError);
    });
  });

  describe('Context Isolation', () => {
    it('should create separate instances for each ContextManager', () => {
      class CustomWorld {
        public counter: number = 0;

        increment() {
          this.counter++;
        }
      }

      setWorldConstructor(CustomWorld);

      const manager1 = new ContextManager();
      const context1 = manager1.getContext() as CustomWorld;

      const manager2 = new ContextManager();
      const context2 = manager2.getContext() as CustomWorld;

      context1.increment();
      context1.increment();

      expect(context1.counter).toBe(2);
      expect(context2.counter).toBe(0); // Should be isolated
    });

    it('should reset context when calling reset()', () => {
      class CustomWorld {
        public value: number = 100;

        double() {
          this.value *= 2;
        }
      }

      setWorldConstructor(CustomWorld);

      const manager = new ContextManager();
      const context1 = manager.getContext() as CustomWorld;

      context1.double();
      expect(context1.value).toBe(200);

      manager.reset();
      const context2 = manager.getContext() as CustomWorld;

      expect(context2.value).toBe(100); // Should be fresh instance
    });
  });
});
