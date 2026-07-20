$path = "C:\Users\bicke\Documents\GitHub\chalmondtrip2\itinerary.html"
$enc  = New-Object System.Text.UTF8Encoding $false
$t    = [System.IO.File]::ReadAllText($path, $enc)
$t    = $t.Replace("`r`n", "`n")

$arr = [char]0x2192
$bul = [char]0x00B7

# ── Add transit CSS ────────────────────────────────────────────────────────────
$cssOld = ".block-imgs img:hover { opacity: .85; }`n`n/* Per-day route maps */"
$cssNew = ".block-imgs img:hover { opacity: .85; }`n`n.transit { display:flex; align-items:center; gap:6px; font:11px 'JetBrains Mono',monospace; color:var(--ink-soft); padding:3px 0 1px; opacity:.75; }`n`n/* Per-day route maps */"
$t = $t.Replace($cssOld, $cssNew)

# ── Build transit strings ──────────────────────────────────────────────────────
function T([string]$icon, [string]$min) { "'" + $arr + " $icon " + $bul + " $min'" }

$d5  = "[null, null, " + (T "metro" "15 min") + ", " + (T "metro" "12 min") + ", " + (T "metro" "28 min") + ", " + (T "walk" "5 min") + ", " + (T "walk" "2 min") + "]"
$d6  = "[" + (T "walk" "5 min") + ", " + (T "walk" "10 min") + ", " + (T "cab" "10 min") + ", " + (T "walk" "10 min") + ", " + (T "walk" "5 min") + "]"
$d7  = "[" + (T "walk" "5 min") + ", " + (T "walk" "5 min") + ", " + (T "bus" "15 min") + ", " + (T "walk" "5 min") + ", " + (T "taxi" "10 min") + "]"
$d8  = "[" + (T "walk" "5 min") + ", " + (T "metro" "15 min") + ", " + (T "walk" "5 min") + ", " + (T "metro" "5 min") + ", " + (T "metro" "5 min") + ", " + (T "metro" "25 min") + "]"
$d9  = "[" + (T "walk" "10 min") + ", " + (T "walk" "12 min") + ", " + (T "walk" "15 min") + ", " + (T "walk" "20 min") + "]"
$d10 = "[" + (T "shuttle" "15 min") + ", " + (T "taxi" "15 min") + ", " + (T "ferry" "20 min") + ", '" + $arr + " ferry+taxi " + $bul + " 20 min', " + (T "metro" "15 min") + "]"
$d11 = "[" + (T "walk" "5 min") + ", " + (T "walk" "5 min") + ", " + (T "metro" "5 min") + ", " + (T "taxi" "10 min") + "]"
$d12 = "[" + (T "metro" "10 min") + ", " + (T "metro" "10 min") + ", " + (T "metro" "10 min") + ", " + (T "taxi" "10 min") + ", " + (T "cab" "5 min") + "]"
$d13 = "[" + (T "metro" "15 min") + ", " + (T "metro" "5 min") + ", " + (T "metro" "30 min") + ", " + (T "walk" "5 min") + "]"
$d14 = "[" + (T "walk" "10 min") + ", " + (T "taxi" "12 min") + ", " + (T "metro" "20 min") + ", " + (T "walk" "5 min") + "]"
$d15 = "[" + (T "metro" "20 min") + ", " + (T "metro" "10 min") + ", " + (T "taxi" "10 min") + ", " + (T "taxi" "8 min") + ", " + (T "walk" "5 min") + "]"

# ── Build transit JS block ─────────────────────────────────────────────────────
$jsBlock = "// Transit indicators between blocks`nconst DAY_TRANSIT = {`n  5:  $d5,`n  6:  $d6,`n  7:  $d7,`n  8:  $d8,`n  9:  $d9,`n  10: $d10,`n  11: $d11,`n  12: $d12,`n  13: $d13,`n  14: $d14,`n  15: $d15,`n};`ndocument.querySelectorAll('.day').forEach(day => {`n  const num = parseInt(day.querySelector('.day-num')?.textContent || '0');`n  const ts = DAY_TRANSIT[num];`n  if (!ts) return;`n  const blocks = Array.from(day.querySelectorAll(':scope > .schedule > .block'));`n  ts.forEach((tr, i) => {`n    if (!tr || !blocks[i]) return;`n    const d = document.createElement('div');`n    d.className = 'transit';`n    d.textContent = tr;`n    blocks[i].after(d);`n  });`n});`n`n"

# ── Inject after image injection block ────────────────────────────────────────
$jsAnchor = "  block.appendChild(wrap);`n});`n`n"
$jsNew    = "  block.appendChild(wrap);`n});`n`n" + $jsBlock
$t = $t.Replace($jsAnchor, $jsNew)

[System.IO.File]::WriteAllText($path, $t, $enc)
Write-Host "Written."

$chk = [System.IO.File]::ReadAllText($path, $enc)
@(
    "Transit CSS:   " + $chk.Contains(".transit {"),
    "DAY_TRANSIT:   " + $chk.Contains("DAY_TRANSIT"),
    "JS forEach:    " + $chk.Contains("querySelectorAll('.day')"),
    "Arrow in d5:   " + $chk.Contains("metro")
) | ForEach-Object { Write-Host $_ }
