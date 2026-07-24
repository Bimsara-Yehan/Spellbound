/**
 * Conventional Commits enforcement.
 *
 * Runs locally via a Husky commit-msg hook and again in CI on the pull
 * request title. Local enforcement gives fast feedback; CI enforcement is
 * what actually guarantees the history stays clean, because hooks can be
 * skipped with --no-verify.
 */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'refactor', 'perf', 'test', 'docs', 'chore', 'build', 'ci'],
    ],
    // Scope is required so that `git log --grep` can filter by area.
    'scope-empty': [2, 'never'],
    'scope-enum': [
      2,
      'always',
      ['api', 'storefront', 'admin', 'ui', 'client', 'infra', 'deps'],
    ],
    'subject-case': [2, 'always', 'lower-case'],
    'subject-full-stop': [2, 'never', '.'],
    'header-max-length': [2, 'always', 72],
  },
};
