# Path setup
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectJsonPath = Join-Path $scriptDir "..\src\data\project.json"
$tagHierarchyPath = Join-Path $scriptDir "..\src\constants\tagHierarchy.js"
$outputPath = Join-Path $scriptDir "..\portfolio_tags.csv"

# 1. Read Project JSON to find used tags
$jsonContent = Get-Content $projectJsonPath -Raw | ConvertFrom-Json
$usedTags = New-Object System.Collections.Generic.HashSet[string]

foreach ($project in $jsonContent) {
    if ($project.tags) {
        foreach ($tag in $project.tags) {
            [void]$usedTags.Add($tag)
        }
    }
}

# 2. Read Tag Hierarchy (Parsing JS file simply via regex since it is structured)
$jsContent = Get-Content $tagHierarchyPath -Raw
$hierarchy = @{}
$coveredTags = New-Object System.Collections.Generic.HashSet[string]
$csvOutput = @("Top Level Tag,Sub Tag")

# Regex to find label: "Label" and then children: [...]
# This is a bit brittle but should work for the known format
# We'll split by object blocks
$blocks = [regex]::Matches($jsContent, 'label:\s*"([^"]+)",\s*children:\s*\[([^\]]+)\]')

foreach ($match in $blocks) {
    $parent = $match.Groups[1].Value
    $childrenBlock = $match.Groups[2].Value
    
    [void]$coveredTags.Add($parent)
    
    # Parse children strings "Tag1", "Tag2"
    $children = [regex]::Matches($childrenBlock, '"([^"]+)"')
    foreach ($childMatch in $children) {
        $child = $childMatch.Groups[1].Value
        $csvOutput += "$parent,$child"
        [void]$coveredTags.Add($child)
    }
}

# 3. Find Orphans
$orphans = $usedTags | Where-Object { -not $coveredTags.Contains($_) } | Sort-Object

foreach ($orphan in $orphans) {
    if (-not [string]::IsNullOrWhiteSpace($orphan)) {
        $csvOutput += "(Uncategorized),$orphan"
    }
}

# 4. Write CSV
$csvOutput | Out-File -FilePath $outputPath -Encoding utf8

Write-Host "Exported tags to $outputPath"
Write-Host "Found $($orphans.Count) uncategorized tags."
