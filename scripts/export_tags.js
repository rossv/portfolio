import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { TAG_HIERARCHY } from '../src/constants/tagHierarchy.js';

// Manually read JSON since assert syntax can be finicky in some envs
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectsPath = path.join(__dirname, '../src/data/project.json');
const projects = JSON.parse(fs.readFileSync(projectsPath, 'utf8'));

// 1. Collect all unique tags used in projects
const usedTags = new Set();
projects.forEach(p => {
    if (Array.isArray(p.tags)) {
        p.tags.forEach(t => usedTags.add(t));
    }
});

// 2. Build CSV Rows from Hierarchy
const rows = [];
rows.push(['Top Level Tag', 'Sub Tag']);

const coveredTags = new Set();

TAG_HIERARCHY.forEach(group => {
    const parent = group.label;
    coveredTags.add(parent);

    // If usage check is needed: 
    // console.log(`Processing ${parent}`);

    if (group.children && group.children.length > 0) {
        group.children.forEach(child => {
            const childLabel = typeof child === 'string' ? child : child.label; // Handle nested if any (though structure is flat-ish now)
            rows.push([parent, childLabel]);
            coveredTags.add(childLabel);
        });
    } else {
        // Tag is top level with no children defined in hierarchy
        // We still list it so usage is clear?
        // Actually, hierarchy defines the structure.
    }
});

// 3. Find Orphans (Used tags not in hierarchy)
const orphans = [...usedTags].filter(t => !coveredTags.has(t));

orphans.sort().forEach(t => {
    rows.push(['(Uncategorized)', t]);
});

// 4. Convert to CSV string
const csvContent = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');

// 5. Write file
const outputPath = path.join(__dirname, '../portfolio_tags.csv');
fs.writeFileSync(outputPath, csvContent);

console.log(`Exported ${rows.length - 1} tag relationships to ${outputPath}`);
console.log(`Found ${orphans.length} uncategorized tags.`);
