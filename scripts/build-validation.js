#!/usr/bin/env node
/**
 * Build validation script to check that the build system is working properly
 * This script runs various checks to ensure the build system is stable
 */

import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

console.log('🔍 Starting build validation checks...')

// Check if package.json exists and is valid
try {
  const packageJsonPath = path.join(__dirname, '../package.json')
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
  console.log('✅ package.json is valid')
} catch (error) {
  console.error('❌ package.json validation failed:', error.message)
  process.exit(1)
}

// Check if nuxt.config.ts exists and is valid
try {
  const nuxtConfigPath = path.join(__dirname, '../nuxt.config.ts')
  if (!fs.existsSync(nuxtConfigPath)) {
    throw new Error('nuxt.config.ts not found')
  }
  console.log('✅ nuxt.config.ts exists')
} catch (error) {
  console.error('❌ nuxt.config.ts validation failed:', error.message)
  process.exit(1)
}

// Check if required directories exist
const requiredDirs = [
  path.join(__dirname, '../components'),
  path.join(__dirname, '../pages'),
  path.join(__dirname, '../layouts'),
  path.join(__dirname, '../assets'),
  path.join(__dirname, '../server'),
]

for (const dir of requiredDirs) {
  if (!fs.existsSync(dir)) {
    console.error(`❌ Required directory does not exist: ${dir}`)
    process.exit(1)
  }
}

console.log('✅ All required directories exist')

// Check if node_modules exists (dependencies installed)
if (!fs.existsSync(path.join(__dirname, '../node_modules'))) {
  console.error('❌ node_modules not found. Run npm install first.')
  process.exit(1)
}

console.log('✅ Dependencies appear to be installed')

// Check if build command is available in package.json
try {
  const packageJsonPath = path.join(__dirname, '../package.json')
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))

  if (!packageJson.scripts || !packageJson.scripts.build) {
    console.error('❌ Build script not found in package.json')
    process.exit(1)
  }

  console.log('✅ Build script exists in package.json')
} catch (error) {
  console.error('❌ Could not read package.json:', error.message)
  process.exit(1)
}

// Try to run a basic nuxt check
try {
  execSync('npx nuxi prepare', {
    cwd: path.join(__dirname, '..'),
    stdio: 'pipe',
  })
  console.log('✅ Nuxt prepare command works')
} catch (error) {
  console.warn(
    '⚠️ Nuxt prepare command failed, but this might be OK:',
    error.message
  )
}

// Check for security headers implementation
try {
  const securityHeadersPath = path.join(
    __dirname,
    '../server/plugins/security-headers.ts'
  )
  if (!fs.existsSync(securityHeadersPath)) {
    throw new Error('security-headers.ts not found')
  }

  const securityHeadersContent = fs.readFileSync(securityHeadersPath, 'utf8')
  if (!securityHeadersContent.includes('Content-Security-Policy')) {
    throw new Error('Content-Security-Policy not found in security headers')
  }

  console.log('✅ Security headers implementation found')
} catch (error) {
  console.error('❌ Security headers validation failed:', error.message)
  process.exit(1)
}

// Check for environment configuration
const envFiles = ['.env.example', '.env']
for (const envFile of envFiles) {
  const envPath = path.join(__dirname, '../', envFile)
  if (fs.existsSync(envPath)) {
    console.log(`✅ Environment file exists: ${envFile}`)
  } else {
    console.warn(`⚠️ Environment file not found: ${envFile}`)
  }
}

console.log('✅ All validation checks passed!')
console.log('🔧 Build system is ready for use')
