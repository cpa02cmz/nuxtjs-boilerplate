// ESLint flat config for Nuxt 3 project
import js from '@eslint/js'
import vuePlugin from 'eslint-plugin-vue'
import nuxtPlugin from 'eslint-plugin-nuxt'
import globals from 'globals'
import vueParser from 'vue-eslint-parser'
import tsParser from '@typescript-eslint/parser'
import pluginPrettier from 'eslint-plugin-prettier'
import configPrettier from 'eslint-config-prettier'

// Get the vue recommended config
const vueRecommendedConfig = vuePlugin.configs['flat/recommended']

export default [
  js.configs.recommended,
  ...vueRecommendedConfig,
  {
    // For Vue files
    files: ['**/*.vue'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        // Nuxt 3 composables and utilities
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
        useHead: 'readonly',
        useSeoMeta: 'readonly',
        computed: 'readonly',
        ref: 'readonly',
        reactive: 'readonly',
        defineEventHandler: 'readonly',
        setResponseHeader: 'readonly',
        createError: 'readonly',
        vi: 'readonly',
        window: 'readonly',
        process: 'readonly',
        console: 'readonly',
        performance: 'readonly',
        // Vue 3 composition API
        watch: 'readonly',
        onMounted: 'readonly',
        onUnmounted: 'readonly',
        nextTick: 'readonly',
        defineProps: 'readonly',
        defineEmits: 'readonly',
        withDefaults: 'readonly',
        onErrorCaptured: 'readonly',
        clearError: 'readonly',
      },
      parser: vueParser,
      parserOptions: {
        parser: tsParser, // Use TypeScript parser for script blocks in Vue files
        ecmaVersion: 2024,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      prettier: pluginPrettier,
      nuxt: nuxtPlugin,
    },
    rules: {
      'comma-dangle': ['error', 'only-multiline'],
      'vue/multi-word-component-names': 'off',
      'vue/html-self-closing': 'off',
      'vue/max-attributes-per-line': 'off',
      'vue/no-unused-vars': 'off', // Allow unused vars in templates
      'prettier/prettier': 'error',
      'no-console': 'warn',
      'no-debugger': 'warn',
      'no-unused-vars': 'off', // Disable this rule to allow unused variables in development
    },
  },
  {
    // For JS files
    files: ['**/*.js', '**/*.mjs'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        // Nuxt 3 composables and utilities
        definePageMeta: 'readonly',
        defineNuxtConfig: 'readonly',
        defineNuxtRouteMiddleware: 'readonly',
        useRuntimeConfig: 'readonly',
        useState: 'readonly',
        useFetch: 'readonly',
        useAsyncData: 'readonly',
        navigateTo: 'readonly',
        $fetch: 'readonly',
        useHead: 'readonly',
        useSeoMeta: 'readonly',
        computed: 'readonly',
        ref: 'readonly',
        reactive: 'readonly',
        defineEventHandler: 'readonly',
        setResponseHeader: 'readonly',
        createError: 'readonly',
        vi: 'readonly',
        // Vue 3 composition API
        watch: 'readonly',
        onMounted: 'readonly',
        onUnmounted: 'readonly',
        nextTick: 'readonly',
        defineProps: 'readonly',
        defineEmits: 'readonly',
        withDefaults: 'readonly',
      },
    },
    plugins: {
      prettier: pluginPrettier,
      nuxt: nuxtPlugin,
    },
    rules: {
      'comma-dangle': ['error', 'only-multiline'],
      'no-console': 'warn',
      'no-debugger': 'warn',
      'prettier/prettier': 'error',
      'no-unused-vars': 'off', // Disable this rule to allow unused variables in development
    },
  },
  {
    // For TS files
    files: ['**/*.ts'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        // Nuxt 3 composables and utilities
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
        useHead: 'readonly',
        useSeoMeta: 'readonly',
        computed: 'readonly',
        ref: 'readonly',
        reactive: 'readonly',
        defineEventHandler: 'readonly',
        setResponseHeader: 'readonly',
        createError: 'readonly',
        vi: 'readonly',
        window: 'readonly',
        process: 'readonly',
        console: 'readonly',
        performance: 'readonly',
        // Vue 3 composition API
        watch: 'readonly',
        onMounted: 'readonly',
        onUnmounted: 'readonly',
        nextTick: 'readonly',
        defineProps: 'readonly',
        defineEmits: 'readonly',
        withDefaults: 'readonly',
      },
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2024,
        sourceType: 'module',
      },
    },
    plugins: {
      prettier: pluginPrettier,
      nuxt: nuxtPlugin,
    },
    rules: {
      'comma-dangle': ['error', 'only-multiline'],
      'no-console': 'warn',
      'no-debugger': 'warn',
      'prettier/prettier': 'error',
      'no-unused-vars': 'off', // Disable this rule to allow unused variables in development
    },
  },
  {
    // For client plugin files
    files: ['plugins/**/*.js', 'plugins/**/*.ts'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        // Nuxt 3 composables and utilities
        defineNuxtPlugin: 'readonly',
        defineNitroPlugin: 'readonly',
        useRuntimeConfig: 'readonly',
        useState: 'readonly',
        useFetch: 'readonly',
        useAsyncData: 'readonly',
        navigateTo: 'readonly',
        $fetch: 'readonly',
        useHead: 'readonly',
        useSeoMeta: 'readonly',
        computed: 'readonly',
        ref: 'readonly',
        reactive: 'readonly',
        defineEventHandler: 'readonly',
        setResponseHeader: 'readonly',
        createError: 'readonly',
        vi: 'readonly',
        window: 'readonly',
        process: 'readonly',
        console: 'readonly',
        performance: 'readonly',
        // Vue 3 composition API
        watch: 'readonly',
        onMounted: 'readonly',
        onUnmounted: 'readonly',
        nextTick: 'readonly',
        defineProps: 'readonly',
        defineEmits: 'readonly',
        withDefaults: 'readonly',
      },
    },
    rules: {
      'no-console': 'off', // Allow console statements in plugin files for error logging and performance monitoring
    },
  },
  {
    // For server plugin files
    files: ['server/plugins/**/*.js', 'server/plugins/**/*.ts'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: {
        ...globals.node,
        // Nitro composables and utilities
        defineNitroPlugin: 'readonly',
        defineEventHandler: 'readonly',
        setResponseHeader: 'readonly',
        createError: 'readonly',
        readBody: 'readonly',
        setResponseStatus: 'readonly',
        appendHeader: 'readonly',
        getResponseHeader: 'readonly',
        eventHandler: 'readonly',
        toNodeListener: 'readonly',
        useStorage: 'readonly',
        isCorsAllowed: 'readonly',
        handleCacheHeaders: 'readonly',
        isMethod: 'readonly',
        assertMethod: 'readonly',
        readMultipartFormData: 'readonly',
        setCookie: 'readonly',
        deleteCookie: 'readonly',
        parseCookies: 'readonly',
        getCookie: 'readonly',
        getRequestURL: 'readonly',
        getRequestIP: 'readonly',
        getRequestHeaders: 'readonly',
        getRequestHeader: 'readonly',
        getResponseHeaders: 'readonly',
        send: 'readonly',
        sendNoContent: 'readonly',
        isStream: 'readonly',
        isEventStream: 'readonly',
        isWebResponse: 'readonly',
        callNodeListener: 'readonly',
        createNitroError: 'readonly',
        getRequestPath: 'readonly',
        getValidatedQuery: 'readonly',
        readValidatedBody: 'readonly',
        validateBody: 'readonly',
        validateQuery: 'readonly',
        createRouter: 'readonly',
        addRouteMiddleware: 'readonly',
        addServerMiddleware: 'readonly',
        addServerHandler: 'readonly',
        addHttpsServer: 'readonly',
        addServerOrigin: 'readonly',
        addDevServerHandler: 'readonly',
        useNitroApp: 'readonly',
        sendError: 'readonly',
        handleError: 'readonly',
        defineLazyEventHandler: 'readonly',
        isEventHandler: 'readonly',
        toEventHandler: 'readonly',
        defaultContentType: 'readonly',
        defaultResponse: 'readonly',
        writeEarlyHints: 'readonly',
        useAppConfig: 'readonly',
        useRuntimeConfig: 'readonly',
        defineAppConfig: 'readonly',
        console: 'readonly',
        process: 'readonly',
      },
    },
    rules: {
      'no-console': 'off', // Allow console statements in plugin files for error logging and performance monitoring
    },
  },
  {
    // For server files
    files: ['server/**/*.ts'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: {
        ...globals.node,
        defineEventHandler: 'readonly',
        setResponseHeader: 'readonly',
        createError: 'readonly',
        readBody: 'readonly',
        onErrorCaptured: 'readonly',
        setResponseStatus: 'readonly',
      },
    },
  },
  {
    // For test files
    files: ['**/*.spec.ts', '**/*.test.ts', 'test-setup.ts'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: {
        ...globals.node,
        vi: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
      },
    },
    rules: {
      'vue/one-component-per-file': 'off', // Allow multiple components in test files
    },
  },
  {
    // For error logger utility
    files: ['utils/errorLogger.ts'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn', // Allow console in development for error logger
    },
  },
  // Apply prettier config to disable conflicting rules
  configPrettier,
  {
    // Global ignores
    ignores: [
      'dist/**',
      '.nuxt/**',
      'node_modules/**',
      '.output/**',
      'coverage/**',
      'public/**',
      '.nuxt/**/*',
      'nuxt.d.ts',
      'app.config.ts',
    ],
  },
]
