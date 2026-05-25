import js from "@eslint/js";
import globals from "globals";

export default [
  {
    ignores: ["node_modules/**", "icons/*.png"],
  },
  js.configs.recommended,
  {
    files: ["*.js"],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "script",
      globals: {
        ...globals.browser,
        ...globals.webextensions,
        chrome: "readonly",
      },
    },
  },
  {
    files: ["eslint.config.mjs", "scripts/*.mjs"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.node,
    },
  },
];
