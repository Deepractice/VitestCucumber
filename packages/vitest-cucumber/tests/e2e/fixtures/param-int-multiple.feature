Feature: Multiple integer parameters

  Scenario: Extract and add multiple integers
    When I add 10 and 20
    Then the result should be 30
