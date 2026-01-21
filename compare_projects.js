
import fs from 'fs';

const masterPath = 'c:/GitRepos/portfolio/src/data/project.json';
const updatedPath = 'c:/GitRepos/portfolio/src/data/project.updated.coords.json';

const masterContent = fs.readFileSync(masterPath, 'utf8').replace(/^\uFEFF/, '');
const updatedContent = fs.readFileSync(updatedPath, 'utf8').replace(/^\uFEFF/, '');

const master = JSON.parse(masterContent);
const updated = JSON.parse(updatedContent);

// Normalize helpers
const normalize = (str) => typeof str === 'string' ? str.replace(/&/g, '&') : str;
// Note: JSON.parse handles \u0026 automatically as &, so we don't need complex decoding if it's standard JSON.
// However, we want to be sure about deep equality.

const masterMap = new Map(master.map(p => [p.name, p]));
const updatedMap = new Map(updated.map(p => [p.name, p]));

console.log(`Master count: ${master.length}`);
console.log(`Updated count: ${updated.length}`);

// Check for missing projects
for (const [name, p] of updatedMap) {
    if (!masterMap.has(name)) {
        console.log(`[MISSING IN MASTER] Project: "${name}"`);
    } else {
        const m = masterMap.get(name);
        // Compare fields
        const allKeys = new Set([...Object.keys(p), ...Object.keys(m)]);
        for (const key of allKeys) {
            if (key === 'tags') {
                // Compare tags as sets
                const pTags = new Set(p.tags || []);
                const mTags = new Set(m.tags || []);
                const added = [...pTags].filter(x => !mTags.has(x));
                const removed = [...mTags].filter(x => !pTags.has(x));

                if (added.length > 0 || removed.length > 0) {
                    console.log(`[DIFF] "${name}" .tags:`);
                    if (added.length) console.log(`  + Updated has: ${JSON.stringify(added)}`);
                    if (removed.length) console.log(`  - Master has: ${JSON.stringify(removed)}`);
                }
            } else if (key === 'coords') {
                // Compare coords loosely
                const pCoords = p.coords || [];
                const mCoords = m.coords || [];
                if (JSON.stringify(pCoords) !== JSON.stringify(mCoords)) {
                    console.log(`[DIFF] "${name}" .coords:`);
                    console.log(`  Updated: ${JSON.stringify(pCoords)}`);
                    console.log(`  Master:  ${JSON.stringify(mCoords)}`);
                }
            } else {
                // Simple equality
                if (p[key] !== m[key]) {
                    // Check if it's just undefined vs empty string or similar if desired, but strict for now
                    // except ignoring empty string vs undefined if reasonable? No, let's be strict.
                    // But wait, JSON string might differ?
                    if (JSON.stringify(p[key]) !== JSON.stringify(m[key])) {
                        console.log(`[DIFF] "${name}" .${key}:`);
                        console.log(`  Updated: ${JSON.stringify(p[key])}`);
                        console.log(`  Master:  ${JSON.stringify(m[key])}`);
                    }
                }
            }
        }
    }
}
