const fs = require('fs');
const path = require('path');

const projectDataPath = path.join(__dirname, '../src/data/project.json');
const assetsDir = path.join(__dirname, '../src/assets/projects');

// Read Project Data
let projects = JSON.parse(fs.readFileSync(projectDataPath, 'utf8'));

// Helper to slugify filenames
const slugify = (text) => {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
};

// Mapping Data from Analysis
// Format: [Project Name in JSON, Current File Name (in assetsDir)]
const mapping = [
    ["Aleppo Sewer Map", "allepo_mapping.png"],
    ["Aleppo System Map Update", "allepo_mapping.png"], // Note: Duplicate use of image
    ["Allegheny National Forest Gas Survey", "anf_survey.jpg"],
    ["Allegheny Valley GIS and Flow Monitoring Plan", "avjsa.jpg"],
    ["The Bible Chapel", "bible_chapel.JPG"],
    ["Clairton Billing Meters", "billing_meter_analysis.png"],
    ["Power Plant Siting Certificate", "brookes_power_siting.jpg"],
    ["3D Model", "brookes_power_siting.jpg"], // 3D Model (ESC Brooke County Power)
    ["Camp Meeting Road Pump Station Site Design and Permitting", "campmeeting_stormwater_design.JPG"],
    ["Interceptor System Hydraulic Modeling", "canonsburg_houston_model.JPG"], // Canonsburg
    ["Carnegie Flooding Hydraulic Investigation", "carnegie_flood_investigation.png"],
    ["CEC Go Development", "cecgo.jpg"],
    ["Civil Department Webmaster", "cee_website.JPG"],
    ["Water Distribution Model and GIS Update", "charleroi_water_model.JPG"], // Charleroi
    ["Clairton GIS - CCTV Integration", "clairton_gis_cctv_integration.jpg"],
    ["Creswell Web GIS Proposal", "creswell_heights_water_model.JPG"],
    ["Duquesne and Dravosburg Hydraulic Models", "duquesne_model.jpg"],
    ["System Mapping and GPS Collection Program", "economy_borough_survey_dashboard.JPG"], // Economy
    ["Elizabeth Watershed Drainage Maps", "elizabeth_drainage.png"],
    ["Erie Water Works Master Plan Exhibits", "erie_water_works_master_plan.JPG"],
    ["Water Model and Calibration", "finley_township_municipal_authority.JPG"], // Findlay
    ["Flow Data Processing Script", "flow_format_tool.jpg"],
    ["Forbes Avenue Apartments", "forbes.jpg"],
    ["Frey Pump Station Investigation", "frew_pump_station_model.jpg"],
    ["Water System Hydraulic Model Development", "hamptio_shaler_water_model.jpg"], // Hampton-Shaler
    ["Mt. Lebanon Painter's Run Hydraulic Models", "gateway_mt.lebanon.jpg"],
    ["Glannons Pump Station", "glannons_pump_station.png"],
    ["CSO Regulator No. 1 Evaluation and Replacement Concept Design", "glassport_model.JPG"], // Glassport
    ["GGSA GIS System Map and Survey", "greensburg_gis.JPG"],
    ["MS4 Programs", "greensburg_ms4.png"],
    ["Greenville Stormwater GIS", "greenville_gis.jpg"],
    ["Environmental Fluid Mechanics Laboratory", "hydrology_lab.jpg"],
    ["Post-Construction Sewer System Model", "kiski_model_ltcp.jpg"],
    ["Company Intranet", "klh_intranet.JPG"],
    ["GIS Hydrology Intersection Tool", "landcover_intersect_tool.jpg"],
    ["Mansfield Road Storm Sewer Improvements", "mansfield_road_storm_sewer_improvements.JPG"],
    ["McKeesport Combined Sewer Systems Hydraulic Modeling", "mckeesport_long_run_model.png"],
    ["Duquesne and Dravosburg Long-Term Control Plan", "mckeesport_537_.jpg"],
    ["Moon Water Model", "moon_water_model.JPG"],
    ["MSDGC Model Calibration and Model Reviews", "msdgc_model_calibration.png"],
    ["Admin and Personnel Building Stormwater Design And Permitting", "nhtma_admin_stormwater_design.JPG"],
    ["Python Out File Reader Script", "outfile_extract_script.png"],
    ["Peebles Road Pump Station", "peebles_pump_station_model.JPG"],
    ["Peters DC Sewer Interceptor Model Validation", "peters_dc_interceptor_model.png"],
    ["PWSA Wet Weather Program Manager", "pittsburgh_water_wet_weather_program.png"],
    ["Pool-Riffle Shear Stress Models", "pool_riffle_project.jpg"],
    ["Corrective Action Plan Engineering Evaluation", "prospect_model.JPG"],
    ["Carnegie Overflow Regression Model", "regression_tool.JPG"],
    ["System Mapping and Collection Program", "richland_gis.JPG"], // Richland (Note: User confirmed richland_surevy.JPG is for this, swapping)
    ["Water System Master Plan Update", "richland_water_model.JPG"], // Richland
    ["Robinson Run Model", "robinson_run_model.png"],
    ["System Map", "rostraver_gis.JPG"], // Rostraver
    ["Zoning Map Updates", "rostraver_zoning.JPG"], // Rostraver
    ["Saddle Creek Groundwater Monitoring Dashboard", "saddle_creek_dashboard.png"],
    ["Salt Run Dam PMF Study", "saltrun_hms_study.png"],
    ["Water System Mapbooks", "sewickley_gis.JPG"],
    ["GIS Mapbook Reproduction", "shaler_mapbook.jpg"],
    ["Smith Township GIS Mapping Program", "smith_survey.JPG"],
    ["South Strabane Gas Well Mapping", "south_strabane_gas_well.JPG"],
    ["Zoning Violation Program", "south_strabane_zoning_dashboard.JPG"],
    ["Zoning Map", "south_strabane_zoning_map.JPG"], // South Strabane
    ["Act 537 Maps using Python", "ssurgo_tool.jpg"],
    ["Laurel Run PMF Study", "st_marys.jpg"],
    ["Stoops Ferry Model", "stoops_ferry_model.png"],
    ["Tipon Channel Physical Model", "tipon_project.jpg"],
    ["Tree Roots and Shear Stress Investigation", "tree_roots.gif"],
    ["Vita Dump Site", "vita_hecras_study.JPG"],
    ["Comprehensive Plan", "wewja_comprehensive_plan.jpg"],
    ["Youghiogheny WWTP Process Lift Station Model", "youghiogheny_lift_station_model.png"],
    ["Order Entry System", "order_entry_tool.jpg"]
];

