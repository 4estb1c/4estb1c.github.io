$enc = New-Object System.Text.UTF8Encoding $false
$p = "C:\Users\bicke\Documents\GitHub\chalmondtrip2\data.js"
$d = [System.IO.File]::ReadAllText($p, $enc).Replace("`r`n", "`n")

# --- 1. Remove borrowed images from new-addition items ---
$borrowers = @(
    'seo-mp1','seo-ir1','seo-ir2','seo-ir3','seo-ins1',
    'seo-ir4','seo-ir5','seo-sc1','seo-sc3','seo-sc4',
    'seo-ant1','seo-ins2','seo-sc2','seo-hb1','seo-hb2',
    'seo-hb3','seo-hb4','seo-hb5','seo-hb6','seo-hb7',
    'seo-hb8','seo-chm1','seo-chm2','seo-oy1','seo-oy2',
    'seo-sf7','seo-hng1'
)

$lines = $d -split "`n"
$lines = $lines | ForEach-Object {
    $line = $_
    foreach ($id in $borrowers) {
        if ($line.Contains('"' + $id + '"') -and $line.Contains(',images:[')) {
            $line = [regex]::Replace($line, ',images:\["[^"]+","[^"]+","[^"]+"\]', '')
            break
        }
    }
    $line
}

# --- 2. Remove duplicate activity lines ---
# seo-cb8 = Magpie in cocktail_bar (already in craft_beer as seo-br1)
# seo-s7  = Cheonggyecheon in sight (already in walk as seo-wk7)
# seo-k2  = Soo karaoke second branch (already present as seo-k1)
$toRemove = @('seo-cb8', 'seo-s7', 'seo-k2')

$newLines = [System.Collections.Generic.List[string]]::new()
for ($i = 0; $i -lt $lines.Count; $i++) {
    $line = $lines[$i]
    $remove = $false
    foreach ($id in $toRemove) {
        if ($line.Contains('{id:"' + $id + '"')) {
            $remove = $true
            # If removed line had no trailing comma it was last in array;
            # remove trailing comma from previous content line
            if (-not $line.TrimEnd().EndsWith('},')) {
                for ($j = $newLines.Count - 1; $j -ge 0; $j--) {
                    if ($newLines[$j].Trim() -ne '') {
                        if ($newLines[$j].TrimEnd().EndsWith('},')) {
                            $newLines[$j] = $newLines[$j].TrimEnd() -replace ',$', ''
                        }
                        break
                    }
                }
            }
            break
        }
    }
    if (-not $remove) { $newLines.Add($line) }
}

$d = $newLines -join "`n"
[System.IO.File]::WriteAllText($p, $d, $enc)

# --- Verify ---
Write-Host "seo-cb8 removed:  $(-not $d.Contains('{id:""seo-cb8""'))"
Write-Host "seo-s7 removed:   $(-not $d.Contains('{id:""seo-s7""'))"
Write-Host "seo-k2 removed:   $(-not $d.Contains('{id:""seo-k2""'))"

$still = $borrowers | Where-Object { $d -match ('"' + $_ + '"[^}]+,images:\[') }
if ($still.Count -eq 0) {
    Write-Host "All borrower images cleared"
} else {
    Write-Host "Still have images: $($still -join ', ')"
}
