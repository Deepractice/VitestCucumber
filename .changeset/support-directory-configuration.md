---
'@deepracticex/vitest-cucumber-plugin': minor
'@deepracticex/vitest-cucumber': patch
---

feat: add flexible support directory configuration with intelligent auto-discovery

This enhancement makes support directory configuration much more flexible and user-friendly.

**New `support` Configuration Option**

Added optional `support` parameter to plugin configuration:

```typescript
vitestCucumber({
  steps: 'tests/steps',
  support: 'tests/support', // Single directory
  // OR
  support: ['tests/support', 'src/fixtures'], // Multiple directories
});
```

**Intelligent Auto-Discovery**

When `support` is not specified, the plugin now intelligently discovers support files:

1. **Smart sibling detection** - Automatically finds support directory next to steps:
   - `steps='tests/bdd/steps'` → checks `tests/bdd/support`
   - `steps='tests/e2e/steps'` → checks `tests/e2e/support`
   - `steps='src/test/steps'` → checks `src/test/support`

2. **Enhanced fallback locations**:
   - `tests/e2e/support/**/*.ts` (existing)
   - `tests/support/**/*.ts` (new)
   - `tests/bdd/support/**/*.ts` (new)
   - `${steps}/support/**/*.ts` (existing)

**Benefits**

- Works with any directory structure out of the box
- No configuration needed for standard layouts
- Explicit configuration available when needed
- Supports multiple support directories
- Backward compatible - existing projects work unchanged

**Documentation Updates**

- Updated README with clear examples of auto-discovery
- Added configuration examples for explicit setup
- Explained loading order guarantees

**Test Coverage**

- Added comprehensive test suite (9 tests)
- Tests auto-discovery scenarios
- Tests explicit configuration
- Tests loading order and de-duplication
