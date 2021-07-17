/* eslint-env node */
module.exports = {
  env: {
    browser: true,
    es6: true,
  },
  globals: {
    // for test:
    afterEach: true,
    beforeEach: true,
    describe: true,
    it: true,
  },
  plugins: [ 'promise' ],

  rules: {
    // due to renderIntoDocument() usage
    '@typescript-eslint/no-confusing-void-expression': 0,
    /* JSX props should not use arrow functions */
    'react/jsx-no-bind': 0,
  },
};
