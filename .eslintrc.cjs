module.exports = {
  files: ["**/*.{js,ts,jsx,tsx}"],
  languageOptions: {
    // extends: [
    //   "eslint:recommended",
    //   "plugin:react/recommended",
    //   "plugin:@typescript-eslint/recommended",
    // ],
    parser: "@typescript-eslint/parser",
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
      ecmaVersion: "latest",
      sourceType: "module",
    },
    // plugins: ["react", "@typescript-eslint", "react-hooks"],
  },
  rules: {
    quotes: ["error", "single"],
    semi: ["error", "always"],
    "react/react-in-jsx-scope": "off",
  },
  ignores: [
    "node_modules",
    "package.json",
    "pnpm-lock.yaml",
    "dist",
    "bin",
    "esm-cjs",
    "docs",
  ],
};
