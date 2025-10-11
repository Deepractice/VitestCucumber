import { describe, it, expect } from 'vitest';
import { FeatureTransformer } from '../core/transformer/FeatureTransformer';

describe('FeatureTransformer', () => {
  it('should transform a simple feature to test code', () => {
    const transformer = new FeatureTransformer();
    const featureContent = `
Feature: User Login
  As a user
  I want to log in
  So that I can access my account

  Scenario: Successful login
    Given I am on the login page
    When I enter valid credentials
    Then I should be logged in
`;

    const result = transformer.transform(featureContent, 'test.feature');

    expect(result).toContain("describe('User Login'");
    expect(result).toContain("it('Successful login'");
    expect(result).toContain("keyword: 'Given'");
    expect(result).toContain("text: 'I am on the login page'");
    expect(result).toContain("keyword: 'When'");
    expect(result).toContain("text: 'I enter valid credentials'");
    expect(result).toContain("keyword: 'Then'");
    expect(result).toContain("text: 'I should be logged in'");
  });

  it('should use default runtime module', () => {
    const transformer = new FeatureTransformer();
    const featureContent = `
Feature: Test Feature
  Scenario: Test Scenario
    Given a step
`;

    const result = transformer.transform(featureContent, 'test.feature');

    expect(result).toContain("from '@deepracticex/vitest-cucumber/runtime'");
  });

  it('should use custom runtime module when provided', () => {
    const transformer = new FeatureTransformer(
      'tests/steps',
      '@custom/runtime-module',
    );
    const featureContent = `
Feature: Test Feature
  Scenario: Test Scenario
    Given a step
`;

    const result = transformer.transform(featureContent, 'test.feature');

    expect(result).toContain("from '@custom/runtime-module/runtime'");
    expect(result).not.toContain('@deepracticex/vitest-cucumber');
  });

  it('should generate code with DataTable', () => {
    const transformer = new FeatureTransformer();
    const featureContent = `
Feature: Data Tables
  Scenario: Using data table
    Given the following users:
      | name  | email           |
      | Alice | alice@email.com |
      | Bob   | bob@email.com   |
`;

    const result = transformer.transform(featureContent, 'test.feature');

    expect(result).toContain('dataTable: new DataTable');
    expect(result).toContain('Alice');
    expect(result).toContain('alice@email.com');
  });

  it('should generate code with DocString', () => {
    const transformer = new FeatureTransformer();
    const featureContent = `
Feature: Doc Strings
  Scenario: Using doc string
    Given the following content:
      """
      This is a
      multi-line
      doc string
      """
`;

    const result = transformer.transform(featureContent, 'test.feature');

    expect(result).toContain('docString:');
    expect(result).toContain('This is a');
    expect(result).toContain('multi-line');
  });

  it('should generate hooks for BeforeAll and AfterAll', () => {
    const transformer = new FeatureTransformer();
    const featureContent = `
Feature: Hooks Test
  Scenario: Test hooks
    Given a step
`;

    const result = transformer.transform(featureContent, 'test.feature');

    expect(result).toContain('beforeAll(async () => {');
    expect(result).toContain('afterAll(async () => {');
    expect(result).toContain("executeHooks('BeforeAll'");
    expect(result).toContain("executeHooks('AfterAll'");
  });

  it('should generate hooks for Before and After', () => {
    const transformer = new FeatureTransformer();
    const featureContent = `
Feature: Scenario Hooks
  Scenario: Test scenario hooks
    Given a step
`;

    const result = transformer.transform(featureContent, 'test.feature');

    expect(result).toContain("executeHooks('Before'");
    expect(result).toContain("executeHooks('After'");
  });

  it('should handle Scenario Outline with Examples', () => {
    const transformer = new FeatureTransformer();
    const featureContent = `
Feature: Scenario Outline
  Scenario Outline: Login with different users
    Given I am user "<username>"
    When I enter password "<password>"
    Then I should see "<result>"

    Examples:
      | username | password | result  |
      | alice    | pass123  | success |
      | bob      | wrong    | failure |
`;

    const result = transformer.transform(featureContent, 'test.feature');

    expect(result).toContain("describe('Login with different users'");
    expect(result).toContain('Example:');
    expect(result).toContain('username=alice');
    expect(result).toContain('username=bob');
  });
});
