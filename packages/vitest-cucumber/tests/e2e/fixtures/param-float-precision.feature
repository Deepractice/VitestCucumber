Feature: Float decimal precision

  Scenario: Preserve decimal precision
    Given the price is 99.999
    Then the price should be 99.999
