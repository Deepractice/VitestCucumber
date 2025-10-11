Feature: Scientific notation in floats

  Scenario: Handle scientific notation
    Given the price is 150.0
    Then the price should be 150.0
