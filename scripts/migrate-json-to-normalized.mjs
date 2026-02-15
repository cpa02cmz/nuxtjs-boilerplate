#!/usr/bin/env node
/**
 * Database Migration Script: JSON to Normalized Tables
 *
 * This script migrates existing JSON string data in the Resource model
 * to the new normalized table structure.
 *
 * Usage: node scripts/migrate-json-to-normalized.js
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

async function migrateTags(resource) {
  if (!resource.tags) return

  try {
    const tags = JSON.parse(resource.tags)
    if (!Array.isArray(tags)) return

    for (const tagName of tags) {
      if (!tagName || typeof tagName !== 'string') continue

      // Normalize tag name
      const normalizedName = tagName.trim().toLowerCase()
      if (!normalizedName) continue

      // Create or get tag
      const tag = await prisma.tag.upsert({
        where: { name: normalizedName },
        update: {},
        create: { name: normalizedName },
      })

      // Create resource-tag relationship
      await prisma.resourceTag
        .create({
          data: {
            resourceId: resource.id,
            tagId: tag.id,
          },
        })
        .catch(() => {
          // Ignore duplicate errors
        })
    }
    console.log(`✅ Migrated ${tags.length} tags for resource: ${resource.id}`)
  } catch (error) {
    console.error(
      `❌ Error migrating tags for resource ${resource.id}:`,
      error.message
    )
  }
}

async function migrateTechnologies(resource) {
  if (!resource.technology) return

  try {
    const technologies = JSON.parse(resource.technology)
    if (!Array.isArray(technologies)) return

    for (const techName of technologies) {
      if (!techName || typeof techName !== 'string') continue

      // Normalize technology name
      const normalizedName = techName.trim().toLowerCase()
      if (!normalizedName) continue

      // Create or get technology
      const technology = await prisma.technology.upsert({
        where: { name: normalizedName },
        update: {},
        create: { name: normalizedName },
      })

      // Create resource-technology relationship
      await prisma.resourceTechnology
        .create({
          data: {
            resourceId: resource.id,
            technologyId: technology.id,
          },
        })
        .catch(() => {
          // Ignore duplicate errors
        })
    }
    console.log(
      `✅ Migrated ${technologies.length} technologies for resource: ${resource.id}`
    )
  } catch (error) {
    console.error(
      `❌ Error migrating technologies for resource ${resource.id}:`,
      error.message
    )
  }
}

async function migrateBenefits(resource) {
  if (!resource.benefits) return

  try {
    const benefits = JSON.parse(resource.benefits)
    if (!Array.isArray(benefits)) return

    for (let i = 0; i < benefits.length; i++) {
      const benefit = benefits[i]
      if (!benefit || typeof benefit !== 'string') continue

      await prisma.resourceBenefit.create({
        data: {
          resourceId: resource.id,
          benefit: benefit.trim(),
          order: i,
        },
      })
    }
    console.log(
      `✅ Migrated ${benefits.length} benefits for resource: ${resource.id}`
    )
  } catch (error) {
    console.error(
      `❌ Error migrating benefits for resource ${resource.id}:`,
      error.message
    )
  }
}

async function migrateFeatures(resource) {
  if (!resource.features) return

  try {
    const features = JSON.parse(resource.features)
    if (!Array.isArray(features)) return

    for (let i = 0; i < features.length; i++) {
      const feature = features[i]
      if (!feature || typeof feature !== 'string') continue

      await prisma.resourceFeature.create({
        data: {
          resourceId: resource.id,
          feature: feature.trim(),
          order: i,
        },
      })
    }
    console.log(
      `✅ Migrated ${features.length} features for resource: ${resource.id}`
    )
  } catch (error) {
    console.error(
      `❌ Error migrating features for resource ${resource.id}:`,
      error.message
    )
  }
}

async function migrateLimitations(resource) {
  if (!resource.limitations) return

  try {
    const limitations = JSON.parse(resource.limitations)
    if (!Array.isArray(limitations)) return

    for (let i = 0; i < limitations.length; i++) {
      const limitation = limitations[i]
      if (!limitation || typeof limitation !== 'string') continue

      await prisma.resourceLimitation.create({
        data: {
          resourceId: resource.id,
          limitation: limitation.trim(),
          order: i,
        },
      })
    }
    console.log(
      `✅ Migrated ${limitations.length} limitations for resource: ${resource.id}`
    )
  } catch (error) {
    console.error(
      `❌ Error migrating limitations for resource ${resource.id}:`,
      error.message
    )
  }
}

async function migratePlatforms(resource) {
  if (!resource.platforms) return

  try {
    const platforms = JSON.parse(resource.platforms)
    if (!Array.isArray(platforms)) return

    for (const platform of platforms) {
      if (!platform || typeof platform !== 'string') continue

      await prisma.resourcePlatform
        .create({
          data: {
            resourceId: resource.id,
            platform: platform.trim(),
          },
        })
        .catch(() => {
          // Ignore duplicate errors
        })
    }
    console.log(
      `✅ Migrated ${platforms.length} platforms for resource: ${resource.id}`
    )
  } catch (error) {
    console.error(
      `❌ Error migrating platforms for resource ${resource.id}:`,
      error.message
    )
  }
}

async function migrateScreenshots(resource) {
  if (!resource.screenshots) return

  try {
    const screenshots = JSON.parse(resource.screenshots)
    if (!Array.isArray(screenshots)) return

    for (let i = 0; i < screenshots.length; i++) {
      const url = screenshots[i]
      if (!url || typeof url !== 'string') continue

      await prisma.resourceScreenshot.create({
        data: {
          resourceId: resource.id,
          url: url.trim(),
          order: i,
        },
      })
    }
    console.log(
      `✅ Migrated ${screenshots.length} screenshots for resource: ${resource.id}`
    )
  } catch (error) {
    console.error(
      `❌ Error migrating screenshots for resource ${resource.id}:`,
      error.message
    )
  }
}

async function migrateAlternatives(resource) {
  if (!resource.alternatives) return

  try {
    const alternatives = JSON.parse(resource.alternatives)
    if (!Array.isArray(alternatives)) return

    for (const alternativeId of alternatives) {
      if (!alternativeId || typeof alternativeId !== 'string') continue

      // Verify the alternative resource exists
      const alternative = await prisma.resource.findUnique({
        where: { id: alternativeId },
      })

      if (!alternative) {
        console.warn(
          `⚠️ Alternative resource ${alternativeId} not found, skipping`
        )
        continue
      }

      await prisma.resourceAlternative
        .create({
          data: {
            resourceId: resource.id,
            alternativeId: alternativeId,
          },
        })
        .catch(() => {
          // Ignore duplicate errors
        })
    }
    console.log(
      `✅ Migrated ${alternatives.length} alternatives for resource: ${resource.id}`
    )
  } catch (error) {
    console.error(
      `❌ Error migrating alternatives for resource ${resource.id}:`,
      error.message
    )
  }
}

async function migrateSpecifications(resource) {
  if (!resource.specifications) return

  try {
    const specs = JSON.parse(resource.specifications)
    if (typeof specs !== 'object' || specs === null) return

    for (const [key, value] of Object.entries(specs)) {
      if (!key || value === undefined) continue

      await prisma.resourceSpecification
        .create({
          data: {
            resourceId: resource.id,
            key: key.trim(),
            value: String(value).trim(),
          },
        })
        .catch(() => {
          // Ignore duplicate errors
        })
    }
    console.log(
      `✅ Migrated ${Object.keys(specs).length} specifications for resource: ${resource.id}`
    )
  } catch (error) {
    console.error(
      `❌ Error migrating specifications for resource ${resource.id}:`,
      error.message
    )
  }
}

async function migrateResource(resource) {
  console.log(`\n🔄 Migrating resource: ${resource.id} - ${resource.title}`)

  await migrateTags(resource)
  await migrateTechnologies(resource)
  await migrateBenefits(resource)
  await migrateFeatures(resource)
  await migrateLimitations(resource)
  await migratePlatforms(resource)
  await migrateScreenshots(resource)
  await migrateAlternatives(resource)
  await migrateSpecifications(resource)
}

async function main() {
  console.log('🚀 Starting JSON to Normalized Tables Migration\n')

  try {
    // Get all resources with JSON fields
    const resources = await prisma.resource.findMany({
      where: {
        deletedAt: null,
      },
    })

    console.log(`📊 Found ${resources.length} resources to migrate\n`)

    let successCount = 0
    let errorCount = 0

    for (const resource of resources) {
      try {
        await migrateResource(resource)
        successCount++
      } catch (error) {
        console.error(`❌ Failed to migrate resource ${resource.id}:`, error)
        errorCount++
      }
    }

    console.log('\n' + '='.repeat(50))
    console.log('✅ Migration Complete!')
    console.log('='.repeat(50))
    console.log(`📈 Successfully migrated: ${successCount} resources`)
    console.log(`❌ Failed migrations: ${errorCount} resources`)
    console.log(`📊 Total resources: ${resources.length}`)
  } catch (error) {
    console.error('\n❌ Migration failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
