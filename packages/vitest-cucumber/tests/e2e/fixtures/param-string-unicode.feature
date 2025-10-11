Feature: Unicode in string parameters

  Scenario: Extract string with unicode characters
    Given I have installed "包名-中文"
    Then the package should be "包名-中文"
