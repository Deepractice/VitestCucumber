import { describe, it, expect, beforeEach } from 'vitest';
import { Before, After, BeforeAll, AfterAll } from '../api/hooks';
import { HookRegistry } from '../core/runtime/HookRegistry';

describe('Hooks API', () => {
  beforeEach(() => {
    // Clear registry before each test
    HookRegistry.getInstance().clear();
  });

  it('should register BeforeAll hook', () => {
    const hookFn = async function () {
      return 'before-all';
    };

    BeforeAll(hookFn);

    const registry = HookRegistry.getInstance();
    const hooks = registry.getHooks('BeforeAll');

    expect(hooks).toHaveLength(1);
  });

  it('should register Before hook', () => {
    const hookFn = async function () {
      return 'before';
    };

    Before(hookFn);

    const registry = HookRegistry.getInstance();
    const hooks = registry.getHooks('Before');

    expect(hooks).toHaveLength(1);
  });

  it('should register After hook', () => {
    const hookFn = async function () {
      return 'after';
    };

    After(hookFn);

    const registry = HookRegistry.getInstance();
    const hooks = registry.getHooks('After');

    expect(hooks).toHaveLength(1);
  });

  it('should register AfterAll hook', () => {
    const hookFn = async function () {
      return 'after-all';
    };

    AfterAll(hookFn);

    const registry = HookRegistry.getInstance();
    const hooks = registry.getHooks('AfterAll');

    expect(hooks).toHaveLength(1);
  });

  it('should register multiple hooks of same type', () => {
    Before(async function () {});
    Before(async function () {});
    Before(async function () {});

    const registry = HookRegistry.getInstance();
    const hooks = registry.getHooks('Before');

    expect(hooks).toHaveLength(3);
  });

  it('should register hooks of different types', () => {
    BeforeAll(async function () {});
    Before(async function () {});
    After(async function () {});
    AfterAll(async function () {});

    const registry = HookRegistry.getInstance();

    expect(registry.getHooks('BeforeAll')).toHaveLength(1);
    expect(registry.getHooks('Before')).toHaveLength(1);
    expect(registry.getHooks('After')).toHaveLength(1);
    expect(registry.getHooks('AfterAll')).toHaveLength(1);
  });
});
