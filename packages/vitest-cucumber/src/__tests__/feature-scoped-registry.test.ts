import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  StepRegistry,
  __setCurrentFeatureContext__,
  __getCurrentFeatureContext__,
} from '~/core/runtime/StepRegistry';
import { HookRegistry } from '~/core/runtime/HookRegistry';

describe('Feature-scoped Registry', () => {
  beforeEach(() => {
    // Clear global registry
    (globalThis as any).__VITEST_CUCUMBER_STEP_REGISTRY__ = undefined;
    (globalThis as any).__VITEST_CUCUMBER_HOOK_REGISTRY__ = undefined;
    // Clear feature context
    __setCurrentFeatureContext__(null);
  });

  afterEach(() => {
    __setCurrentFeatureContext__(null);
  });

  describe('StepRegistry.createFeatureScoped()', () => {
    it('should create a new feature-scoped registry instance', () => {
      const registry1 = StepRegistry.createFeatureScoped();
      const registry2 = StepRegistry.createFeatureScoped();

      expect(registry1).not.toBe(registry2);
      expect(registry1.getAll()).toEqual([]);
      expect(registry2.getAll()).toEqual([]);
    });

    it('should create registry with isFeatureScoped flag', () => {
      const registry = StepRegistry.createFeatureScoped();

      // Register a step
      registry.register({
        type: 'Given',
        pattern: 'test pattern',
        fn: function () {},
      });

      expect(registry.getAll()).toHaveLength(1);
    });
  });

  describe('Feature context isolation', () => {
    it('should isolate steps between different features', () => {
      // Feature 1
      const registry1 = StepRegistry.createFeatureScoped();
      const hookRegistry1 = HookRegistry.createFeatureScoped();

      __setCurrentFeatureContext__({
        stepRegistry: registry1,
        hookRegistry: hookRegistry1,
      });

      const step1Registry = StepRegistry.getInstance();
      step1Registry.register({
        type: 'Given',
        pattern: 'feature 1 step',
        fn: function () {},
      });

      expect(registry1.getAll()).toHaveLength(1);

      // Feature 2
      const registry2 = StepRegistry.createFeatureScoped();
      const hookRegistry2 = HookRegistry.createFeatureScoped();

      __setCurrentFeatureContext__({
        stepRegistry: registry2,
        hookRegistry: hookRegistry2,
      });

      const step2Registry = StepRegistry.getInstance();
      step2Registry.register({
        type: 'Given',
        pattern: 'feature 2 step',
        fn: function () {},
      });

      // Verify isolation
      expect(registry1.getAll()).toHaveLength(1);
      expect(registry2.getAll()).toHaveLength(1);
      expect(registry1.getAll()[0].pattern).toBe('feature 1 step');
      expect(registry2.getAll()[0].pattern).toBe('feature 2 step');
    });

    it('should clean up properly after feature execution', () => {
      const registry = StepRegistry.createFeatureScoped();
      const hookRegistry = HookRegistry.createFeatureScoped();

      __setCurrentFeatureContext__({
        stepRegistry: registry,
        hookRegistry: hookRegistry,
      });

      StepRegistry.getInstance().register({
        type: 'Given',
        pattern: 'test step',
        fn: function () {},
      });

      expect(registry.getAll()).toHaveLength(1);

      // Simulate feature completion
      registry.clear();
      __setCurrentFeatureContext__(null);

      expect(registry.getAll()).toHaveLength(0);
      expect(__getCurrentFeatureContext__()).toBeNull();
    });
  });

  describe('Context priority', () => {
    it('should prioritize feature context over global singleton', () => {
      // Create global singleton
      const globalRegistry = StepRegistry.getInstance();
      globalRegistry.register({
        type: 'Given',
        pattern: 'global step',
        fn: function () {},
      });

      // Create feature context
      const featureRegistry = StepRegistry.createFeatureScoped();
      const hookRegistry = HookRegistry.createFeatureScoped();

      __setCurrentFeatureContext__({
        stepRegistry: featureRegistry,
        hookRegistry: hookRegistry,
      });

      // getInstance should return feature registry
      const currentRegistry = StepRegistry.getInstance();
      expect(currentRegistry).toBe(featureRegistry);
      expect(currentRegistry.getAll()).toHaveLength(0);

      // Register to feature context
      currentRegistry.register({
        type: 'Given',
        pattern: 'feature step',
        fn: function () {},
      });

      // Global should be unchanged
      expect(globalRegistry.getAll()).toHaveLength(1);
      expect(featureRegistry.getAll()).toHaveLength(1);
    });

    it('should fall back to global singleton when no feature context', () => {
      const registry1 = StepRegistry.getInstance();
      const registry2 = StepRegistry.getInstance();

      expect(registry1).toBe(registry2);
      expect(globalThis.__VITEST_CUCUMBER_STEP_REGISTRY__).toBeDefined();
    });
  });

  describe('Backward compatibility', () => {
    it('should support legacy global singleton mode', () => {
      const registry = StepRegistry.getInstance();

      registry.register({
        type: 'Given',
        pattern: 'legacy step',
        fn: function () {},
      });

      expect(registry.getAll()).toHaveLength(1);
      expect(globalThis.__VITEST_CUCUMBER_STEP_REGISTRY__).toBe(registry);
    });

    it('should allow mixing legacy and feature-scoped modes', () => {
      // Register to global
      const globalRegistry = StepRegistry.getInstance();
      globalRegistry.register({
        type: 'Given',
        pattern: 'global step',
        fn: function () {},
      });

      // Create feature context
      const featureRegistry = StepRegistry.createFeatureScoped();
      __setCurrentFeatureContext__({
        stepRegistry: featureRegistry,
        hookRegistry: HookRegistry.createFeatureScoped(),
      });

      // Register to feature
      StepRegistry.getInstance().register({
        type: 'Given',
        pattern: 'feature step',
        fn: function () {},
      });

      // Clear context
      __setCurrentFeatureContext__(null);

      // Should fall back to global
      const current = StepRegistry.getInstance();
      expect(current).toBe(globalRegistry);
      expect(current.getAll()).toHaveLength(1);
    });
  });
});
