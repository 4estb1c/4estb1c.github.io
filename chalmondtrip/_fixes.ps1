$path = "C:\Users\bicke\Documents\GitHub\chalmondtrip2\itinerary.html"
$t = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)

# ── 1. Split Ho Bar III → Club FF into two blocks ─────────────────────────
$old = @'
    <div class="block">
      <div class="block-time">23:00</div>
      <div class="block-title">Ho Bar III → Club FF (Hongdae) <span class="cost">~$15</span></div>
      <div class="block-desc">Ho Bar III is the classic Hongdae dive — cheap Cass in plastic cups, outdoor tables jammed with students, perfect first-night Seoul energy. Then walk to Club FF two streets away: biggest dancefloor in Hongdae, hip-hop and EDM, cover ₩10,000 includes a drink. You're sleeping two minutes away — make use of it.</div>
      <div class="block-tip">Hongdae clubs don't peak until after midnight. Plan to stay out later than you think.</div>
    </div>
'@
$new = @'
    <div class="block">
      <div class="block-time">23:00</div>
      <div class="block-title">Ho Bar III (Hongdae) <span class="cost">~$5</span></div>
      <div class="block-desc">The classic Hongdae dive bar — outdoor plastic-cup Cass, tables jammed with students and expats, the loudest street corner in the neighbourhood. Cheap, unpretentious, perfect first-night-in-Seoul energy. Open until the early hours; the longer you stay, the more people drift in.</div>
    </div>
    <div class="block highlight">
      <div class="block-time">01:00</div>
      <div class="block-title">Club FF (Hongdae) <span class="cost">~$10 cover</span></div>
      <div class="block-desc">Two-minute walk from Ho Bar. Club FF is Hongdae's biggest dancefloor — hip-hop, EDM and K-pop, packed well into the morning. Cover ₩10,000 (~$7) includes one drink. You're sleeping two minutes away — make use of it.</div>
      <div class="block-tip">Clubs don't peak until after midnight. No rush leaving Ho Bar.</div>
    </div>
'@
$t = $t.Replace($old, $new)

# ── 2. Leeum duplicate: Day 12 replace with Garosu-gil ────────────────────
$old2 = @'
    <div class="block highlight">
      <div class="block-time">13:30</div>
      <div class="block-title">Leeum Samsung Museum of Art <span class="cost">₩30,000 (~$22)</span></div>
      <div class="block-desc">One of the best private art collections in Asia. Two buildings: Museum 1 (Korean antiquities through Joseon ceramics), Museum 2 (contemporary international — Koons, Hirst, Ai Weiwei, Baselitz). The Rem Koolhaas and Mario Botta buildings are architectural events on their own. Budget 2–3 hours.</div>
    </div>
'@
$new2 = @'
    <div class="block highlight">
      <div class="block-time">13:30</div>
      <div class="block-title">Garosu-gil (Sinsa / Apgujeong) <span class="cost">Free</span></div>
      <div class="block-desc">A ginkgo-lined kilometre of boutique fashion, specialty coffee, and independent restaurants in Gangnam's creative quarter. The Seoulite equivalent of a lazy weekend browse — entirely walkable, zero pressure. Good contrast to the COEX mall visit later. 10 min from Hannam by metro.</div>
    </div>
'@
$t = $t.Replace($old2, $new2)

# ── 3. Bogwangjung duplicate: Day 15 → Bossam & Jokbal Mapo ───────────────
$old3 = @'
      <div class="block-title">Final KBBQ — Bogwangjung Itaewon <span class="cost">~$35</span></div>
      <div class="block-desc">4.9★ samgyeopsal specialist in Itaewon. The pork belly here is thick-cut and charred to order — the best single KBBQ meal of the trip. Order the whole spread: chadolbaegi, garlic, kimchi on the grill. Pair with cold soju. The right send-off.</div>
'@
$new3 = @'
      <div class="block-title">Bossam & Jokbal — Mapo farewell feast <span class="cost">~$30</span></div>
      <div class="block-desc">Mapo's signature late-night ritual: bossam (boiled pork belly wrapped in napa cabbage with fermented shrimp paste) and jokbal (soy-braised pig's trotters), ordered as a combo platter and shared over soju. Archetypal Korean late-night eating — messy, communal, unforgettable. 5 min from Hongdae.</div>
'@
$t = $t.Replace($old3, $new3)

# ── 4. Southside Parlor ×4 → vary the bars ────────────────────────────────
# Day 10: Southside → Blacklist Bar
$old4 = @'
    <div class="block highlight">
      <div class="block-time">21:00</div>
      <div class="block-title">Southside Parlor (Itaewon) <span class="cost">~$25</span></div>
      <div class="block-desc">Seoul's most internationally recognized cocktail bar. Seasonal rotating menu, serious bartenders. Order what they recommend — they know what they're doing.</div>
    </div>
