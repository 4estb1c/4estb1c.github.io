$path = "C:\Users\bicke\Documents\GitHub\chalmondtrip2\itinerary.html"
$enc  = New-Object System.Text.UTF8Encoding $false
$t    = [System.IO.File]::ReadAllText($path, $enc)
$t    = $t.Replace("`r`n", "`n")

$em   = [char]0x2014   # em dash
$won  = [char]0x20A9   # won sign
$star = [char]0x2605   # star
$arr  = [char]0x2192   # right arrow

# Find block by unique anchor text, replace entire block div
function ReplBlock([string]$src, [string]$anchor, [string]$nc) {
    $pos = $src.IndexOf($anchor)
    if ($pos -lt 0) { Write-Host "NOT FOUND: $anchor"; return $src }
    $bmk = "`n    <div class=`"block"
    $si   = $src.LastIndexOf($bmk, $pos)
    if ($si -lt 0) { Write-Host "NO START: $anchor"; return $src }
    $si++  # skip leading newline
    $emk = "`n    </div>"
    $ei   = $src.IndexOf($emk, $pos)
    if ($ei -lt 0) { Write-Host "NO END: $anchor"; return $src }
    $ei  += $emk.Length
    $src.Substring(0, $si) + $nc + $src.Substring($ei)
}

# ── 1. Split Ho Bar III → Club FF into two blocks ─────────────────────────────
$t = ReplBlock $t ">Ho Bar III " (
    '    <div class="block">' + "`n" +
    '      <div class="block-time">23:00</div>' + "`n" +
    '      <div class="block-title">Ho Bar III (Hongdae) <span class="cost">~$5</span></div>' + "`n" +
    '      <div class="block-desc">The classic Hongdae dive ' + $em + ' outdoor plastic-cup Cass, tables jammed with students and expats, the loudest street corner in the neighbourhood. Cheap, unpretentious, perfect first-night Seoul energy.</div>' + "`n" +
    '    </div>' + "`n" +
    '    <div class="block highlight">' + "`n" +
    '      <div class="block-time">01:00</div>' + "`n" +
    '      <div class="block-title">Club FF (Hongdae) <span class="cost">~$10 cover</span></div>' + "`n" +
    '      <div class="block-desc">Two-minute walk from Ho Bar. Hongdae' + [char]0x2019 + 's biggest dancefloor ' + $em + ' hip-hop, EDM and K-pop, packed well into the morning. Cover ' + $won + '10,000 (~$7) includes one drink. You' + [char]0x2019 + 're sleeping two minutes away.</div>' + "`n" +
    '      <div class="block-tip">Clubs don' + [char]0x2019 + 't peak until after midnight. No rush leaving Ho Bar.</div>' + "`n" +
    '    </div>'
)

# ── 2. Day 7: Neurin Maeul + Club FF → just Neurin Maeul (fix seafood + dupe) ─
$t = ReplBlock $t "Neurin Maeul traditional makgeolli bar" (
    '    <div class="block">' + "`n" +
    '      <div class="block-time">22:00</div>' + "`n" +
    '      <div class="block-title">Neurin Maeul makgeolli (Mapo) <span class="cost">~$15</span></div>' + "`n" +
    '      <div class="block-desc">Traditional craft makgeolli bar in the Mapo area ' + $em + ' 10 min taxi from Mangwon Park. Draft rice wine in ceramic bowls, kimchi pajeon, bindaetteok. Warm, unhurried local atmosphere at proper Korean prices. A good way to wind down.</div>' + "`n" +
    '    </div>'
)

# ── 3. Day 8: Gwangjang Market pajeon → Sindang Tteokbokki Town ────────────────
$t = ReplBlock $t "pajeon + makgeolli" (
    '    <div class="block highlight">' + "`n" +
    '      <div class="block-time">18:00</div>' + "`n" +
    '      <div class="block-title">Sindang Tteokbokki Town <span class="cost">~$10</span></div>' + "`n" +
    '      <div class="block-desc">An entire block of tteokbokki stalls around Sindang Station ' + $em + ' Seoul' + [char]0x2019 + 's dedicated street-food enclave for the dish. Every stall is slightly different: some add ramen, some add fish cake, some add cheese. Pick two or three and compare. 5 min metro from DDP. No tourists, all locals.</div>' + "`n" +
    '    </div>'
)

