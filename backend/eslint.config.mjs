import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import globals from "globals";

export default [
  {
    files: ["**/*.{ts,js}"],

    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: process.cwd(),
        ecmaVersion: "latest",
        sourceType: "module",
      },
      globals: { ...globals.node, ...globals.browser },
    },

    plugins: {
      "@typescript-eslint": tsPlugin,
    },

    rules: {
      "no-unused-vars": "warn",
      eqeqeq: "error",
      curly: "error",
      semi: ["error", "always"],

      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          args: "after-used",
          argsIgnorePattern: "^_",
          ignoreRestSiblings: true,
          caughtErrors: "none",
          ignoreInterfaces: true,
        },
      ],
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/explicit-function-return-type": "warn",
      "@typescript-eslint/strict-boolean-expressions": "error",
    },
  },
];
