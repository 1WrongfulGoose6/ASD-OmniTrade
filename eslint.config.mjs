import js from "@eslint/js";
import globals from "globals";
import pluginReact from "eslint-plugin-react";
import { defineConfig } from "eslint/config";

export default defineConfig([
  { ignores: ["node_modules/**", ".next/**", "public/**", "build/**", "dist/**", "test-results/**", "coverage/**"] },
  { files: ["**/*.{js,mjs,cjs,jsx}"], plugins: { js }, extends: ["js/recommended"], languageOptions: { globals: globals.browser } },
  {
    files: ["**/*.{js,jsx}"],
    ...pluginReact.configs.flat.recommended,
    settings: { react: { version: "detect" } },
  },

  {
    files: ["**/__tests__/**", "**/*.test.{js,jsx}", "src/**/__tests__/**"],
    languageOptions: { globals: { describe: "readonly", it: "readonly", expect: "readonly", beforeEach: "readonly", afterEach: "readonly" } },
  },

  {
    files: ["jest.config.js", "babel.config.jest.js", "**/.*rc.js"],
    languageOptions: { globals: { module: "readonly", require: "readonly", __dirname: "readonly", process: "readonly" } },
  },
]);
