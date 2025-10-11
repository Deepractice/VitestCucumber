Feature: Negative integer parameters

  Scenario: Handle negative integers
    When I add -5 and 3
    Then the result should be -2
