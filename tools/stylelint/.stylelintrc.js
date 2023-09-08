/** @type {import('stylelint').Config} */
module.exports = {
  ignoreFiles: ['dist/**/*.css', 'coverage/**/*.css'],
  extends: ['stylelint-config-standard-scss', 'stylelint-config-idiomatic-order'],
  plugins: 'stylelint-order',
  rules: {
    'no-duplicate-selectors': true,
    'color-hex-length': 'short',
    'color-named': 'never',
    'selector-no-qualifying-type': [
      true,
      {
        ignore: ['attribute', 'class']
      }
    ],
    'selector-attribute-quotes': 'always',
    'declaration-no-important': true,
    'font-weight-notation': 'numeric',
    'comment-whitespace-inside': 'always',
    'comment-empty-line-before': 'always',
    'rule-empty-line-before': 'always',
    'selector-pseudo-element-colon-notation': 'single',
    'selector-class-pattern': [
      '^([a-z][a-z0-9]*)(_[a-z0-9]+)*$',
      {
        message: 'Expected class selector to be snake_case'
      }
    ],
    'keyframes-name-pattern': [
      '^([a-z][a-z0-9]*)(_[a-z0-9]+)*$',
      {
        message: 'Expected keyframe name to be snake_case'
      }
    ],
    'scss/percent-placeholder-pattern': [
      '^([a-z][a-z0-9]*)(_[a-z0-9]+)*$',
      {
        message: 'Expected pattern for %-placeholders to be snake_case'
      }
    ],
    'scss/at-mixin-pattern': [
      '^([a-z][a-z0-9]*)(_[a-z0-9]+)*$',
      {
        message: 'Expected pattern for mixin to be snake_case'
      }
    ]
  }
};