'@
$new4 = @'
    <div class="block highlight">
      <div class="block-time">21:00</div>
      <div class="block-title">Blacklist Bar (Itaewon) <span class="cost">~$25</span></div>
      <div class="block-desc">Rooftop bar with exceptional bar food and an excellent craft drinks list. 4.6★. Unwind after the day trip with a long cocktail and Itaewon rooftop views before heading home — after the hilly countryside, this is the right speed.</div>
    </div>
'@
$t = $t.Replace($old4, $new4)

# Day 13: Southside Parlor → Venue / Pistil  →  DUSK TILL DAWN → Venue / Pistil
$old5 = @'
      <div class="block-title">Southside Parlor → Venue / Pistil <span class="cost">~$20</span></div>
      <div class="block-desc">Wind down at Southside Parlor's long bar, then Venue (underground Itaewon, techno) or Pistil (Haebangchon rooftop, open-air, hip-hop). Both close at 6am.</div>
'@
$new5 = @'
      <div class="block-title">DUSK TILL DAWN → Venue / Pistil <span class="cost">~$20</span></div>
      <div class="block-desc">4.9★ cocktail lounge in Itaewon — jazz at perfect volume, genuinely great drinks, cozy booths. Then Venue (underground techno, 100m away) or Pistil (Haebangchon rooftop, open-air, hip-hop). Both close at 6am.</div>
'@
$t = $t.Replace($old5, $new5)

# Day 14: Southside Parlor → Cakeshop  →  Bar Cham → Cakeshop
$old6 = @'
      <div class="block-title">Southside Parlor → Cakeshop <span class="cost">~$20</span></div>
      <div class="block-desc">Friday night in Itaewon. Southside Parlor for the best negroni in Seoul before midnight. Then Cakeshop: basement Itaewon, best sound system in the city, packed on Fridays, techno/house/bass. Lockers available. Closes at 6am.</div>
'@
$new6 = @'
      <div class="block-title">Bar Cham → Cakeshop <span class="cost">~$20</span></div>
      <div class="block-desc">Friday night in Itaewon. Bar Cham for creative cocktails made with Korean spirits (soju, makgeolli, omija) in an intimate room. Then Cakeshop: basement Itaewon, best sound system in the city, packed on Fridays, techno/house/bass. Lockers available. Closes at 6am.</div>
'@
$t = $t.Replace($old6, $new6)

# ── 5. Gwangjang duplicate: Day 8 → Sindang Tteokbokki Town ───────────────
$old7 = @'
    <div class="block highlight">
      <div class="block-time">18:00</div>
      <div class="block-title">Gwangjang Market — pajeon + makgeolli <span class="cost">~$15</span></div>
      <div class="block-desc">10-minute walk from DDP. Go for pajeon (green onion pancake) and draft makgeolli at the central stalls. Less tourist-heavy at this hour than the bindaetteok lunch rush. Eat standing at the stall.</div>
    </div>
'@
$new7 = @'
    <div class="block highlight">
      <div class="block-time">18:00</div>
      <div class="block-title">Sindang Tteokbokki Town <span class="cost">~$10</span></div>
      <div class="block-desc">An entire block of tteokbokki stalls around Sindang Station — Seoul's dedicated street food enclave for the dish. Every stall is slightly different: some add ramen, some fish cake, some cheese. Pick two or three and compare. 5 min metro from DDP. Classic neighbourhood, zero tourists.</div>
    </div>
'@
$t = $t.Replace($old7, $new7)

[System.IO.File]::WriteAllText($path, $t, (New-Object System.Text.UTF8Encoding $false))

# Verify key changes
$check = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)
$tests = @{
    "Ho Bar III split" = $check.Contains("Ho Bar III (Hongdae)")
    "Club FF separate" = ($check -split "Club FF").Count -gt 2
    "Leeum Day12 gone" = -not $check.Contains("Leeum Samsung Museum")
    "Garosu-gil added" = $check.Contains("Garosu-gil")
    "Bossam Mapo added" = $check.Contains("Bossam & Jokbal")
    "Blacklist Day10"   = $check.Contains("Blacklist Bar (Itaewon)")
    "DUSK TILL DAWN"    = $check.Contains("DUSK TILL DAWN")
    "Bar Cham added"    = $check.Contains("Bar Cham")
    "Sindang added"     = $check.Contains("Sindang Tteokbokki")
    "Gwangjang Day8 gone" = -not ($check -match "Gwangjang Market.*pajeon")
}
$tests.GetEnumerator() | ForEach-Object { "$($_.Key): $($_.Value)" }
