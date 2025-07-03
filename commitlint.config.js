module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'style',
        'refactor',
        'perf',
        'test',
        'chore',
        'revert',
        'build',
        'ci'
      ]
    ],
    'subject-case': [0, 'never'], // Desabilitar case sensitivity
    'header-max-length': [2, 'always', 100]
  },
  ignores: [
    // Ignorar commits de bots
    (message) => message.includes('github-actions'),
    (message) => message.includes('dependabot'),
    (message) => message.includes('[skip ci]'),
    (message) => message.includes('chore(release)')
  ]
};
