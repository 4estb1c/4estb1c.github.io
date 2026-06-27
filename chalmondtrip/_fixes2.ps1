$path = "C:\Users\bicke\Documents\GitHub\chalmondtrip2\itinerary.html"
$raw = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)
# Normalize to LF for matching
$t = $raw.Replace("`r`n", "`n").Replace("`r", "`n")

function Rep($src, $find, $repl) {
    $i = $src.IndexOf($find)
    if ($i -eq -1) { Write-Host "NOT FOUND: $($find.Substring(0,[Math]::Min(60,$find.Length)))"; return $src }
    return $src.Substring(0,$i) + $repl + $src.Substring($i + $find.Length)
}

# 1. Split Ho Bar → Club FF
$t = Rep $t (
"    <div class=""block"">
      <div class=""block-time"">23:00</div>
      <div class=""block-title"">Ho Bar III → Club FF (Hongdae) <span class=""cost"">~`$15</span></div>
      <div class=""block-desc"">Ho Bar III is the classic Hongdae dive — cheap Cass in plastic cups, outdoor tables jammed with students, perfect first-night Seoul energy. Then walk to Club FF two streets away: biggest dancefloor in Hongdae, hip-hop and EDM, cover ₩10,000 includes a drink. You're sleeping two minutes away — make use of it.</div>
      <div class=""block-tip"">Hongdae clubs don't peak until after midnight. Plan to stay out later than you think.</div>
    </div>"
) (
"    <div class=""block"">
      <div class=""block-time"">23:00</div>
      <div class=""block-title"">Ho Bar III (Hongdae) <span class=""cost"">~`$5</span></div>
      <div class=""block-desc"">The classic Hongdae dive — outdoor plastic-cup Cass, tables jammed with students and expats, the loudest street corner in the neighbourhood. Cheap, unpretentious, perfect first-night Seoul energy.</div>
    </div>
    <div class=""block highlight"">
      <div class=""block-time"">01:00</div>
      <div class=""block-title"">Club FF (Hongdae) <span class=""cost"">~`$10 cover</span></div>
      <div class=""block-desc"">Two-minute walk from Ho Bar. Hongdae's biggest dancefloor — hip-hop, EDM and K-pop, packed well into the morning. Cover ₩10,000 (~`$7) includes one drink. You're sleeping two minutes away.</div>
      <div class=""block-tip"">Clubs don't peak until after midnight. No rush leaving Ho Bar.</div>
    </div>"
)

# 2. Leeum Day 12 → Garosu-gil
$t = Rep $t (
"      <div class=""block-title"">Leeum Samsung Museum of Art <span class=""cost"">₩30,000 (~`$22)</span></div>
      <div class=""block-desc"">One of the best private art collections in Asia. Two buildings: Museum 1 (Korean antiquities through Joseon ceramics), Museum 2 (contemporary international — Koons, Hirst, Ai Weiwei, Baselitz). The Rem Koolhaas and Mario Botta buildings are architectural events on their own. Budget 2–3 hours.</div>"
) (
"      <div class=""block-title"">Garosu-gil (Sinsa / Apgujeong) <span class=""cost"">Free</span></div>
      <div class=""block-desc"">A ginkgo-lined kilometre of boutique fashion, specialty coffee, and independent restaurants in Gangnam's creative quarter. The Seoulite equivalent of a lazy weekend browse — entirely walkable, zero pressure. Good contrast to the COEX mall visit later. 10 min from Hannam by metro.</div>"
)

# 3. Day 15 final KBBQ → Bossam & Jokbal Mapo
$t = Rep $t (
"      <div class=""block-title"">Bossam & Jokbal — Mapo farewell feast <span class=""cost"">~`$30</span></div>
      <div class=""block-desc"">Mapo's signature late-night ritual: bossam (boiled pork belly wrapped in napa cabbage with fermented shrimp paste) and jokbal (soy-braised pig's trotters), ordered as a combo platter and shared over soju. Archetypal Korean late-night eating — messy, communal, unforgettable. 5 min from Hongdae.</div>"
) (
"      <div class=""block-title"">Bossam & Jokbal — Mapo farewell feast <span class=""cost"">~`$30</span></div>
      <div class=""block-desc"">Mapo's signature late-night ritual: bossam (boiled pork belly wrapped in napa cabbage with fermented shrimp paste) and jokbal (soy-braised pig's trotters), ordered as a combo platter and shared over soju. Archetypal Korean late-night eating — messy, communal, unforgettable. 5 min from Hongdae.</div>"
)

