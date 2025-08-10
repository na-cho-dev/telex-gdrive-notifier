import type { Linter } from "eslint";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import prettierPlugin from "eslint-plugin-prettier";

const config: Linter.Config[] = [
  {
    files: ["src/**/*.ts"],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
        project: "./tsconfig.json",
      },
      globals: {
        console: "readonly",
        process: "readonly",
        Buffer: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        module: "readonly",
        require: "readonly",
        exports: "readonly",
        global: "readonly",
        NodeJS: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": typescriptEslint as any,
      prettier: prettierPlugin as any,
    },
    rules: {
      // Prettier integration
      "prettier/prettier": "error",

      // ESLint recommended rules (not TypeScript specific)
      "no-console": "warn",
      "no-debugger": "error",
      "no-duplicate-imports": "error",
      "no-unused-expressions": "error",
      "prefer-const": "error", // This is ESLint rule, not TypeScript ESLint
      "no-var": "error",
      "no-process-exit": "error",
      "no-process-env": "off",

      // TypeScript ESLint specific rules
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-var-requires": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/interface-name-prefix": "off",
      "@typescript-eslint/no-unsafe-assignment": "warn",
      "@typescript-eslint/no-unsafe-member-access": "warn",
      "@typescript-eslint/no-unsafe-call": "warn",
      "@typescript-eslint/no-unsafe-return": "warn",
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/await-thenable": "error",
      "@typescript-eslint/no-misused-promises": "error",
      "@typescript-eslint/require-await": "warn",
    },
  },
  {
    files: ["**/*.test.ts", "**/*.spec.ts"],
    languageOptions: {
      parser: typescriptParser,
      globals: {
        jest: "readonly",
        describe: "readonly",
        it: "readonly",
        expect: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": typescriptEslint as any,
      prettier: prettierPlugin as any,
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "no-console": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-return": "off",
    },
  },
  {
    ignores: [
      "dist/",
      "node_modules/",
      "coverage/",
      "prisma/migrations/",
      ".prisma/",
      "*.tsbuildinfo",
      "logs/",
      "eslint.config.ts", // Ignore the config file itself
    ],
  },
];

export default config;
