$projectDataPath = Resolve-Path "src/data/project.json"
$assetsDir = "src/assets/projects"
$assetsFullPath = Join-Path (Get-Location) $assetsDir

# Helper to slugify
function Get-Slug ($text) {
    if (-not $text) { return "" }
    $text = $text.ToString().ToLower()
    $text = $text -replace '\s+', '-'
    $text = $text -replace '[^a-z0-9\-]', ''
    $text = $text -replace '\-\-+', '-'
    $text = $text.Trim('-')
    return $text
}

# Read Project Data
$jsonContent = Get-Content -Path $projectDataPath -Raw
$projects = $jsonContent | ConvertFrom-Json

# Mappings (Using commas to separate array elements)
$mappings = @(
    @("Aleppo Sewer Map", "allepo_mapping.png"),
    @("Aleppo System Map Update", "allepo_mapping.png"),
    @("Allegheny National Forest Gas Survey", "anf_survey.jpg"),
    @("Allegheny Valley GIS and Flow Monitoring Plan", "avjsa.jpg"),
    @("The Bible Chapel", "bible_chapel.JPG"),
    @("Clairton Billing Meters", "billing_meter_analysis.png"),
    @("Power Plant Siting Certificate", "brookes_power_siting.jpg"),
    @("3D Model", "brookes_power_siting.jpg"),
    @("Camp Meeting Road Pump Station Site Design and Permitting", "campmeeting_stormwater_design.JPG"),
    @("Interceptor System Hydraulic Modeling", "canonsburg_houston_model.JPG"),
    @("Carnegie Flooding Hydraulic Investigation", "carnegie_flood_investigation.png"),
    @("CEC Go Development", "cecgo.jpg"),
    @("Civil Department Webmaster", "cee_website.JPG"),
    @("Water Distribution Model and GIS Update", "charleroi_water_model.JPG"),
    @("Clairton GIS - CCTV Integration", "clairton_gis_cctv_integration.jpg"),
    @("Creswell Web GIS Proposal", "creswell_heights_water_model.JPG"),
    @("Duquesne and Dravosburg Hydraulic Models", "duquesne_model.jpg"),
    @("System Mapping and GPS Collection Program", "economy_borough_survey_dashboard.JPG"),
    @("Elizabeth Watershed Drainage Maps", "elizabeth_drainage.png"),
    @("Erie Water Works Master Plan Exhibits", "erie_water_works_master_plan.JPG"),
    @("Water Model and Calibration", "finley_township_municipal_authority.JPG"),
    @("Flow Data Processing Script", "flow_format_tool.jpg"),
    @("Forbes Avenue Apartments", "forbes.jpg"),
    @("Frey Pump Station Investigation", "frew_pump_station_model.jpg"),
    @("Water System Hydraulic Model Development", "hamptio_shaler_water_model.jpg"),
    @("Mt. Lebanon Painter's Run Hydraulic Models", "gateway_mt.lebanon.jpg"),
    @("Glannons Pump Station", "glannons_pump_station.png"),
    @("CSO Regulator No. 1 Evaluation and Replacement Concept Design", "glassport_model.JPG"),
    @("GGSA GIS System Map and Survey", "greensburg_gis.JPG"),
    @("MS4 Programs", "greensburg_ms4.png"),
    @("Greenville Stormwater GIS", "greenville_gis.jpg"),
    @("Environmental Fluid Mechanics Laboratory", "hydrology_lab.jpg"),
    @("Post-Construction Sewer System Model", "kiski_model_ltcp.jpg"),
    @("Company Intranet", "klh_intranet.JPG"),
    @("GIS Hydrology Intersection Tool", "landcover_intersect_tool.jpg"),
    @("Mansfield Road Storm Sewer Improvements", "mansfield_road_storm_sewer_improvements.JPG"),
    @("McKeesport Combined Sewer Systems Hydraulic Modeling", "mckeesport_long_run_model.png"),
    @("Duquesne and Dravosburg Long-Term Control Plan", "mckeesport_537_.jpg"),
    @("Moon Water Model", "moon_water_model.JPG"),
    @("MSDGC Model Calibration and Model Reviews", "msdgc_model_calibration.png"),
    @("Admin and Personnel Building Stormwater Design And Permitting", "nhtma_admin_stormwater_design.JPG"),
    @("Python Out File Reader Script", "outfile_extract_script.png"),
    @("Peebles Road Pump Station", "peebles_pump_station_model.JPG"),
    @("Peters DC Sewer Interceptor Model Validation", "peters_dc_interceptor_model.png"),
    @("PWSA Wet Weather Program Manager", "pittsburgh_water_wet_weather_program.png"),
    @("Pool-Riffle Shear Stress Models", "pool_riffle_project.jpg"),
    @("Corrective Action Plan Engineering Evaluation", "prospect_model.JPG"),
    @("Carnegie Overflow Regression Model", "regression_tool.JPG"),
    @("System Mapping and Collection Program", "richland_surevy.JPG"),
    @("Water System Master Plan Update", "richland_water_model.JPG"),
    @("Robinson Run Model", "robinson_run_model.png"),
    @("System Map", "rostraver_gis.JPG"),
    @("Zoning Map Updates", "rostraver_zoning.JPG"),
    @("Saddle Creek Groundwater Monitoring Dashboard", "saddle_creek_dashboard.png"),
    @("Salt Run Dam PMF Study", "saltrun_hms_study.png"),
    @("Water System Mapbooks", "sewickley_gis.JPG"),
    @("GIS Mapbook Reproduction", "shaler_mapbook.jpg"),
    @("Smith Township GIS Mapping Program", "smith_survey.JPG"),
    @("South Strabane Gas Well Mapping", "south_strabane_gas_well.JPG"),
    @("Zoning Violation Program", "south_strabane_zoning_dashboard.JPG"),
    @("Zoning Map", "south_strabane_zoning_map.JPG"),
    @("Act 537 Maps using Python", "ssurgo_tool.jpg"),
    @("Laurel Run PMF Study", "st_marys.jpg"),
    @("Stoops Ferry Model", "stoops_ferry_model.png"),
    @("Tipon Channel Physical Model", "tipon_project.jpg"),
    @("Tree Roots and Shear Stress Investigation", "tree_roots.gif"),
    @("Vita Dump Site", "vita_hecras_study.JPG"),
    @("Comprehensive Plan", "wewja_comprehensive_plan.jpg"),
    @("Youghiogheny WWTP Process Lift Station Model", "youghiogheny_lift_station_model.png"),
    @("Order Entry System", "order_entry_tool.jpg")
)