# Check if Bogwangjung Day 15 was already replaced by previous script
if ($t.Contains("Final KBBQ — Bogwangjung Itaewon")) {
    $t = Rep $t (
"      <div class=""block-title"">Final KBBQ — Bogwangjung Itaewon <span class=""cost"">~`$35</span></div>
      <div class=""block-desc"">4.9★ samgyeopsal specialist in Itaewon. The pork belly here is thick-cut and charred to order — the best single KBBQ meal of the trip. Order the whole spread: chadolbaegi, garlic, kimchi on the grill. Pair with cold soju. The right send-off.</div>"
    ) (
"      <div class=""block-title"">Bossam & Jokbal — Mapo farewell feast <span class=""cost"">~`$30</span></div>
      <div class=""block-desc"">Mapo's signature late-night ritual: bossam (boiled pork belly wrapped in napa cabbage with fermented shrimp paste) and jokbal (soy-braised pig's trotters), ordered as a combo platter and shared over soju. Archetypal Korean late-night eating — messy, communal, unforgettable. 5 min from Hongdae.</div>"
    )
}

# 4. Day 10 Southside → Blacklist Bar
$t = Rep $t (
"      <div class=""block-title"">Southside Parlor (Itaewon) <span class=""cost"">~`$25</span></div>
      <div class=""block-desc"">Seoul's most internationally recognized cocktail bar. Seasonal rotating menu, serious bartenders. Order what they recommend — they know what they're doing.</div>"
) (
"      <div class=""block-title"">Blacklist Bar (Itaewon) <span class=""cost"">~`$25</span></div>
      <div class=""block-desc"">Rooftop bar with exceptional bar food and a strong cocktail list. 4.6★. Unwind after the Gapyeong day trip with a long drink and Itaewon rooftop views — the right gear-down speed before heading back.</div>"
)

# 5. Day 13 Southside → DUSK TILL DAWN
$t = Rep $t (
"      <div class=""block-title"">Southside Parlor → Venue / Pistil <span class=""cost"">~`$20</span></div>
      <div class=""block-desc"">Wind down at Southside Parlor's long bar, then Venue (underground Itaewon, techno) or Pistil (Haebangchon rooftop, open-air, hip-hop). Both close at 6am.</div>"
) (
"      <div class=""block-title"">DUSK TILL DAWN → Venue / Pistil <span class=""cost"">~`$20</span></div>
      <div class=""block-desc"">4.9★ cocktail lounge in Itaewon — jazz at perfect volume, genuinely great drinks, cozy booths. Then Venue (underground techno, 100m away) or Pistil (Haebangchon rooftop, open-air, hip-hop). Both close at 6am.</div>"
)

# 6. Day 14 Southside → Bar Cham (already done by _fixes.ps1, skip if already there)
if (-not $t.Contains("Bar Cham → Cakeshop")) {
    $t = Rep $t (
"      <div class=""block-title"">Southside Parlor → Cakeshop <span class=""cost"">~`$20</span></div>
      <div class=""block-desc"">Friday night in Itaewon. Southside Parlor for the best negroni in Seoul before midnight. Then Cakeshop: basement Itaewon, best sound system in the city, packed on Fridays, techno/house/bass. Lockers available. Closes at 6am.</div>"
    ) (
"      <div class=""block-title"">Bar Cham → Cakeshop <span class=""cost"">~`$20</span></div>
      <div class=""block-desc"">Friday night in Itaewon. Bar Cham for creative cocktails made with Korean spirits in an intimate room. Then Cakeshop: basement Itaewon, best sound system in the city, packed on Fridays, techno/house/bass. Lockers available. Closes at 6am.</div>"
    )
}

# 7. Day 8 Gwangjang → Sindang Tteokbokki
$t = Rep $t (
"      <div class=""block-title"">Gwangjang Market — pajeon + makgeolli <span class=""cost"">~`$15</span></div>
      <div class=""block-desc"">10-minute walk from DDP. Go for pajeon (green onion pancake) and draft makgeolli at the central stalls. Less tourist-heavy at this hour than the bindaetteok lunch rush. Eat standing at the stall.</div>"
) (
"      <div class=""block-title"">Sindang Tteokbokki Town <span class=""cost"">~`$10</span></div>
      <div class=""block-desc"">An entire block of tteokbokki stalls around Sindang Station — Seoul's dedicated street-food enclave for the dish. Every stall is slightly different: some add ramen, some fish cake, some cheese. Pick two or three and compare. 5 min metro from DDP. No tourists, all locals.</div>"
)

# Also fix Day 13 Itaewon dinner desc that mentions Blacklist Bar (now redundant)
$t = $t.Replace(
    "Then Blacklist Bar or Bar Cham for cocktails before the night kicks off.",
    "Then DUSK TILL DAWN (4.9★ cocktail lounge, 5 min walk) for a drink before the night kicks off."
)

[System.IO.File]::WriteAllText($path, $t, (New-Object System.Text.UTF8Encoding $false))
Write-Host "Done"
$chk = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)
@("Ho Bar III (Hongdae)","Club FF (Hongdae)","Garosu-gil","Bossam & Jokbal","Blacklist Bar (Itaewon)","DUSK TILL DAWN","Bar Cham","Sindang Tteokbokki") | ForEach-Object {
    "$_`: " + $(if ($chk.Contains($_)) {"YES"} else {"MISSING"})
}
