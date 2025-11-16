---
"@deepracticex/vitest-cucumber": patch
"@deepracticex/vitest-cucumber-plugin": patch
---

Fix unhandled Promise rejection causing test process hangs

**Problem:**
When tests contain unhandled Promise rejections (e.g., accessing null context after destroy), vitest processes would hang indefinitely, consuming CPU resources and requiring manual termination.

**Root Cause:**
1. StepExecutor didn't catch errors in step function execution
2. No global unhandledRejection handler to catch async errors
3. Async callbacks accessing destroyed objects (like `this.context.logger` being null)

**Solution:**
1. **StepExecutor.ts**: Added try-catch wrapper around step function execution with detailed error logging
2. **CodeGenerator.ts**: Injected global unhandledRejection handler in generated test code to catch and log all unhandled rejections

**Benefits:**
- Tests now complete normally even with unhandled rejections
- Better error messages with step context
- Prevents test process hangs
- Easier debugging with detailed error logs