// Special overrides based on user comments
const specialOverrides = {
    "System Mapping and Collection Program": "richland_surevy.JPG" // User corrected this
};


// 1. Process Mappings
mapping.forEach(([projectName, originalFile]) => {
    // Check for override
    if (specialOverrides[projectName]) {
        originalFile = specialOverrides[projectName];
    }

    const project = projects.find(p => p.name === projectName);
    if (!project) {
        console.warn(`Project not found in JSON: ${projectName}`);
        return;
    }

    const oldPath = path.join(assetsDir, originalFile);

    // Determine new filename
    const ext = path.extname(originalFile);
    const newFileName = slugify(projectName) + ext.toLowerCase(); // Standardize extension case too
    const newPath = path.join(assetsDir, newFileName);

    // Rename File
    if (fs.existsSync(oldPath)) {
        try {
            // If new file already exists (duplicate projects mapping to same image), skip rename but update JSON?
            // Or just copy? Let's copy to be safe if we are "renaming" to multiple targets, but rename if 1:1.
            // Actually, if we rename "A.png" to "B.png", then try to rename "A.png" to "C.png", second fails.
            // Strategy: Check if source exists. If so, copy to new name. We can delete sources later or just leave them?
            // User asked to "rename".
            // Let's Check if we already processed this file (renamed it). 
            // Better: Copy content to new path. Delete old path at the end? 
            // Safer: Copy.

            fs.copyFileSync(oldPath, newPath);
            console.log(`Copied ${originalFile} -> ${newFileName}`);

            // Update JSON
            project.image = `/src/assets/projects/${newFileName}`;
        } catch (err) {
            console.error(`Error processing ${originalFile}: ${err.message}`);
        }
    } else {
        // Check if maybe we ALREADY renamed it (if running script multiple times)
        if (fs.existsSync(newPath)) {
            console.log(`File already exists at dest, updating JSON: ${newFileName}`);
            project.image = `/src/assets/projects/${newFileName}`;
        } else {
            console.warn(`Source file not found: ${originalFile}`);
        }
    }
});

