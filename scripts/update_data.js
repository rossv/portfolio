const fs = require('fs');
const path = require('path');

const csvPath = path.join(__dirname, '../portfolio_master_cleaned.csv');
const jsonPath = path.join(__dirname, '../src/data/project.json');

// Read existing JSON to preserve images
let oldData = [];
if (fs.existsSync(jsonPath)) {
    oldData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
}
const imageMap = {};
oldData.forEach(p => {
    if (p.image) {
        imageMap[p.name] = p.image;
    }
});

// Read and parse CSV
const csvContent = fs.readFileSync(csvPath, 'utf8');
const lines = csvContent.split(/\r?\n/);
const headers = lines[0].split(',').map(h => h.trim());

// Helper to parse CSV line respecting quotes
function parseCsvLine(line) {
    const result = [];
    let current = '';
    let inQuote = false;
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuote = !inQuote;
        } else if (char === ',' && !inQuote) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current.trim());
    return result;
}

const newData = [];

for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = parseCsvLine(line);
    const entry = {};
    headers.forEach((h, index) => {
        // Handle quotes remaining in value
        let val = values[index] || '';
        if (val.startsWith('"') && val.endsWith('"')) {
            val = val.slice(1, -1).replace(/""/g, '"');
        }
        entry[h] = val;
    });

    // Map to JSON schema
    // CSV: name,company,client,location,coords,title,role,tags,year,description,category

    // Parse Coords
    let coords = null;
    if (entry.coords) {
        // Expected format: "Long; Lat" or "-82.6401; 27.7676"
        const parts = entry.coords.split(';');
        if (parts.length === 2) {
            const lon = parseFloat(parts[0].trim());
            const lat = parseFloat(parts[1].trim());
            if (!isNaN(lon) && !isNaN(lat)) {
                coords = [lon, lat];
            }
        }
    }

    // Parse Tags
    let tags = [];
    if (entry.tags) {
        tags = entry.tags.split(';').map(t => t.trim()).filter(t => t);
    }

    // JSON Object
    const project = {
        name: entry.name,
        client: entry.client,
        company: entry.company, // New field
        location: entry.location,
        coords: coords,
        category: entry.category,
        year: entry.year,
        tags: tags,
        description: entry.description,
        role: entry.title, // Mapping CSV title to JSON role (e.g. "Senior Project Engineer")
        project_role: entry.role, // Mapping CSV role to new field (e.g. "Task Lead")
        image: imageMap[entry.name] || "" // Preserve image
    };

    newData.push(project);
}

// Write new JSON
fs.writeFileSync(jsonPath, JSON.stringify(newData, null, 2));

console.log(`Updated project.json with ${newData.length} entries.`);
