---
"@deepracticex/vitest-cucumber-plugin": patch
---

fix: completely delete global singletons to prevent worker process leaks

**Problem**: Worker processes could not exit cleanly after tests completed, causing system hangs and excessive memory consumption (reported in #16).

**Root Cause**: Even though feature-scoped registries were cleared, the global singleton objects remained on `globalThis`, preventing V8 GC from reclaiming memory and blocking Node.js event loop from exiting.

**Solution**: Added explicit `delete` statements in the generated `afterAll` hook to completely remove global singleton references:

```typescript
if (globalThis.__VITEST_CUCUMBER_STEP_REGISTRY__) {
  globalThis.__VITEST_CUCUMBER_STEP_REGISTRY__.clear();
  delete globalThis.__VITEST_CUCUMBER_STEP_REGISTRY__;
}
if (globalThis.__VITEST_CUCUMBER_HOOK_REGISTRY__) {
  globalThis.__VITEST_CUCUMBER_HOOK_REGISTRY__.clear();
  delete globalThis.__VITEST_CUCUMBER_HOOK_REGISTRY__;
}
```

**Impact**: Worker processes now exit cleanly, preventing:
- Orphaned processes consuming system resources
- Memory accumulation leading to GC loops
- System-wide performance degradation

**Related**: Closes #16
