import { describe, it, expect, beforeEach } from 'vitest';
import { CodeGenerator } from '~/core/transformer/CodeGenerator';
import type { Feature } from '~/types';

describe('Registry Cleanup', () => {
  describe('Generated code should clean up registries', () => {
    it('should include StepRegistry.clear() in afterAll hook', () => {
      const generator = new CodeGenerator();

      const feature: Feature = {
        name: 'Test Feature',
        scenarios: [
          {
            name: 'Test Scenario',
            steps: [{ keyword: 'Given', text: 'a step' }],
          },
        ],
      };

      const code = generator.generate(feature);

      // Verify afterAll hook exists
      expect(code).toContain('afterAll(async () => {');

      // Verify registry cleanup is present
      expect(code).toContain('__featureStepRegistry__.clear()');
      expect(code).toContain('__featureHookRegistry__.clear()');
    });

    it('should clean up registries after feature with background', () => {
      const generator = new CodeGenerator();

      const feature: Feature = {
        name: 'Test Feature with Background',
        background: {
          steps: [{ keyword: 'Given', text: 'background step' }],
        },
        scenarios: [
          {
            name: 'Test Scenario',
            steps: [{ keyword: 'When', text: 'scenario step' }],
          },
        ],
      };

      const code = generator.generate(feature);

      // Verify afterAll exists and contains cleanup
      expect(code).toContain('afterAll(async () => {');
      expect(code).toContain('__featureStepRegistry__.clear()');
      expect(code).toContain('__featureHookRegistry__.clear()');
    });

    it('should clean up registries in correct order (user hooks before registry clear)', () => {
      const generator = new CodeGenerator();

      const feature: Feature = {
        name: 'Test Feature',
        scenarios: [
          {
            name: 'Test Scenario',
            steps: [{ keyword: 'Given', text: 'a step' }],
          },
        ],
      };

      const code = generator.generate(feature);

      // Extract afterAll block
      const afterAllMatch = code.match(
        /afterAll\(async \(\) => \{[\s\S]*?\}\);/,
      );
      expect(afterAllMatch).toBeTruthy();

      if (afterAllMatch) {
        const afterAllBlock = afterAllMatch[0];

        // Find positions
        const userHookIndex = afterAllBlock.indexOf("executeHooks('AfterAll'");
        const stepRegistryClearIndex = afterAllBlock.indexOf(
          '__featureStepRegistry__.clear()',
        );
        const hookRegistryClearIndex = afterAllBlock.indexOf(
          '__featureHookRegistry__.clear()',
        );

        // Verify all exist
        expect(userHookIndex).toBeGreaterThan(-1);
        expect(stepRegistryClearIndex).toBeGreaterThan(-1);
        expect(hookRegistryClearIndex).toBeGreaterThan(-1);

        // Verify order: user hooks execute first, then cleanup
        expect(userHookIndex).toBeLessThan(stepRegistryClearIndex);
        expect(userHookIndex).toBeLessThan(hookRegistryClearIndex);
      }
    });

    it('should import StepRegistry for cleanup', () => {
      const generator = new CodeGenerator();

      const feature: Feature = {
        name: 'Test Feature',
        scenarios: [
          {
            name: 'Test Scenario',
            steps: [{ keyword: 'Given', text: 'a step' }],
          },
        ],
      };

      const code = generator.generate(feature);

      // Check that StepRegistry is imported or accessed
      // It should either be imported at the top or accessed via the runtime module
      const hasStepRegistryImport =
        code.includes('import') && code.includes('StepRegistry');
      const hasStepRegistryAccess = code.includes('StepRegistry.getInstance()');

      expect(hasStepRegistryImport || hasStepRegistryAccess).toBe(true);
    });
  });

  describe('Memory leak prevention', () => {
    it('should generate code comment explaining cleanup purpose', () => {
      const generator = new CodeGenerator();

      const feature: Feature = {
        name: 'Test Feature',
        scenarios: [
          {
            name: 'Test Scenario',
            steps: [{ keyword: 'Given', text: 'a step' }],
          },
        ],
      };

      const code = generator.generate(feature);

      // Should have explanatory comment about cleanup
      expect(code).toMatch(
        /\/\/.*[Cc]lean.*[Rr]egistry|\/\/.*[Mm]emory|\/\/.*[Ll]eak/,
      );
    });
  });
});
