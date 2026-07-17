import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";

export default [
  {
    ignores: [".next/**", "dist/**", "node_modules/**"],
  },
  js.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      "react-hooks": reactHooks,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "no-undef": "off",
    },
  },
];
