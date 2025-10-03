// eslint.config.mjs
import { flat } from "@eslint/js";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import globals from "globals";

export default [
  {
    files: ["**/*.{js,ts}"],

    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
      globals: { ...globals.node, ...globals.browser },
    },

    rules: {
      // JS rules
      "no-unused-vars": "warn",
      "eqeqeq": "error",
      "curly": "error",
      "semi": ["error", "always"],

      // TS rules
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/explicit-function-return-type": "warn",
      "@typescript-eslint/strict-boolean-expressions": "error",
    },
  },
];
