
const fs = require('fs');
const path = require('path');

const projectPath = path.join(__dirname, 'src/data/project.json');

try {
    const rawData = fs.readFileSync(projectPath, 'utf8');
    let projects = JSON.parse(rawData);

    const updatedProjects = projects.map(p => {
        // 1. Rename role to title (preserve value initially if needed, though we will overwrite based on rules)
        let title = p.role;

        // 2. Apply rules
        // Company: Wade Trim
        if (p.company && p.company.includes('Wade Trim')) {
            title = 'Professional Engineer';
        }

        // Company: Civil & Environmental Consultants
        // Check for variations just in case, but user specified "Civil & Environmental Consultants"
        else if (p.company && p.company.includes('Civil & Environmental Consultants')) {
            title = 'Project Consultant';
        }

        // Company: KLH Engineers
        else if (p.company && p.company.includes('KLH Engineers')) {
            // Extract Year
            let yearVal = 0;
            if (p.year) {
                // Try to find 4 digits
                const match = p.year.match(/\d{4}/);
                if (match) {
                    yearVal = parseInt(match[0], 10);
                }
            }

            if (yearVal > 0) {
                if (yearVal <= 2015) {
                    title = 'Project Engineer';
                } else {
                    title = 'Senior Project Engineer';
                }
            } else {
                // Fallback if year is missing or not parseable, keep original role or default?
                // User didn't specify fallback for missing year on KLH. 
                // Assuming year exists as per previous tasks. 
                // If year is missing, we might want to log it. 
                console.log(`Warning: Could not parse year for KLH project: ${p.name}. Year: ${p.year}. Keeping existing role/title.`);
            }
        }

        // Create new object with 'title' instead of 'role'
        // Maintain order of keys if possible, or just place title where role was?
        // JSON key order isn't guaranteed but nice to have. 
        // We'll just construct a new object.

        const { role, ...rest } = p;
        // Insert title after description for readability (similar to where role was)
        // Finding index of description keys

        const newObj = {};
        for (const key of Object.keys(p)) {
            if (key === 'role') {
                newObj['title'] = title;
            } else {
                newObj[key] = p[key];
            }
        }
        // If role wasn't found (maybe already missing?), add title at the end 
        if (!('title' in newObj)) {
            newObj['title'] = title;
        }

        return newObj;
    });

    const newJson = JSON.stringify(updatedProjects, null, 4);
    fs.writeFileSync(projectPath, newJson, 'utf8');
    console.log('Successfully updated project.json');

} catch (error) {
    console.error('Error processing file:', error);
}
