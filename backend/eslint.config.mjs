// eslint.config.mjs
import js from "@eslint/js";
import tsPlugin from "typescript-eslint";
import globals from "globals";

export default [
  {
    files: ["**/*.{js,ts}"],

    languageOptions: {
      globals: { ...globals.node, ...globals.browser },
      parserOptions: {
        ecmaVersion: 2024,
        sourceType: "module",
      },
    },

    plugins: {
      js,
      "@typescript-eslint": tsPlugin,
    },

    rules: {
      ...js.configs.recommended.rules,
      ...tsPlugin.configs.recommended.rules,
    },
  },
];
