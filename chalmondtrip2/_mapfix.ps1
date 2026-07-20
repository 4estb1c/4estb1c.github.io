$enc  = New-Object System.Text.UTF8Encoding $false

# ── 1. itinerary.html: remove budget bar + neutralize leaflet-div-icon ────────
$iPath = "C:\Users\bicke\Documents\GitHub\chalmondtrip2\itinerary.html"
$it = [System.IO.File]::ReadAllText($iPath, $enc).Replace("`r`n", "`n")

# Remove budget-bar block (position-based: first `n  </div> after the budget-bar open)
$bOpen  = "`n  <div class=`"budget-bar`">"
$bClose = "`n  </div>"
$si = $it.IndexOf($bOpen)
if ($si -lt 0) { Write-Host "budget-bar NOT FOUND" } else {
    $ei = $it.IndexOf($bClose, $si + 1)
    if ($ei -lt 0) { Write-Host "budget-bar close NOT FOUND" } else {
        $it = $it.Substring(0, $si) + $it.Substring($ei + $bClose.Length)
        Write-Host "budget-bar removed"
    }
}

# Neutralize Leaflet divIcon box — insert CSS just before .transit rule
$it = $it.Replace(
    ".transit { display:flex",
    ".leaflet-div-icon { background: transparent !important; border: none !important; }" + "`n.transit { display:flex"
)

[System.IO.File]::WriteAllText($iPath, $it, $enc)
Write-Host "itinerary.html written"

# ── 2. map.html: neutralize leaflet-div-icon + add craft_beer ─────────────────
$mPath = "C:\Users\bicke\Documents\GitHub\chalmondtrip2\map.html"
$mt = [System.IO.File]::ReadAllText($mPath, $enc).Replace("`r`n", "`n")

# CSS: add override before custom marker style comment
$mt = $mt.Replace(
    "/* Custom marker style */",
    "/* Neutralize Leaflet default divIcon box */" + "`n.leaflet-div-icon { background: transparent !important; border: none !important; }" + "`n`n/* Custom marker style */"
)

# CAT_COLORS: add craft_beer after beer
$mt = $mt.Replace(
    "  beer:    `"#d4a017`",  // amber",
    "  beer:         `"#d4a017`",  // amber" + "`n  craft_beer:    `"#c88a30`",  // copper gold"
)

# CAT_LABELS: add craft_beer
$mt = $mt.Replace(
    'beer:"Beer/Jingisukan"',
    'beer:"Beer/Jingisukan", craft_beer:"Craft Beer"'
)

# META_CATS drink: add craft_beer alongside beer
$mt = $mt.Replace(
    'new Set(["izakaya","beer","cocktail_bar","makgeolli"])',
    'new Set(["izakaya","beer","craft_beer","cocktail_bar","makgeolli"])'
)

[System.IO.File]::WriteAllText($mPath, $mt, $enc)
Write-Host "map.html written"

# ── Verify ────────────────────────────────────────────────────────────────────
$ic = [System.IO.File]::ReadAllText($iPath, $enc)
$mc = [System.IO.File]::ReadAllText($mPath, $enc)
@(
    "budget-bar gone:              " + (-not $ic.Contains("budget-bar`">")),
    "leaflet-div-icon (itinerary): " + $ic.Contains("leaflet-div-icon { background: transparent"),
    "leaflet-div-icon (map):       " + $mc.Contains("leaflet-div-icon { background: transparent"),
    "craft_beer in CAT_COLORS:     " + $mc.Contains("craft_beer:"),
    "craft_beer in CAT_LABELS:     " + $mc.Contains("craft_beer:`"Craft Beer`""),
    "craft_beer in META_CATS:      " + $mc.Contains('"craft_beer"')
) | ForEach-Object { Write-Host $_ }
