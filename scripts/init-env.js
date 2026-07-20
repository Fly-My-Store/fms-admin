#!/usr/bin/env node
/**
 * Create envs/<name>.env from .env.example if missing.
 * Usage: node scripts/init-env.js [local|localh|development|production]
 */
const fs = require('fs');
const path = require('path');

const VALID = ['local', 'localh', 'development', 'production'];
const root = path.join(__dirname, '..');
const name = process.argv[2] || 'local';
const template = path.join(root, '.env.example');
const dest = path.join(root, 'envs', `${name}.env`);

if (!VALID.includes(name)) {
  console.error(`Usage: node scripts/init-env.js <${VALID.join('|')}>`);
  process.exit(1);
}

if (fs.existsSync(dest)) {
  console.log(`[env:init] ${path.relative(root, dest)} already exists — skipped`);
  process.exit(0);
}

if (!fs.existsSync(template)) {
  console.error(`[env:init] Template not found: .env.example`);
  process.exit(1);
}

fs.copyFileSync(template, dest);
console.log(`[env:init] created ${path.relative(root, dest)} — edit URLs/secrets for "${name}".`);
