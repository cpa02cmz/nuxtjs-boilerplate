// @ts-check
import js from '@eslint/js'
import pluginPrettier from 'eslint-plugin-prettier'
import prettier from 'eslint-config-prettier'
import vueParser from 'vue-eslint-parser'

// Basic flat config setup for a Nuxt.js project
export default [
  js.configs.recommended,
  {
    // Configure JavaScript files
    files: ['**/*.js', '**/*.mjs'],
    languageOptions: {
      parser: (await import('@typescript-eslint/parser')).default,
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: {
        definePageMeta: 'readonly',
        defineNuxtConfig: 'readonly',
        defineNuxtRouteMiddleware: 'readonly',
        defineNuxtPlugin: 'readonly',
        useRuntimeConfig: 'readonly',
        useState: 'readonly',
        useFetch: 'readonly',
        useAsyncData: 'readonly',
        navigateTo: 'readonly',
        $fetch: 'readonly',
        window: 'readonly',
        process: 'readonly',
        console: 'readonly',
        performance: 'readonly',
      },
    },
    plugins: {
      prettier: pluginPrettier,
    },
    rules: {
      'prettier/prettier': 'error',
    },
  },
  {
    // Configure TypeScript files
    files: ['**/*.ts'],
    languageOptions: {
      parser: (await import('@typescript-eslint/parser')).default,
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: {
        definePageMeta: 'readonly',
        defineNuxtConfig: 'readonly',
        defineNuxtRouteMiddleware: 'readonly',
        defineNuxtPlugin: 'readonly',
        useRuntimeConfig: 'readonly',
        useState: 'readonly',
        useFetch: 'readonly',
        useAsyncData: 'readonly',
        navigateTo: 'readonly',
        $fetch: 'readonly',
        window: 'readonly',
        process: 'readonly',
        console: 'readonly',
        performance: 'readonly',
      },
    },
    plugins: {
      prettier: pluginPrettier,
    },
    rules: {
      'prettier/prettier': 'error',
    },
  },
  {
    // Configure Vue files
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: (await import('@typescript-eslint/parser')).default,
        ecmaVersion: 2023,
        sourceType: 'module',
      },
      globals: {
        definePageMeta: 'readonly',
        defineNuxtConfig: 'readonly',
        defineNuxtRouteMiddleware: 'readonly',
        defineNuxtPlugin: 'readonly',
        useRuntimeConfig: 'readonly',
        useState: 'readonly',
        useFetch: 'readonly',
        useAsyncData: 'readonly',
        navigateTo: 'readonly',
        $fetch: 'readonly',
        window: 'readonly',
        process: 'readonly',
        console: 'readonly',
        performance: 'readonly',
      },
    },
    plugins: {
      prettier: pluginPrettier,
    },
    rules: {
      'prettier/prettier': 'error',
    },
  },
  // Apply prettier config to disable conflicting rules
  prettier,
  {
    // Global ignores
    ignores: [
      'dist/**',
      '.nuxt/**',
      'node_modules/**',
      '.output/**',
      'coverage/**',
      'public/**',
    ],
  },
]
