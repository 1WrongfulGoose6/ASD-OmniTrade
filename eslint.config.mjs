import js from "@eslint/js";
import globals from "globals";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import { defineConfig } from "eslint/config";

export default defineConfig([
  { ignores: ["node_modules/**", ".next/**", "public/**", "build/**", "dist/**", "test-results/**", "coverage/**"] },
  { files: ["**/*.{js,mjs,cjs,jsx}"], plugins: { js }, extends: ["js/recommended"], languageOptions: { globals: {...globals.browser, ...globals.node} }, rules: { "no-unused-vars": "off" } },
  {
    files: ["**/*.{js,jsx}"],
    ...pluginReact.configs.flat.recommended,
    plugins: {
      react: pluginReact,
      "react-hooks": pluginReactHooks
    },
    settings: { react: { version: "detect" } },
    rules: {
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "off"
    }
  },

  {
    files: ["**/__tests__/**", "**/*.test.{js,jsx}", "src/**/__tests__/**"],
    languageOptions: { globals: { 
      describe: "readonly", 
      it: "readonly", 
      test: "readonly",
      expect: "readonly", 
      beforeEach: "readonly", 
      afterEach: "readonly",
      jest: "readonly",
      global: "readonly"
    } },
  },

  {
    files: ["jest.config.js", "babel.config.jest.js", "**/.*rc.js"],
    languageOptions: { globals: { module: "readonly", require: "readonly", __dirname: "readonly", process: "readonly" } },
  },
]);
