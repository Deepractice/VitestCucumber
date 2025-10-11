Feature: Large integer values

  Scenario: Handle large integers
    When I add 999999 and 1
    Then the result should be 1000000
