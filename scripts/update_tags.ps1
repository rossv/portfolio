# Path setup
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$csvPath = Join-Path $scriptDir "..\portfolio_tags.csv"
$projectJsonPath = Join-Path $scriptDir "..\src\data\project.json"
$tagHierarchyPath = Join-Path $scriptDir "..\src\constants\tagHierarchy.js"

# 1. Read CSV and Build Hierarchy / Valid Tags
$csvLines = Get-Content $csvPath
$header = $csvLines[0]
$dataLines = $csvLines | Select-Object -Skip 1

$hierarchy = [ordered]@{}
$validTags = New-Object System.Collections.Generic.HashSet[string]

foreach ($line in $dataLines) {
    if ([string]::IsNullOrWhiteSpace($line)) { continue }
    
    # Simple CSV split (assuming no commas in tag names for now based on known data)
    $parts = $line -split ","
    $topLevel = $parts[0].Trim()
    $subTag = $parts[1].Trim()

    if ([string]::IsNullOrWhiteSpace($subTag)) { continue }
    
    # Store valid tag
    if (-not $validTags.Contains($subTag)) {
        [void]$validTags.Add($subTag)
    }

    # Add to hierarchy if top level is defined and not "(Uncategorized)"
    if (-not [string]::IsNullOrWhiteSpace($topLevel) -and $topLevel -ne "(Uncategorized)") {
        if (-not $hierarchy.Contains($topLevel)) {
            $hierarchy[$topLevel] = New-Object System.Collections.Generic.List[string]
        }
        [void]$hierarchy[$topLevel].Add($subTag)
    }
}

# 2. Update Project JSON
$jsonContent = Get-Content $projectJsonPath -Raw | ConvertFrom-Json
$removedCount = 0

foreach ($project in $jsonContent) {
    if ($project.tags) {
        $newTags = @()
        foreach ($tag in $project.tags) {
            if ($validTags.Contains($tag)) {
                $newTags += $tag
            }
            else {
                $removedCount++
            }
        }
        $project.tags = $newTags
    }
}

$jsonContent | ConvertTo-Json -Depth 10 | Out-File $projectJsonPath -Encoding utf8

# 3. Generate Tag Hierarchy JS File
$jsOutput = "export const TAG_HIERARCHY = [`n"

foreach ($key in $hierarchy.Keys) {
    $jsOutput += "    {`n"
    $jsOutput += "        label: `"$key`",`n"
    $jsOutput += "        children: [`n"
    
    $children = $hierarchy[$key]
    for ($i = 0; $i -lt $children.Count; $i++) {
        $child = $children[$i]
        $comma = if ($i -lt ($children.Count - 1)) { "," } else { "" }
        $jsOutput += "            `"$child`"$comma`n"
    }
    
    $jsOutput += "        ]`n"
    $jsOutput += "    },`n"
}

# Remove last comma if needed or just leave it (JS allows trailing comma in arrays usually, but let's be clean)
# easier to just close array
$jsOutput += "];`n"

$jsOutput | Out-File $tagHierarchyPath -Encoding utf8

Write-Host "Updated Project JSON (Removed $removedCount tags)"
Write-Host "Updated Tag Hierarchy JS at $tagHierarchyPath"