# ── 4. Day 10: Southside Parlor → Blacklist Bar ────────────────────────────────
$t = ReplBlock $t "Seoul's most internationally recognized cocktail bar" (
    '    <div class="block highlight">' + "`n" +
    '      <div class="block-time">21:00</div>' + "`n" +
    '      <div class="block-title">Blacklist Bar (Itaewon) <span class="cost">~$25</span></div>' + "`n" +
    '      <div class="block-desc">Rooftop bar with exceptional bar food and a strong cocktail list. 4.6' + $star + '. Unwind after the Gapyeong day trip with a long drink and Itaewon rooftop views ' + $em + ' the right gear-down speed before heading back.</div>' + "`n" +
    '    </div>'
)

# ── 5. Day 12: Leeum Samsung Museum → Garosu-gil ──────────────────────────────
$t = ReplBlock $t "Leeum Samsung Museum of Art" (
    '    <div class="block highlight">' + "`n" +
    '      <div class="block-time">13:30</div>' + "`n" +
    '      <div class="block-title">Garosu-gil (Sinsa / Apgujeong) <span class="cost">Free</span></div>' + "`n" +
    '      <div class="block-desc">A ginkgo-lined kilometre of boutique fashion, specialty coffee, and independent restaurants in Gangnam' + [char]0x2019 + 's creative quarter. The Seoulite equivalent of a lazy weekend browse ' + $em + ' entirely walkable, zero pressure. Good contrast to the COEX mall visit later. 10 min from Hannam by metro.</div>' + "`n" +
    '    </div>'
)

# ── 6. Day 13: Southside Parlor → Venue/Pistil → DUSK TILL DAWN → Venue/Pistil
$t = ReplBlock $t "Wind down at Southside Parlor" (
    '    <div class="block">' + "`n" +
    '      <div class="block-time">22:00</div>' + "`n" +
    '      <div class="block-title">DUSK TILL DAWN ' + $arr + ' Venue / Pistil <span class="cost">~$20</span></div>' + "`n" +
    '      <div class="block-desc">4.9' + $star + ' cocktail lounge in Itaewon ' + $em + ' jazz at perfect volume, genuinely great drinks, cozy booths. Then Venue (underground techno, 100m away) or Pistil (Haebangchon rooftop, open-air, hip-hop). Both close at 6am.</div>' + "`n" +
    '    </div>'
)

# ── 7. Day 13: Fix dinner desc ref to Blacklist Bar / Bar Cham ─────────────────
$t = $t.Replace(
    'Then Blacklist Bar or Bar Cham for cocktails before the night kicks off.',
    'Then DUSK TILL DAWN for a cocktail (4.9' + $star + ', Itaewon, 5 min walk) before the night kicks off.'
)

# ── 8. Day 14: Southside Parlor → Cakeshop → Bar Cham → Cakeshop ─────────────
$t = ReplBlock $t "Friday night in Itaewon. Southside Parlor" (
    '    <div class="block">' + "`n" +
    '      <div class="block-time">21:00</div>' + "`n" +
    '      <div class="block-title">Bar Cham ' + $arr + ' Cakeshop <span class="cost">~$20</span></div>' + "`n" +
    '      <div class="block-desc">Friday night in Itaewon. Bar Cham for creative cocktails made with Korean spirits in an intimate room. Then Cakeshop: basement Itaewon, best sound system in the city, packed on Fridays, techno/house/bass. Lockers available. Closes at 6am.</div>' + "`n" +
    '    </div>'
)

# ── 9. Day 15: Bogwangjung → Bossam & Jokbal Mapo ────────────────────────────
$t = ReplBlock $t "Final KBBQ" (
    '    <div class="block highlight">' + "`n" +
    '      <div class="block-time">18:30</div>' + "`n" +
    '      <div class="block-title">Bossam & Jokbal ' + $em + ' Mapo farewell feast <span class="cost">~$30</span></div>' + "`n" +
    '      <div class="block-desc">Mapo' + [char]0x2019 + 's signature late-night ritual: bossam (boiled pork belly wrapped in napa cabbage with fermented paste) and jokbal (soy-braised pig' + [char]0x2019 + 's trotters), ordered as a combo platter and shared over soju. Archetypal Korean late-night eating ' + $em + ' messy, communal, unforgettable. 5 min from Hongdae.</div>' + "`n" +
    '    </div>'
)

