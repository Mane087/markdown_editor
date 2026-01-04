// eslint.config.js
// @ts-check

const { configs } = require("@eslint/js");
const { defineConfig } = require("eslint/config");
const tseslint = require("typescript-eslint");
const ng = require("angular-eslint");
const prettier = require("eslint-config-prettier");

module.exports = defineConfig([
  {
    ignores: ["dist/**", "coverage/**", ".angular/**", "node_modules/**"],
  },

  {
    files: ["**/*.ts"],
    extends: [
      configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.stylistic,
      ng.configs.tsRecommended,
    ],
    processor: ng.processInlineTemplates,
    rules: {
      "@angular-eslint/directive-selector": [
        "error",
        { type: "attribute", prefix: "app", style: "camelCase" },
      ],
      "@angular-eslint/component-selector": [
        "error",
        { type: "element", prefix: "app", style: "kebab-case" },
      ],
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "@angular-eslint/use-lifecycle-interface": "error",
    },
  },

  {
    files: ["**/*.html"],
    extends: [ng.configs.templateRecommended, ng.configs.templateAccessibility],
    rules: {},
  },

  prettier,
]);
