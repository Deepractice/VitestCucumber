Feature: Empty string parameter

  Scenario: Extract empty string
    Given I have installed ""
    Then the package should be ""
