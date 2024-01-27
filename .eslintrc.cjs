module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
  },
  extends: [
    '@nuxtjs',
    'plugin:nuxt/recommended',
    '@nuxtjs/eslint-config-typescript',
    'plugin:vue/recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  plugins: ["@typescript-eslint"],
  parser: "vue-eslint-parser",
  parserOptions: {
    parser: "@typescript-eslint/parser",
    ecmaFeatures: {
      modules: true,
    },
    tsconfigRootDir: __dirname,
    project: ["./tsconfig.json"],
    extraFileExtensions: [".vue"],
    createDefaultProgram: true,
  },
  // add your custom rules here
  rules: {
    "comma-dangle": ["error", "always-multiline"],
    "quotes": ["error", "double"],
    "eol-last": "error",
    indent: ["error", 2, { SwitchCase: 1 }],
    "padded-blocks": "off",
    "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
    "no-else-return": "error",
    "@typescript-eslint/no-explicit-any": "off",
    "no-multi-spaces": "off",
    "object-curly-spacing": ["error", "always"],
    "no-mixed-operators": "off",
    "no-return-assign": "off",
    "no-trailing-spaces": "error",
    "no-unreachable": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-unused-vars": "off",
    "no-var": "error",
    "prefer-const": "error",
    "semi": "off",
    "vue/attribute-hyphenation": "error",
    "vue/component-name-in-template-casing": "error",
    "vue/html-closing-bracket-newline": "error",
    "vue/html-closing-bracket-spacing": "error",
    "vue/html-indent": ["error", 2],
    "vue/html-quotes": "error",
    "vue/html-self-closing": "error",
    "vue/max-attributes-per-line": [
      "error",
      {
        singleline: 3,
        multiline: 1,
      },
    ],
    "vue/multi-word-component-names": "off",
    "vue/mustache-interpolation-spacing": "error",
    "vue/no-dupe-keys": "error",
    "vue/no-use-v-if-with-v-for": "error",
    "vue/no-unused-components": "warn",
    "vue/order-in-components": "error",
    "vue/prop-name-casing": "error",
    "vue/require-default-prop": "error",
    "vue/require-prop-types": "error",
    "vue/return-in-computed-property": "error",
    "vue/singleline-html-element-content-newline": [
      "error",
      {
        ignoreWhenNoAttributes: true,
        ignoreWhenEmpty: true,
      },
    ],
    "@typescript-eslint/no-non-null-assertion": "off",
  },
};