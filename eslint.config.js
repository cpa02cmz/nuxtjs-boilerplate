import js from '@eslint/js'
import prettier from 'eslint-config-prettier'
import vue from 'eslint-plugin-vue'
import importPlugin from 'eslint-plugin-import'
import unicorn from 'eslint-plugin-unicorn'
import prettierPlugin from 'eslint-plugin-prettier'
import vueParser from 'vue-eslint-parser'
import tsParser from '@typescript-eslint/parser'

// Create a flat config based on @nuxtjs/eslint-config
export default [
  js.configs.recommended,
  {
    // Language options (replaces 'env')
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: {
        browser: true,
        node: true,
        es6: true, // For Nuxt 3
        process: 'readonly', // Add process global
        module: 'readonly', // Add module global
        definePageMeta: 'readonly',
        defineNuxtConfig: 'readonly',
        defineNuxtRouteMiddleware: 'readonly',
        useRuntimeConfig: 'readonly',
        useState: 'readonly',
        useFetch: 'readonly',
        useAsyncData: 'readonly',
        navigateTo: 'readonly',
        $fetch: 'readonly',
      },
    },
    // Register plugins
    plugins: {
      vue: vue,
      import: importPlugin,
      unicorn: unicorn,
      prettier: prettierPlugin,
    },
    // Extends (use recommended configurations)
    linterOptions: {},
    rules: {
      // Import/order rules
      'import/order': 'error',
      'import/first': 'error',
      'import/no-mutable-exports': 'error',
      'import/no-unresolved': 'off', // Allow unresolved imports

      // General code rules
      'arrow-parens': ['error', 'as-needed', { requireForBlockBody: true }],
      'generator-star-spacing': 'off', // Allow async-await
      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
      'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
      'prefer-const': [
        'error',
        {
          destructuring: 'any',
          ignoreReadBeforeAssign: false,
        },
      ],
      'no-lonely-if': 'error',
      curly: ['error', 'all'],
      'require-await': 'error',
      'dot-notation': 'error',
      'no-var': 'error',
      'object-shorthand': 'off', // Disable this rule to avoid the shorthand warnings
      'no-useless-rename': 'error',

      // Unicorn rules
      'unicorn/error-message': 'error',
      'unicorn/escape-case': 'error',
      'unicorn/no-array-instanceof': 'error',
      'unicorn/no-new-buffer': 'error',
      'unicorn/no-unsafe-regex': 'off',
      'unicorn/number-literal-case': 'error',
      'unicorn/prefer-exponentiation-operator': 'error',
      'unicorn/prefer-includes': 'error',
      'unicorn/prefer-starts-ends-with': 'error',
      'unicorn/prefer-text-content': 'error',
      'unicorn/prefer-type-error': 'error',
      'unicorn/throw-new-error': 'error',

      // Vue rules (Vue 3 specific)
      'vue/no-parsing-error': [
        'error',
        {
          'x-invalid-end-tag': false,
        },
      ],
      'vue/max-attributes-per-line': [
        'error',
        {
          singleline: 5,
        },
      ],
      'vue/no-v-model-argument': 'off', // Off for Vue 3/Nuxt 3
      'vue/multi-word-component-names': 'error', // Default Vue 3 setting
      'prettier/prettier': 'error',
    },
    settings: {
      'import/resolver': {
        node: { extensions: ['.js', '.mjs'] },
      },
    },
  },
  prettier,
  // Override for Vue files to use Vue parser
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tsParser, // Use TypeScript parser for Vue files
        requireConfigFile: false, // Don't require babel config
        sourceType: 'module',
        ecmaVersion: 2020,
        ecmaFeatures: {
          jsx: false,
        },
      },
    },
    rules: {
      // Vue-specific rules can go here
    },
  },
  // Override for pages and layouts
  {
    files: [
      '**/pages/**/*.{js,ts,vue}',
      '**/layouts/**/*.{js,ts,vue}',
      '**/app.{js,ts,vue}',
      '**/error.{js,ts,vue}',
    ],
    rules: {
      'vue/multi-word-component-names': 'off', // Pages and layouts can be single words
      'vue/no-multiple-template-root': 'error',
    },
  },
]