foreach ($row in $mappings) {
    $projectName = $row[0]
    $originalFile = $row[1]

    $project = $projects | Where-Object { $_.name -eq $projectName }
    if ($null -eq $project) {
        Write-Host "Project not found: $projectName" -ForegroundColor Yellow
        continue
    }

    $sourcePath = Join-Path $assetsFullPath $originalFile
    if (-not (Test-Path $sourcePath)) {
        # Try checking if it was ALREADY renamed (in case of re-run)
        $slugCheck = Get-Slug $projectName
        $extCheck = [System.IO.Path]::GetExtension($originalFile).ToLower()
        $renamedPath = Join-Path $assetsFullPath "$slugCheck$extCheck"
        
        if (Test-Path $renamedPath) {
             $project.image = "/src/assets/projects/$slugCheck$extCheck"
             Write-Host "File already renamed, updating JSON: $slugCheck$extCheck" -ForegroundColor Gray
             continue
        }

        Write-Host "Source file not found: $sourcePath" -ForegroundColor Red
        continue
    }

    $ext = [System.IO.Path]::GetExtension($originalFile).ToLower()
    $slugName = Get-Slug $projectName
    $newFileName = "$slugName$ext"
    $destPath = Join-Path $assetsFullPath $newFileName

    Copy-Item -Path $sourcePath -Destination $destPath -Force
    Write-Host "Copied $originalFile -> $newFileName" -ForegroundColor Cyan
    
    $project.image = "/src/assets/projects/$newFileName"
}

# Save JSON
$projects | ConvertTo-Json -Depth 10 | Set-Content -Path $projectDataPath
Write-Host "Project data updated successfully." -ForegroundColor Green
