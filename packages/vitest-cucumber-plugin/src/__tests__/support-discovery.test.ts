import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FeatureTransformer } from '~/core/transformer/FeatureTransformer';
import * as fs from 'fs';
import * as path from 'path';

describe('Support Directory Discovery', () => {
  const testDir = path.join(process.cwd(), 'test-fixtures');

  beforeEach(() => {
    // Create test directory structure
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
  });

  afterEach(() => {
    // Clean up test directories
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  const createTestFiles = (structure: Record<string, string>) => {
    Object.entries(structure).forEach(([filePath, content]) => {
      const fullPath = path.join(testDir, filePath);
      const dir = path.dirname(fullPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(fullPath, content);
    });
  };

  describe('Auto-discovery from steps directory structure', () => {
    it('should discover support directory as sibling of steps (tests/bdd pattern)', () => {
      createTestFiles({
        'tests/bdd/steps/example.steps.ts':
          "import { Given } from 'vitest-cucumber';",
        'tests/bdd/support/world.ts':
          "import { setWorldConstructor } from 'vitest-cucumber';",
        'tests/bdd/support/hooks.ts':
          "import { Before } from 'vitest-cucumber';",
      });

      const originalCwd = process.cwd();
      process.chdir(testDir);

      try {
        const transformer = new FeatureTransformer('tests/bdd/steps');
        const files = transformer['discoverStepFiles']();

        // Support files should be loaded first
        expect(files).toContain('tests/bdd/support/world.ts');
        expect(files).toContain('tests/bdd/support/hooks.ts');
        expect(files).toContain('tests/bdd/steps/example.steps.ts');

        // Check order: support files before step files
        const worldIndex = files.indexOf('tests/bdd/support/world.ts');
        const stepsIndex = files.indexOf('tests/bdd/steps/example.steps.ts');
        expect(worldIndex).toBeLessThan(stepsIndex);
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should discover support directory as sibling of steps (tests/e2e pattern)', () => {
      createTestFiles({
        'tests/e2e/steps/example.steps.ts':
          "import { Given } from 'vitest-cucumber';",
        'tests/e2e/support/world.ts':
          "import { setWorldConstructor } from 'vitest-cucumber';",
      });

      const originalCwd = process.cwd();
      process.chdir(testDir);

      try {
        const transformer = new FeatureTransformer('tests/e2e/steps');
        const files = transformer['discoverStepFiles']();

        expect(files).toContain('tests/e2e/support/world.ts');
        expect(files).toContain('tests/e2e/steps/example.steps.ts');
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should discover support directory as sibling of steps (custom path)', () => {
      createTestFiles({
        'src/test/steps/example.steps.ts':
          "import { Given } from 'vitest-cucumber';",
        'src/test/support/world.ts':
          "import { setWorldConstructor } from 'vitest-cucumber';",
      });

      const originalCwd = process.cwd();
      process.chdir(testDir);

      try {
        const transformer = new FeatureTransformer('src/test/steps');
        const files = transformer['discoverStepFiles']();

        expect(files).toContain('src/test/support/world.ts');
        expect(files).toContain('src/test/steps/example.steps.ts');
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should discover support as subdirectory under steps', () => {
      createTestFiles({
        'tests/steps/example.steps.ts':
          "import { Given } from 'vitest-cucumber';",
        'tests/steps/support/world.ts':
          "import { setWorldConstructor } from 'vitest-cucumber';",
      });

      const originalCwd = process.cwd();
      process.chdir(testDir);

      try {
        const transformer = new FeatureTransformer('tests/steps');
        const files = transformer['discoverStepFiles']();

        expect(files).toContain('tests/steps/support/world.ts');
        expect(files).toContain('tests/steps/example.steps.ts');
      } finally {
        process.chdir(originalCwd);
      }
    });
  });

  describe('Explicit support configuration', () => {
    it('should use explicitly configured single support directory', () => {
      createTestFiles({
        'tests/steps/example.steps.ts':
          "import { Given } from 'vitest-cucumber';",
        'custom/support/world.ts':
          "import { setWorldConstructor } from 'vitest-cucumber';",
      });

      const originalCwd = process.cwd();
      process.chdir(testDir);

      try {
        const transformer = new FeatureTransformer(
          'tests/steps',
          '@deepracticex/vitest-cucumber',
          'custom/support',
        );
        const files = transformer['discoverStepFiles']();

        expect(files).toContain('custom/support/world.ts');
        expect(files).toContain('tests/steps/example.steps.ts');
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should use explicitly configured multiple support directories', () => {
      createTestFiles({
        'tests/steps/example.steps.ts':
          "import { Given } from 'vitest-cucumber';",
        'custom/support/world.ts':
          "import { setWorldConstructor } from 'vitest-cucumber';",
        'another/fixtures/hooks.ts':
          "import { Before } from 'vitest-cucumber';",
      });

      const originalCwd = process.cwd();
      process.chdir(testDir);

      try {
        const transformer = new FeatureTransformer(
          'tests/steps',
          '@deepracticex/vitest-cucumber',
          ['custom/support', 'another/fixtures'],
        );
        const files = transformer['discoverStepFiles']();

        expect(files).toContain('custom/support/world.ts');
        expect(files).toContain('another/fixtures/hooks.ts');
        expect(files).toContain('tests/steps/example.steps.ts');
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should only use explicit config when provided (no fallbacks)', () => {
      createTestFiles({
        'tests/steps/example.steps.ts':
          "import { Given } from 'vitest-cucumber';",
        'tests/e2e/support/world.ts':
          "import { setWorldConstructor } from 'vitest-cucumber';", // Should be ignored
        'custom/support/world.ts':
          "import { setWorldConstructor } from 'vitest-cucumber';", // Should be used
      });

      const originalCwd = process.cwd();
      process.chdir(testDir);

      try {
        const transformer = new FeatureTransformer(
          'tests/steps',
          '@deepracticex/vitest-cucumber',
          'custom/support',
        );
        const files = transformer['discoverStepFiles']();

        expect(files).toContain('custom/support/world.ts');
        expect(files).not.toContain('tests/e2e/support/world.ts'); // Fallback should be ignored
      } finally {
        process.chdir(originalCwd);
      }
    });
  });

  describe('Support files loading order', () => {
    it('should always load support files before step files', () => {
      createTestFiles({
        'tests/bdd/steps/a.steps.ts':
          "import { Given } from 'vitest-cucumber';",
        'tests/bdd/steps/b.steps.ts':
          "import { Given } from 'vitest-cucumber';",
        'tests/bdd/support/hooks.ts':
          "import { Before } from 'vitest-cucumber';",
        'tests/bdd/support/world.ts':
          "import { setWorldConstructor } from 'vitest-cucumber';",
      });

      const originalCwd = process.cwd();
      process.chdir(testDir);

      try {
        const transformer = new FeatureTransformer('tests/bdd/steps');
        const files = transformer['discoverStepFiles']();

        // Find indices
        const supportIndices = files
          .map((f, i) => (f.includes('/support/') ? i : -1))
          .filter((i) => i !== -1);

        const stepIndices = files
          .map((f, i) => (f.includes('.steps.ts') ? i : -1))
          .filter((i) => i !== -1);

        // All support files should come before all step files
        const maxSupportIndex = Math.max(...supportIndices);
        const minStepIndex = Math.min(...stepIndices);

        expect(maxSupportIndex).toBeLessThan(minStepIndex);
      } finally {
        process.chdir(originalCwd);
      }
    });
  });

  describe('No duplicate files', () => {
    it('should not include support files in step files list', () => {
      createTestFiles({
        'tests/bdd/steps/example.steps.ts':
          "import { Given } from 'vitest-cucumber';",
        'tests/bdd/support/world.ts':
          "import { setWorldConstructor } from 'vitest-cucumber';",
      });

      const originalCwd = process.cwd();
      process.chdir(testDir);

      try {
        const transformer = new FeatureTransformer('tests/bdd/steps');
        const files = transformer['discoverStepFiles']();

        // Check no duplicates
        const uniqueFiles = [...new Set(files)];
        expect(files.length).toBe(uniqueFiles.length);

        // Each file should appear exactly once
        const worldFile = 'tests/bdd/support/world.ts';
        expect(files.filter((f) => f === worldFile).length).toBe(1);
      } finally {
        process.chdir(originalCwd);
      }
    });
  });
});
