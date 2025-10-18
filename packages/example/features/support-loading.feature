Feature: Support Directory Auto-Loading
  As a developer migrating from Cucumber.js
  I want support files to be loaded automatically before step definitions
  So that hooks and world setup are available when steps execute

  Background:
    Given the support files have been loaded first

  Scenario: Hooks defined in support directory are executed
    When I execute a step that relies on Before hook
    Then the hook should have initialized the context
    And the step can access the initialized data

  Scenario: Custom World from support is available
    Given I have a custom World class in support directory
    When I access World properties in a step
    Then the custom World methods should be available
