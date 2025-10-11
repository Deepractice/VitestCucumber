Feature: Very precise float values

  Scenario: Handle high precision decimals
    Given the price is 3.141592653589793
    Then the price should be 3.141592653589793
