module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: ["eslint:recommended", "google"],
  parserOptions: {
    parser: "eslint",
    ecmaVersion: 2020,
    sourceType: "module",
  },
  rules: {
    quotes: ["error", "double"],
  },
};
