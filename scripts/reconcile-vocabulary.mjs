// One-time: reconcile the tag/category vocabulary and extract `featured` from
// the tags array. Writes src/data/vocabulary.json and rewrites
// src/data/project.json. Dry-run by default; pass --apply to write.
//
// Why: 19 tags in project.json were absent from tagHierarchy.js, one of them
// (`Featured`) is a display flag rather than a topic, and categories were an
// undeclared vocabulary with near-duplicates. See
// gsd/docs/superpowers/specs/2026-07-30-portfolio-metadata-editing-design.md
//
// Usage: node scripts/reconcile-vocabulary.mjs [--apply]

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const JSON_PATH = join(root, 'src/data/project.json');
const VOCAB_PATH = join(root, 'src/data/vocabulary.json');
const HIER_PATH = join(root, 'src/constants/tagHierarchy.js');

const ADD = {
  'H&H Modeling': ['EPANET', 'WWTP'],
  Planning: ['MS4', 'PRP', 'Regulatory'],
  GIS: ['Zoning', 'Cartegraph'],
  'Coding & Tools': ['IT Infrastructure', 'Scripting'],
  Design: ['Lumion', 'Navisworks Manage'],
};
const RENAME_LEAF = { 'PC-SWMM': 'PCSWMM' };
const MERGE_TAG = {
  'InfoWorks 360': 'Infraworks',
  'Hydraulic Modeling': 'Hydraulics',
  Optimatics: 'Optimization',
  Optimizer: 'Optimization',
};
const DROP_TAG = new Set(['Field Work', 'Asset Management']);
const FEATURED = 'Featured';
const UNFEATURE_PREFIX = 'ALCOSAN GROW';
const MERGE_CATEGORY = {
  'Stormwater Design': 'Stormwater',
  'Water Model': 'Hydrologic & Hydraulic Modeling',
  Wastewater: 'Hydrologic & Hydraulic Modeling',
};

const apply = process.argv.includes('--apply');

// --- read the current hierarchy out of the .js module (last time we parse it) ---
const hierSrc = readFileSync(HIER_PATH, 'utf8');
const blocks = [...hierSrc.matchAll(/label:\s*"([^"]+)",\s*children:\s*\[([^\]]*)\]/gs)];
if (blocks.length !== 6) throw new Error(`Expected 6 hierarchy groups, found ${blocks.length}`);

const tagHierarchy = blocks.map(([, label, body]) => ({
  label,
  children: [...body.matchAll(/"([^"]+)"/g)]
    .map((m) => m[1])
    .map((leaf) => RENAME_LEAF[leaf] ?? leaf),
}));

for (const [label, additions] of Object.entries(ADD)) {
  const group = tagHierarchy.find((g) => g.label === label);
  if (!group) throw new Error(`No hierarchy group named "${label}"`);
  for (const t of additions) if (!group.children.includes(t)) group.children.push(t);
  group.children.sort((a, b) => a.localeCompare(b));
}

const leaves = new Set(tagHierarchy.flatMap((g) => g.children));

// --- rewrite the tiles ---
const raw = readFileSync(JSON_PATH, 'utf8');
const eol = raw.includes('\r\n') ? '\r\n' : '\n';
const tiles = JSON.parse(raw);

let featuredCount = 0;
let unfeatured = 0;
const catAtoms = new Set();

for (const tile of tiles) {
  const original = tile.tags ?? [];

  if (original.includes(FEATURED)) {
    if (tile.name.startsWith(UNFEATURE_PREFIX)) unfeatured++;
    else { tile.featured = true; featuredCount++; }
  }

  const next = [];
  for (const tag of original) {
    if (tag === FEATURED || DROP_TAG.has(tag)) continue;
    const mapped = MERGE_TAG[tag] ?? RENAME_LEAF[tag] ?? tag;
    if (!leaves.has(mapped)) throw new Error(`Tile "${tile.name}": tag "${tag}" -> "${mapped}" is not in the hierarchy`);
    if (!next.includes(mapped)) next.push(mapped);
  }
  tile.tags = next;

  const atoms = String(tile.category ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((a) => MERGE_CATEGORY[a] ?? a);
  const deduped = [...new Set(atoms)];
  deduped.forEach((a) => catAtoms.add(a));
  tile.category = deduped.join(', ');
}

const categories = [...catAtoms].sort((a, b) => a.localeCompare(b));
const vocabulary = { tagHierarchy, categories };

console.log(`hierarchy leaves: ${leaves.size}`);
console.log(`category atoms:   ${categories.length}`);
console.log(`featured tiles:   ${featuredCount} (unfeatured ${unfeatured} ALCOSAN tiles)`);
console.log(`tiles:            ${tiles.length}`);

if (!apply) { console.log('\nDRY RUN — pass --apply to write.'); process.exit(0); }

writeFileSync(VOCAB_PATH, JSON.stringify(vocabulary, null, 2).replace(/\n/g, eol) + eol);
writeFileSync(JSON_PATH, JSON.stringify(tiles, null, 4).replace(/\n/g, eol) + eol);
console.log('\nwrote vocabulary.json and project.json');
