#!/usr/bin/env node
/**
 * SleepBanana Community i18n Validator & Registry Sync
 *
 * Usage:
 *   node scripts/validate.mjs                  # Validate all locale packs + registry.json
 *   node scripts/validate.mjs --update-registry # Recompute coveragePct & translatedKeys in registry.json
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const localesDir = resolve(__dirname, '../locales')
const updateRegistry = process.argv.includes('--update-registry')

const enPath = resolve(localesDir, 'en.json')
const registryPath = resolve(localesDir, 'registry.json')

const enData = JSON.parse(readFileSync(enPath, 'utf8'))
const registry = JSON.parse(readFileSync(registryPath, 'utf8'))
const enMessages = enData.messages ?? {}
const enKeys = Object.keys(enMessages)

function extractPlaceholders(str) {
  const found = new Set()
  const re = /\{([a-zA-Z0-9_]+)\}/g
  let m
  while ((m = re.exec(str)) !== null) found.add(m[1])
  return Array.from(found).sort()
}

const files = readdirSync(localesDir)
  .filter(f => f.endsWith('.json') && f !== 'registry.json')
  .sort()

let hasErrors = false
const summaryRows = []
const registryEntries = Array.isArray(registry.locales) ? registry.locales : []
const registryMap = new Map(registryEntries.map(l => [l.code, l]))

for (const file of files) {
  const fullPath = resolve(localesDir, file)
  const raw = JSON.parse(readFileSync(fullPath, 'utf8'))
  const meta = raw._meta ?? {}
  const msgs = raw.messages ?? {}
  const code = meta.code || file.replace(/\.json$/, '')

  if (!meta.code || !meta.name || !meta.nativeName) {
    console.error(`[FAIL] ${file}: missing required _meta fields (code, name, nativeName)`)
    hasErrors = true
  }
  if (meta.dir && meta.dir !== 'ltr' && meta.dir !== 'rtl') {
    console.error(`[FAIL] ${file}: _meta.dir must be "ltr" or "rtl"`)
    hasErrors = true
  }
  const regEntry = registryMap.get(code)
  if (!regEntry) {
    console.error(`[FAIL] ${file}: locale "${code}" is missing from locales/registry.json`)
    hasErrors = true
  }

  const isBundled = Boolean(regEntry?.bundled)
  const missing = []
  const extra = []
  const placeholderMismatch = []

  for (const key of enKeys) {
    if (typeof msgs[key] !== 'string' || msgs[key].trim() === '') {
      missing.push(key)
    } else {
      const expectedVars = extractPlaceholders(enMessages[key])
      const actualVars = extractPlaceholders(msgs[key])
      if (expectedVars.join(',') !== actualVars.join(',')) {
        placeholderMismatch.push(
          `${key}: expected {${expectedVars.join(', ')}} got {${actualVars.join(', ')}}`,
        )
      }
    }
  }

  for (const key of Object.keys(msgs)) {
    if (!(key in enMessages)) extra.push(key)
  }

  const translatedKeys = enKeys.length - missing.length
  const coveragePct = Math.round((translatedKeys / enKeys.length) * 100)
  summaryRows.push({
    code,
    name: meta.nativeName ?? code,
    pct: coveragePct,
    translatedKeys,
    missing: missing.length,
    bundled: isBundled,
  })

  if (regEntry && updateRegistry) {
    regEntry.name = meta.name ?? regEntry.name
    regEntry.nativeName = meta.nativeName ?? regEntry.nativeName
    regEntry.dir = meta.dir === 'rtl' ? 'rtl' : 'ltr'
    regEntry.file = `locales/${file}`
    regEntry.coveragePct = coveragePct
    regEntry.translatedKeys = translatedKeys
    regEntry.version = meta.version ?? enData._meta?.version ?? '0.24.0'
    if (meta.author) regEntry.author = meta.author
  }

  if (extra.length > 0) {
    console.error(`[FAIL] ${file}: ${extra.length} unknown keys not in en.json: ${extra.slice(0, 8).join(', ')}`)
    hasErrors = true
  }
  if (placeholderMismatch.length > 0) {
    console.error(`[FAIL] ${file}: placeholder mismatch:\n  - ${placeholderMismatch.join('\n  - ')}`)
    hasErrors = true
  }
  if (isBundled && missing.length > 0) {
    console.error(`[FAIL] ${file} (bundled): ${missing.length} missing keys: ${missing.slice(0, 10).join(', ')}`)
    hasErrors = true
  }
}

if (updateRegistry && !hasErrors) {
  registry.canonicalKeys = enKeys.length
  registry.updatedAt = new Date().toISOString().slice(0, 10)
  writeFileSync(registryPath, JSON.stringify(registry, null, 2) + '\n', 'utf8')
}

console.log('\nSleepBanana Community i18n Validation:')
for (const row of summaryRows) {
  const tag = row.bundled ? 'bundled  ' : 'community'
  console.log(
    `  ${row.code.padEnd(6)} ${row.name.padEnd(16)} [${tag}]  ${String(row.pct).padStart(3)}% (${row.translatedKeys}/${enKeys.length} keys)`,
  )
}

if (hasErrors) {
  console.error('\nValidation FAILED.')
  process.exit(1)
}
console.log(`\nPASS: ${summaryRows.length} locale pack(s) validated against ${enKeys.length} canonical keys.`)
