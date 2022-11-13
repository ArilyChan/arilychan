module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2020: true
  },
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'plugin:@typescript-eslint/eslint-recommended',
    'standard'
  ],
  parserOptions: {
    ecmaVersion: 12
  },
  rules: {
    '@typescript-eslint/no-redeclare': ['warn', {
      ignoreDeclarationMerge: true
    }]
  }
}
