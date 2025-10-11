Feature: Negative float parameters

  Scenario: Handle negative floats
    Given the price is -15.50
    Then the price should be -15.50
