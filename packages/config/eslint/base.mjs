// Shared ESLint flat config. Apps extend this and layer on their own
// framework-specific plugins (Next.js, React) rather than duplicating rules.
import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    // Flat config does not read .gitignore automatically - build output
    // left over from a local build must be excluded explicitly, or ESLint
    // lints the minified bundle and produces hundreds of nonsense errors.
    ignores: ["dist/**", "build/**", ".next/**", "coverage/**"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  eslintConfigPrettier,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    },
  },
);
