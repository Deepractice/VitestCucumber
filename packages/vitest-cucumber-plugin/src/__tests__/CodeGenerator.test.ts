import { describe, it, expect } from 'vitest';
import { CodeGenerator } from '~/core/transformer/CodeGenerator';
import type { Feature } from '~/types';

describe('CodeGenerator', () => {
  describe('Hook Execution Order', () => {
    it('should execute Before hooks before Background steps in beforeEach', () => {
      const generator = new CodeGenerator();

      const feature: Feature = {
        name: 'Test Feature',
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

      // Verify Before hooks are executed in beforeEach
      expect(code).toContain('beforeEach(async (context) => {');
      expect(code).toContain(
        "await __featureHookRegistry__.executeHooks('Before', cucumberContext);",
      );

      // Verify Before hooks come BEFORE Background step execution
      const beforeEachMatch = code.match(
        /beforeEach\(async \(context\) => \{[\s\S]*?\}\);/,
      );
      expect(beforeEachMatch).toBeTruthy();

      if (beforeEachMatch) {
        const beforeEachBlock = beforeEachMatch[0];
        const beforeHookIndex = beforeEachBlock.indexOf(
          "executeHooks('Before'",
        );
        const backgroundStepIndex = beforeEachBlock.indexOf("keyword: 'Given'");

        // Before hook should appear before Background step
        expect(beforeHookIndex).toBeGreaterThan(-1);
        expect(backgroundStepIndex).toBeGreaterThan(-1);
        expect(beforeHookIndex).toBeLessThan(backgroundStepIndex);
      }
    });

    it('should NOT execute Before hooks in scenario it() block when Background exists', () => {
      const generator = new CodeGenerator();

      const feature: Feature = {
        name: 'Test Feature',
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

      // Find the it() block
      const itBlockMatch = code.match(
        /it\('Test Scenario', async \(context\) => \{[\s\S]*?\}\);/,
      );
      expect(itBlockMatch).toBeTruthy();

      if (itBlockMatch) {
        const itBlock = itBlockMatch[0];

        // Before hook should NOT be in the it() block
        expect(itBlock).not.toContain("executeHooks('Before'");

        // But After hook should still be there
        expect(code).toContain("executeHooks('After'");
      }
    });

    it('should execute After hooks at the end of scenario it() block', () => {
      const generator = new CodeGenerator();

      const feature: Feature = {
        name: 'Test Feature',
        background: {
          steps: [{ keyword: 'Given', text: 'background step' }],
        },
        scenarios: [
          {
            name: 'Test Scenario',
            steps: [
              { keyword: 'When', text: 'scenario step' },
              { keyword: 'Then', text: 'assertion step' },
            ],
          },
        ],
      };

      const code = generator.generate(feature);

      // Find the it() block
      const itBlockMatch = code.match(
        /it\('Test Scenario', async \(context\) => \{[\s\S]*?\}\);/,
      );
      expect(itBlockMatch).toBeTruthy();

      // After hook should be in the code after all steps
      expect(code).toContain("executeHooks('After'");

      // Verify After hook comes after scenario steps in the full code
      const afterHookIndex = code.indexOf("executeHooks('After'");
      const lastStepIndex = code.lastIndexOf("text: 'assertion step'");

      expect(afterHookIndex).toBeGreaterThan(-1);
      expect(lastStepIndex).toBeGreaterThan(-1);
      expect(afterHookIndex).toBeGreaterThan(lastStepIndex);
    });

    it('should maintain correct order for Scenario Outline', () => {
      const generator = new CodeGenerator();

      const feature: Feature = {
        name: 'Test Feature',
        background: {
          steps: [{ keyword: 'Given', text: 'background step' }],
        },
        scenarios: [
          {
            name: 'Test Scenario Outline',
            isOutline: true,
            steps: [{ keyword: 'When', text: 'I use <value>' }],
            examples: [
              {
                headers: ['value'],
                rows: [['test1']],
              },
            ],
          },
        ],
      };

      const code = generator.generate(feature);

      // Before hooks should be in beforeEach only
      expect(code).toContain('beforeEach(async (context) => {');
      expect(code).toContain(
        "await __featureHookRegistry__.executeHooks('Before', cucumberContext);",
      );

      // Scenario outline it() blocks should NOT have Before hooks
      const exampleItMatch = code.match(
        /it\('Example:[\s\S]*?\(context\) => \{[\s\S]*?\}\);/,
      );
      expect(exampleItMatch).toBeTruthy();

      // Verify the entire generated code
      // Before hooks should only be in beforeEach, not in example it() blocks
      const itBlocks = code.match(/it\('Example:[^}]*\}\);/gs);
      expect(itBlocks).toBeTruthy();

      if (itBlocks) {
        for (const itBlock of itBlocks) {
          expect(itBlock).not.toContain("executeHooks('Before'");
        }
      }

      // After hooks should still be in the code
      expect(code).toContain("executeHooks('After'");
    });

    it('should handle scenarios without Background correctly', () => {
      const generator = new CodeGenerator();

      const feature: Feature = {
        name: 'Test Feature',
        scenarios: [
          {
            name: 'Test Scenario',
            steps: [
              { keyword: 'Given', text: 'setup' },
              { keyword: 'When', text: 'action' },
            ],
          },
        ],
      };

      const code = generator.generate(feature);

      // Should not have beforeEach block implementation (but import statement still exists)
      expect(code).not.toContain('beforeEach(async (context)');

      // it() block should have After hook
      expect(code).toContain("executeHooks('After'");
    });
  });
});
