import { describe, it, expect, beforeEach } from 'vitest';
import { Given, When, Then, And, But } from '../api/step-definitions';
import { StepRegistry } from '../core/runtime/StepRegistry';

describe('Step Definitions API', () => {
  beforeEach(() => {
    // Clear registry before each test
    StepRegistry.getInstance().clear();
  });

  it('should register Given step', () => {
    const stepFn = function () {
      return 'given';
    };

    Given('I have a step', stepFn);

    const registry = StepRegistry.getInstance();
    const steps = registry.getAll();

    expect(steps).toHaveLength(1);
    expect(steps[0].pattern).toBe('I have a step');
    expect(steps[0].type).toBe('Given');
  });

  it('should register When step', () => {
    const stepFn = function () {
      return 'when';
    };

    When('I do something', stepFn);

    const registry = StepRegistry.getInstance();
    const steps = registry.getAll();

    expect(steps).toHaveLength(1);
    expect(steps[0].pattern).toBe('I do something');
    expect(steps[0].type).toBe('When');
  });

  it('should register Then step', () => {
    const stepFn = function () {
      return 'then';
    };

    Then('I should see result', stepFn);

    const registry = StepRegistry.getInstance();
    const steps = registry.getAll();

    expect(steps).toHaveLength(1);
    expect(steps[0].pattern).toBe('I should see result');
    expect(steps[0].type).toBe('Then');
  });

  it('should register And step', () => {
    const stepFn = function () {
      return 'and';
    };

    And('I also do this', stepFn);

    const registry = StepRegistry.getInstance();
    const steps = registry.getAll();

    expect(steps).toHaveLength(1);
    expect(steps[0].pattern).toBe('I also do this');
    expect(steps[0].type).toBe('And');
  });

  it('should register But step', () => {
    const stepFn = function () {
      return 'but';
    };

    But('I should not see error', stepFn);

    const registry = StepRegistry.getInstance();
    const steps = registry.getAll();

    expect(steps).toHaveLength(1);
    expect(steps[0].pattern).toBe('I should not see error');
    expect(steps[0].type).toBe('But');
  });

  it('should register multiple steps', () => {
    Given('step 1', function () {});
    When('step 2', function () {});
    Then('step 3', function () {});

    const registry = StepRegistry.getInstance();
    const steps = registry.getAll();

    expect(steps).toHaveLength(3);
  });
});
