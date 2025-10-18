import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  StepRegistry,
  __setCurrentFeatureContext__,
  __resetWarningFlag__,
} from '~/core/runtime/StepRegistry';
import { HookRegistry } from '~/core/runtime/HookRegistry';

describe('Registry Warning System', () => {
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    // Clear global registry
    (globalThis as any).__VITEST_CUCUMBER_STEP_REGISTRY__ = undefined;
    (globalThis as any).__VITEST_CUCUMBER_HOOK_REGISTRY__ = undefined;
    __setCurrentFeatureContext__(null);
    __resetWarningFlag__();
    // Set to development mode for warnings
    process.env.NODE_ENV = 'development';
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
    __setCurrentFeatureContext__(null);
    __resetWarningFlag__();
    process.env.NODE_ENV = originalEnv;
  });

  describe('getInstance() without feature context', () => {
    it('should warn when getInstance() called without feature context', () => {
      StepRegistry.getInstance();

      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('outside of feature context'),
      );
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('memory leaks'),
      );
    });

    it('should NOT warn when getInstance() called within feature context', () => {
      const featureRegistry = StepRegistry.createFeatureScoped();
      __setCurrentFeatureContext__({
        stepRegistry: featureRegistry,
        hookRegistry: HookRegistry.createFeatureScoped(),
      });

      StepRegistry.getInstance();

      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should warn only once to avoid spam', () => {
      StepRegistry.getInstance();
      StepRegistry.getInstance();
      StepRegistry.getInstance();

      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
    });

    it('should NOT warn in test environment', () => {
      process.env.NODE_ENV = 'test';

      StepRegistry.getInstance();

      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should NOT warn in production environment', () => {
      process.env.NODE_ENV = 'production';

      StepRegistry.getInstance();

      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
  });

  describe('Warning flag reset', () => {
    it('should reset warning flag when entering new feature context', () => {
      // First call without context - should warn
      StepRegistry.getInstance();
      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);

      // Enter feature context (resets warning flag)
      const featureRegistry = StepRegistry.createFeatureScoped();
      __setCurrentFeatureContext__({
        stepRegistry: featureRegistry,
        hookRegistry: HookRegistry.createFeatureScoped(),
      });

      // Exit feature context
      __setCurrentFeatureContext__(null);

      // Second call without context - should warn again
      StepRegistry.getInstance();
      expect(consoleWarnSpy).toHaveBeenCalledTimes(2);
    });

    it('should allow manual reset of warning flag for testing', () => {
      StepRegistry.getInstance();
      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);

      __resetWarningFlag__();

      StepRegistry.getInstance();
      expect(consoleWarnSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('Step registration warnings', () => {
    it('should warn when registering to global registry', () => {
      const globalRegistry = StepRegistry.getInstance();

      // First call triggers getInstance warning
      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
      consoleWarnSpy.mockClear();

      // Register step
      globalRegistry.register({
        type: 'Given',
        pattern: 'test step',
        fn: function () {},
      });

      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('global registry'),
      );
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('deprecated'),
      );
    });

    it('should NOT warn when registering to feature-scoped registry', () => {
      const featureRegistry = StepRegistry.createFeatureScoped();
      __setCurrentFeatureContext__({
        stepRegistry: featureRegistry,
        hookRegistry: HookRegistry.createFeatureScoped(),
      });

      featureRegistry.register({
        type: 'Given',
        pattern: 'test step',
        fn: function () {},
      });

      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should include step pattern in warning message', () => {
      const globalRegistry = StepRegistry.getInstance();
      consoleWarnSpy.mockClear();

      globalRegistry.register({
        type: 'Given',
        pattern: 'I have {int} items',
        fn: function () {},
      });

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('I have {int} items'),
      );
    });
  });

  describe('Duplicate step detection', () => {
    it('should warn when registering duplicate step pattern', () => {
      const registry = StepRegistry.createFeatureScoped();

      registry.register({
        type: 'Given',
        pattern: 'test pattern',
        fn: function () {},
      });

      expect(consoleWarnSpy).not.toHaveBeenCalled();

      // Register duplicate
      registry.register({
        type: 'Given',
        pattern: 'test pattern',
        fn: function () {},
      });

      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Duplicate step definition'),
      );
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('test pattern'),
      );
    });

    it('should NOT warn for different step types with same pattern', () => {
      const registry = StepRegistry.createFeatureScoped();

      registry.register({
        type: 'Given',
        pattern: 'test pattern',
        fn: function () {},
      });

      registry.register({
        type: 'When',
        pattern: 'test pattern',
        fn: function () {},
      });

      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should NOT warn for regex patterns with same source', () => {
      const registry = StepRegistry.createFeatureScoped();

      registry.register({
        type: 'Given',
        pattern: /^test pattern$/,
        fn: function () {},
      });

      registry.register({
        type: 'Given',
        pattern: /^test pattern$/,
        fn: function () {},
      });

      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Duplicate'),
      );
    });
  });

  describe('Warning message quality', () => {
    it('should provide helpful suggestions in warning messages', () => {
      StepRegistry.getInstance();

      const warningMessage = consoleWarnSpy.mock.calls[0][0];

      expect(warningMessage).toContain('Common causes');
      expect(warningMessage).toContain('Recommended');
      expect(warningMessage).toContain('https://');
    });

    it('should format warnings with clear structure', () => {
      StepRegistry.getInstance();

      const warningMessage = consoleWarnSpy.mock.calls[0][0];

      expect(warningMessage).toMatch(/⚠️.*\[vitest-cucumber\]/);
      expect(warningMessage).toContain('\n');
    });
  });
});
