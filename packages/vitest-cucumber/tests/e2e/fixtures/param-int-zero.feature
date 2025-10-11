Feature: Zero integer parameter

  Scenario: Handle zero value
    When I add 0 and 0
    Then the result should be 0