# ── 10. DAY_ROUTES updates ────────────────────────────────────────────────────
$t = $t.Replace(
    "{n:4, name:'Southside Parlor (Itaewon)',          lat:37.5340, lng:126.9913}",
    "{n:4, name:'Blacklist Bar (Itaewon)',             lat:37.5339, lng:126.9888}"
)
$t = $t.Replace(
    "{n:3, name:'Leeum Museum of Art',                  lat:37.5385, lng:126.9990}",
    "{n:3, name:'Garosu-gil (Sinsa)',                   lat:37.5196, lng:127.0226}"
)
$t = $t.Replace(
    "{n:3, name:'Southside Parlor',                    lat:37.5340, lng:126.9913}",
    "{n:3, name:'Bar Cham (Itaewon)',                  lat:37.5375, lng:126.9913}"
)
$t = $t.Replace(
    "{n:4, name:'Mapo Galmaegi (final KBBQ)',          lat:37.5510, lng:126.9240}",
    "{n:4, name:'Bossam & Jokbal (Mapo)',              lat:37.5493, lng:126.9530}"
)
$t = $t.Replace(
    "{n:4, name:'Gwangjang Market (pajeon + makgeolli)',lat:37.5700, lng:126.9996}",
    "{n:4, name:'Sindang Tteokbokki Town',              lat:37.5587, lng:127.0097}"
)

# ── 11. TITLE_MAP additions ───────────────────────────────────────────────────
$tmOld = "  'soo karaoke':            'seo-k1',`n};"
$tmNew = "  'soo karaoke':            'seo-k1',`n  // new entries`n  'ho bar':                'seo-mk2',`n  'club ff':               'seo-nc4',`n  'mangwon market':        'seo-st4',`n  'garosu':                'seo-wk5',`n  'garosu-gil':            'seo-wk5',`n  'blacklist':             'seo-cb2',`n  'dusk till dawn':        'seo-cb3',`n  'bar cham':              'seo-cb6',`n  'bossam':                'seo-kf6',`n  'sindang':               'seo-sf4',`n  'grill5taco':            'seo-ga1',`n  'seongsu lunch':         'seo-ga1',`n};"
$t = $t.Replace($tmOld, $tmNew)

# ── Write back ────────────────────────────────────────────────────────────────
[System.IO.File]::WriteAllText($path, $t, $enc)
Write-Host "Written."

# ── Verify ────────────────────────────────────────────────────────────────────
$chk = [System.IO.File]::ReadAllText($path, $enc)
@(
    "Ho Bar III (Hongdae):          " + $chk.Contains("Ho Bar III (Hongdae)"),
    "Club FF (Hongdae) as sep block: " + $chk.Contains("Club FF (Hongdae)"),
    "Neurin Maeul only:              " + (-not $chk.Contains("Club FF (Hongdae)`n      <div class=""block-desc"">Two")),
    "Sindang Tteokbokki:             " + $chk.Contains("Sindang Tteokbokki Town"),
    "Gwangjang pajeon gone:          " + (-not $chk.Contains("pajeon + makgeolli <span")),
    "Blacklist Bar (Itaewon):        " + $chk.Contains("Blacklist Bar (Itaewon)"),
    "Garosu-gil block:               " + $chk.Contains("Garosu-gil (Sinsa / Apgujeong)"),
    "DUSK TILL DAWN block:           " + $chk.Contains("DUSK TILL DAWN"),
    "Bar Cham Cakeshop:              " + $chk.Contains("Bar Cham"),
    "Bossam Mapo:                    " + $chk.Contains("Bossam & Jokbal"),
    "TITLE_MAP ho bar:               " + $chk.Contains("'ho bar'"),
    "TITLE_MAP dusk till dawn:       " + $chk.Contains("'dusk till dawn'"),
    "DAY_ROUTES Blacklist:           " + $chk.Contains("'Blacklist Bar (Itaewon)'"),
    "DAY_ROUTES Garosu-gil:          " + $chk.Contains("'Garosu-gil (Sinsa)'"),
    "DAY_ROUTES Sindang:             " + $chk.Contains("'Sindang Tteokbokki Town'")
) | ForEach-Object { Write-Host $_ }
