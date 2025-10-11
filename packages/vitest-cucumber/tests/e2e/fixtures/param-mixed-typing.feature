Feature: Type safety with mixed parameters

  Scenario: Verify correct TypeScript types for all parameters
    Given I have installed "type-safe-package"
    When I add 100 and 200
    And the price is 50.25
    Then the package should be "type-safe-package"
    And the result should be 300
    And the price should be 50.25
