Feature: Escaped quotes in string

  Scenario: Extract string with escaped quotes
    Given I have installed "package with \"quotes\""
    Then the package should be "package with \"quotes\""
