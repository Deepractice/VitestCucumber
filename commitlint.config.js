export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // New feature
        'fix', // Bug fix
        'docs', // Documentation
        'style', // Code style (formatting, no logic change)
        'refactor', // Code refactoring
        'perf', // Performance improvement
        'test', // Tests
        'build', // Build system or dependencies
        'ci', // CI configuration
        'chore', // Other changes
        'revert', // Revert previous commit
      ],
    ],
    'subject-case': [0], // Allow any case
  },
};
