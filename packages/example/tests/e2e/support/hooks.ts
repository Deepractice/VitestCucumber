import { Before, After } from '@deepracticex/vitest-cucumber';

// Track loading order - this file should load BEFORE step definitions
const loadTime = Date.now();
console.log(`[SUPPORT] hooks.ts loaded at ${loadTime}`);

// Global flag to verify support files loaded first
(globalThis as any).__supportFilesLoaded = true;
(globalThis as any).__supportLoadTime = loadTime;

Before(function () {
  console.log('[HOOK] Before hook executing');
  // Initialize context that steps will rely on
  this.hookExecuted = true;
  this.initializedData = {
    message: 'Initialized by Before hook in support/hooks.ts',
    timestamp: Date.now(),
  };
});

After(function () {
  console.log('[HOOK] After hook executing');
  // Clean up
  this.hookExecuted = false;
});