// 2. Add New Projects
const newProjects = [
    {
        "name": "Contact Search Tool",
        "client": "Civil & Environmental Consultants, Inc.",
        "company": "Civil & Environmental Consultants",
        "location": "Rosslyn Farms, PA",
        "category": "Tool Development",
        "year": "2015",
        "tags": ["Excel", "VBA", "Tool Development"],
        "description": "Built a live searchable Excel tool to store and surface key utility contacts for development projects.",
        "role": "Project Consultant",
        "project_role": "Developer",
        "image": "/src/assets/projects/contact-search-tool.jpg",
        "original_image": "contact_search_tool.jpg"
    },
    {
        "name": "Walworth Condos",
        "client": "Private Developer",
        "company": "Civil & Environmental Consultants",
        "location": "Cincinnati, OH",
        "category": "Land Development, Visualization",
        "year": "2015",
        "tags": ["SketchUp", "Visualization", "Permitting"],
        "description": "Created SketchUp rendering for condo development plan to ensure client and stakeholders understood view and visual integrations into Cincinnati neighborhood and city skylines sight lines.",
        "role": "Project Consultant",
        "project_role": "Visualization Specialist",
        "image": "/src/assets/projects/walworth-condos.jpg",
        "original_image": "walworth_condos.jpg"
    },
    {
        "name": "West Mifflin GIS",
        "client": "Borough of West Mifflin",
        "company": "KLH Engineers",
        "location": "West Mifflin, PA",
        "category": "GIS",
        "year": "2019",
        "tags": ["ArcGIS Online", "GIS", "Data Migration"],
        "description": "Built out their GIS from unorganized spatial data and established an ArcGIS Online platform to keep all West Mifflin municipal staff informed.",
        "role": "Senior Project Engineer",
        "project_role": "Task Lead",
        "image": "/src/assets/projects/west-mifflin-gis.jpg",
        "original_image": "west_mifflin_gis.JPG" // Note JPG vs jpg
    }
];

newProjects.forEach(np => {
    // Process Image
    const originalFile = np.original_image;
    // Handle specific file extensions case sensitivity from disk if needed, but assuming user input matches list
    // Actually, check if file exists with case insensitive search? No, simple rename for now.

    // Correction for West Mifflin: west_mifflin_gis.JPG or westmifflin_gis.JPG?
    // User said: "west_mifflin_gis.JPG / westmifflin_gis.JPG". Let's try both.

    let sourcePath = path.join(assetsDir, originalFile);
    if (!fs.existsSync(sourcePath) && originalFile === "west_mifflin_gis.JPG") {
        sourcePath = path.join(assetsDir, "westmifflin_gis.JPG");
    }

    const newFileName = slugify(np.name) + path.extname(sourcePath).toLowerCase();
    const destPath = path.join(assetsDir, newFileName);

    if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, destPath);
        console.log(`Created new project image: ${newFileName}`);
        np.image = `/src/assets/projects/${newFileName}`;
    } else {
        console.warn(`Could not find source image for new project: ${np.name}`);
    }

    delete np.original_image; // Remove temp prop

    // Add to projects if not exists
    if (!projects.find(p => p.name === np.name)) {
        projects.push(np);
        console.log(`Added new project: ${np.name}`);
    }
});

// 3. Write Updated Data
fs.writeFileSync(projectDataPath, JSON.stringify(projects, null, 2));
console.log('Project data updated successfully.');

// 4. Cleanup (Optional - doing soft cleanup of known old files if they were successfully copied)
// For now, I'll leave old files to avoid accidental data loss unless user strictly asked to "rename" implying move.
// "Rename the image files" -> usually means move.
// Let's validte moves. Since I used copy, I should delete source if dest exists and differs.
// Re-looping to delete sources is safer after all copies.
// ... skipping delete for safety in this run, user can delete later or I can do a cleanup pass.

