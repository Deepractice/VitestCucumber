---
'@deepracticex/vitest-cucumber-plugin': patch
---

Fix Before hook execution order to comply with Cucumber standard

Before hooks now execute before Background steps, following the official Cucumber execution order:

1. Before hooks
2. Background steps
3. Scenario steps
4. After hooks

This fixes issue #10 where Before hooks were incorrectly executing after Background steps, causing Background data to be cleared by the hooks.
