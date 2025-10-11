Feature: Mixed parameter types

  Scenario: Combine string, int, and float parameters
    Given I have installed "@test/package"
    When I add 5 and 10
    And the price is 25.99
    Then the package should be "@test/package"
    And the result should be 15
    And the price should be 25.99
