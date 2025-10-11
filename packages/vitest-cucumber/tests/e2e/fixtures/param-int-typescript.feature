Feature: Integer parameter TypeScript type inference

  Scenario: Verify number type for integers
    When I add 7 and 8
    Then the result should be 15
