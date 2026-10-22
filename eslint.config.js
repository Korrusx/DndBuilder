const { defineConfig } = require('eslint/config');
const expo = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expo,
  {
    rules: {
      curly: ['error', 'all'],
    },
  },
  {
    ignores: ['node_modules/', 'dist/', '.expo/', 'data-pipeline/', 'assets/'],
  },
]);
