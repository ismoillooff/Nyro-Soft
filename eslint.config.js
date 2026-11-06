import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "build/**",
      ".react-router/**",
      "node_modules/**",
      "app/vendor/hairline/kernel.js",
      "app/vendor/hairline/nyro.js",
      "figures/**",
      "test-results/**",
      "playwright-report/**",
      ".tmp-*/**",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    plugins: { "react-hooks": reactHooks },
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
    },
  },
  {
    files: ["scripts/**/*.{js,mjs,ts}", "*.config.{js,ts}", "tests/**/*.ts"],
    // Node scripts that also run code inside the browser via Playwright.
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
  },
);
