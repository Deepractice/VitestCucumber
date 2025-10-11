Feature: Mixed parameters in various orders

  Scenario: Parameters in different sequence
    Given the price is 100.50
    When I add 1 and 2
    Given I have installed "another-package"
    Then the price should be 100.50
    And the result should be 3
    And the package should be "another-package"
