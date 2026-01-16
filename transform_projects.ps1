
$jsonPath = "src/data/project.json"
# Read file
$jsonContent = Get-Content -Path $jsonPath -Raw
if (-not $jsonContent) {
    Write-Error "Could not read $jsonPath"
    exit 1
}

$projects = $jsonContent | ConvertFrom-Json

$updatedProjects = @()

foreach ($p in $projects) {
    # 1. Determine Title
    $title = $p.role # Start with existing role value
    
    if ($p.company -and $p.company -like "*Wade Trim*") {
        $title = "Professional Engineer"
    }
    elseif ($p.company -and $p.company -like "*Civil & Environmental Consultants*") {
        $title = "Project Consultant"
    }
    elseif ($p.company -and $p.company -like "*KLH Engineers*") {
        $yearVal = 0
        if ($p.year -match "(\d{4})") {
            $yearVal = [int]$matches[1]
        }
        else {
            # Try date parsing if direct regex fails or for safety
            try {
                $date = [DateTime]::Parse($p.year)
                $yearVal = $date.Year
            }
            catch {
                # Ignore
            }
        }
        
        if ($yearVal -gt 0) {
            if ($yearVal -le 2015) {
                $title = "Project Engineer"
            }
            else {
                $title = "Senior Project Engineer"
            }
        }
    }

    # 2. Construct new object with 'title' replacing 'role'
    # Use ordered dictionary to keep structure clean
    $newObj = [ordered]@{}
    
    # We loop through the properties of the PSCustomObject
    $p.PSObject.Properties | ForEach-Object {
        if ($_.Name -eq "role") {
            $newObj["title"] = $title
        }
        else {
            $newObj[$_.Name] = $_.Value
        }
    }
    
    # Ensure title exists if it wasn't there before
    if (-not $newObj.Contains("title")) {
        $newObj["title"] = $title
    }

    $updatedProjects += $newObj
}

# Convert back to JSON
# Depth 100 to ensure nested objects (arrays, coords) are preserved
$newJson = $updatedProjects | ConvertTo-Json -Depth 100

# PowerShell's ConvertTo-Json escapes non-ascii chars sometimes, but we should be fine with standard attributes.
# Also it might format differently. 
# We'll save it.
$newJson | Set-Content -Path $jsonPath -Encoding UTF8

Write-Host "Successfully updated project.json with $($updatedProjects.Count) projects."
