import globals from "globals";
import css from "@eslint/css";
import { defineConfig } from "eslint/config";


export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs}"],
    ignores: ["node_modules/**", "logic/database/outputs/**", "server.js"],
    languageOptions: {
      globals: {...globals.browser, ...globals.node}
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-undef': 'error',
      'eqeqeq': 'error',
      'no-console': 'error',
      'prefer-const': 'error',
      'semi': ['error', 'always'],
    },
  },
  {
    files: ["**/*.css"],
    plugins: { css },
    language: "css/css",
    rules: {
      "css/no-duplicate-imports": "error",
      "css/no-empty-blocks": "error",
      "css/no-invalid-at-rules": "error",
      "css/no-invalid-properties": "error",
      "css/use-layers": "off"
    }
  },
]);