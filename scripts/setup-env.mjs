#!/usr/bin/env node
/**
 * Setup script for fresh repository clones
 * Automatically creates .env from .env.example if missing
 * and ensures required directories exist
 */

import { existsSync, copyFileSync, mkdirSync } from 'fs'
import { resolve } from 'path'

const rootDir = process.cwd()

console.log('🔧 Running setup for fresh clone...')

// Check and create .env from .env.example
const envPath = resolve(rootDir, '.env')
const envExamplePath = resolve(rootDir, '.env.example')

if (!existsSync(envPath) && existsSync(envExamplePath)) {
  try {
    copyFileSync(envExamplePath, envPath)
    console.log('✅ Created .env from .env.example')
  } catch (error) {
    console.error('❌ Failed to create .env:', error.message)
    process.exit(1)
  }
} else if (existsSync(envPath)) {
  console.log('ℹ️  .env already exists, skipping creation')
}

// Ensure data directory exists for SQLite
const dataDir = resolve(rootDir, 'data')
if (!existsSync(dataDir)) {
  try {
    mkdirSync(dataDir, { recursive: true })
    console.log('✅ Created data directory')
  } catch (error) {
    console.error('❌ Failed to create data directory:', error.message)
    process.exit(1)
  }
}

console.log('✨ Setup complete!')
