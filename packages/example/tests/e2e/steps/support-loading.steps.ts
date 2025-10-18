import { Given, When, Then } from '@deepracticex/vitest-cucumber';
import { expect } from 'vitest';
import type { CustomWorld } from '../support/world';

// Track step file loading time
const stepLoadTime = Date.now();
console.log(`[STEPS] support-loading.steps.ts loaded at ${stepLoadTime}`);

// Verify support files loaded before steps
const supportLoadTime = (globalThis as any).__supportLoadTime;
if (supportLoadTime && stepLoadTime > supportLoadTime) {
  console.log(
    `✅ [VERIFICATION] Support files loaded ${stepLoadTime - supportLoadTime}ms before step files`,
  );
} else {
  console.error(
    '❌ [VERIFICATION] Support files did NOT load before step files!',
  );
}

Given('the support files have been loaded first', function (this: CustomWorld) {
  // Verify support files were loaded
  expect((globalThis as any).__supportFilesLoaded).toBe(true);

  // Verify loading order
  const supportTime = (globalThis as any).__supportLoadTime;
  expect(supportTime).toBeDefined();
  expect(supportTime).toBeLessThan(stepLoadTime);

  console.log('[STEP] Verified support files loaded first');
});

When(
  'I execute a step that relies on Before hook',
  function (this: CustomWorld) {
    console.log('[STEP] Executing step that needs Before hook');
    // This step expects the Before hook to have run
    // The hook should have set this.hookExecuted = true
  },
);

Then(
  'the hook should have initialized the context',
  function (this: CustomWorld) {
    expect(this.hookExecuted).toBe(true);
    expect(this.initializedData).toBeDefined();
    expect(this.initializedData?.message).toContain('Before hook');
    console.log('[STEP] Hook initialization verified');
  },
);

Then('the step can access the initialized data', function (this: CustomWorld) {
  expect(this.initializedData?.message).toBe(
    'Initialized by Before hook in support/hooks.ts',
  );
  expect(this.initializedData?.timestamp).toBeTypeOf('number');
  console.log('[STEP] Initialized data accessed successfully');
});

Given(
  'I have a custom World class in support directory',
  function (this: CustomWorld) {
    // World should be CustomWorld from support/world.ts
    expect(this.getCustomMessage).toBeDefined();
    expect(typeof this.getCustomMessage).toBe('function');
    console.log('[STEP] Custom World class detected');
  },
);

When('I access World properties in a step', function (this: CustomWorld) {
  // Access custom World method
  const message = this.getCustomMessage();
  expect(message).toBeDefined();
  console.log(`[STEP] Custom method returned: ${message}`);
});

Then(
  'the custom World methods should be available',
  function (this: CustomWorld) {
    const message = this.getCustomMessage();
    expect(message).toBe('This method comes from support/world.ts');

    const hookVerified = this.verifyHookExecution();
    expect(hookVerified).toBe(true);

    console.log('[STEP] All custom World methods verified');
  },
);
