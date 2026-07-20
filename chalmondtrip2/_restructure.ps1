$enc  = New-Object System.Text.UTF8Encoding $false
$path = "C:\Users\bicke\Documents\GitHub\chalmondtrip2\itinerary.html"
$t    = [System.IO.File]::ReadAllText($path, $enc).Replace("`r`n", "`n")

$em  = [char]0x2014   # em dash
$arr = [char]0x2192   # right arrow
$won = [char]0x20A9   # won sign
$rsq = [char]0x2019   # right single quote
$star = [char]0x2605  # star

# Replace the schedule content for a given day number
function ReplSched([string]$src, [int]$n, [string]$html) {
    $ak = "<div class=`"day-num`">" + $n.ToString("D2") + "</div>"
    $ap = $src.IndexOf($ak)
    if ($ap -lt 0) { Write-Host "Day $n NOT FOUND"; return $src }
    $ot = "<div class=`"schedule`">"
    $sp = $src.IndexOf($ot, $ap) + $ot.Length
    $cl = "`n  </div>`n</div>"
    $ep = $src.IndexOf($cl, $sp)
    if ($ep -lt 0) { Write-Host "Day $n close NOT FOUND"; return $src }
    $src.Substring(0, $sp) + "`n" + $html + "`n  " + $src.Substring($ep + 1)
}

# Helper: build an option item
function Opt([string]$name, [string]$cost, [string]$desc) {
    "      <div class=`"opt`">`n        <div class=`"opt-name`">$name <span class=`"cost`">$cost</span></div>`n        <div class=`"opt-desc`">$desc</div>`n      </div>"
}

# Helper: build an options cluster
function Cluster([string]$head, [string[]]$items) {
    $inner = $items -join "`n"
    "    <div class=`"options-cluster`">`n      <div class=`"options-head`">$head</div>`n$inner`n    </div>"
}

# Helper: build a fixed block
function Block([string]$time, [string]$title, [string]$cost, [string]$desc, [bool]$hi = $false, [string]$tip = "") {
    $cls = if ($hi) { "block highlight" } else { "block" }
    $cs  = if ($cost) { " <span class=`"cost`">$cost</span>" } else { "" }
    $tp  = if ($tip)  { "`n      <div class=`"block-tip`">$tip</div>" } else { "" }
    "    <div class=`"$cls`">`n      <div class=`"block-time`">$time</div>`n      <div class=`"block-title`">$title$cs</div>`n      <div class=`"block-desc`">$desc</div>$tp`n    </div>"
}

# Helper: area label + optional transit-from
function Area([string]$label, [bool]$first = $false) {
    $cls = if ($first) { "area-label first" } else { "area-label" }
    "    <div class=`"$cls`">$label</div>"
}

# Helper: transit indicator (inline, not JS-injected)
function Transit([string]$text) {
    "    <div class=`"transit`">$text</div>"
}

# ── 1. Add CSS for area-clustered layout ─────────────────────────────────────
$t = $t.Replace(
    "/* Per-day route maps */",
    ".area-label { font:700 10px/1.3 'JetBrains Mono',monospace; text-transform:uppercase; letter-spacing:.11em; color:var(--ink-soft); padding:18px 0 4px; border-top:1px solid var(--rule); }" + "`n" +
    ".area-label.first { border-top:none; padding-top:4px; }" + "`n" +
    ".options-cluster { padding:2px 0 4px; }" + "`n" +
    ".options-head { font:600 9px 'JetBrains Mono',monospace; text-transform:uppercase; letter-spacing:.1em; color:var(--ink-soft); opacity:.65; margin:10px 0 4px; }" + "`n" +
    ".opt { padding:5px 0 3px; border-top:1px dashed var(--rule); }" + "`n" +
    ".opt:first-of-type { border-top:none; }" + "`n" +
    ".opt-name { font-weight:600; font-size:13px; color:var(--ink); }" + "`n" +
    ".opt-name .cost { font-size:11px; font-weight:400; color:var(--ink-soft); margin-left:4px; }" + "`n" +
    ".opt-desc { font-size:12px; color:var(--ink-soft); line-height:1.4; margin-top:1px; }" + "`n" +
    "/* Per-day route maps */"
)

# ── 2. Remove JS transit injection (now handled inline in HTML) ───────────────
$jsStart = "// Transit indicators between blocks`n"
$jsEnd   = "});" + "`n`n"
$si = $t.IndexOf($jsStart)
if ($si -ge 0) {
    $ei = $t.IndexOf($jsEnd, $si) + $jsEnd.Length
    $t  = $t.Substring(0, $si) + $t.Substring($ei)
    Write-Host "Transit JS removed"
} else { Write-Host "Transit JS NOT FOUND" }


# ════════════════════════════════════════════════════════════════════════════════
# DAY 5 — Arrive Seoul · Hongdae
# ════════════════════════════════════════════════════════════════════════════════
$d5 = @(
  Block "07:00" "Check out ${em} New Chitose Airport" "" "JR Rapid from Sapporo to CTS (~36 min). Check in for the Seoul flight. Exchange any remaining yen at CTS ${em} rates are better than ICN."
  Block "09:00 $arr" "CTS $arr ICN (Korean Air / Jeju Air)" "~`$200" "~3h flight. Korean Air and Jeju Air run directs on Tuesday mornings, often the cheapest fares of the week."
  Block "13:00" "Arrive ICN ${em} AREX + Line 2 to Hongdae" "~`$6" "AREX direct to Seoul Station (~43 min, ${won}9,500), transfer to Line 2 to Hongdae Univ. Station (~10 min). Drop bags at Nine Brick. You${rsq}re here."
  Area "Hongdae ${em} your base for 11 nights" $true
  Cluster "first afternoon ${em} pick one" @(
    Opt "Gwangjang Market" "~`$20" "30 min metro. Bindaetteok, mayak gimbap, japchae at the central stalls. Circle the market once before you commit. The classic first-night Seoul move."
    Opt "Myeongdong street food" "~`$15" "15 min metro. Cheese corn dog, tteokbokki, tornado potato. Tourist-heavy but energetic ${em} a real Seoul street-food scene."
    Opt "Just Hongdae ${em} explore your neighborhood" "Free" "Wander the main strip, find the park, scope the bars. It${rsq}s all going to be dark and loud tonight; see it in daylight first."
  )
  Cluster "dinner ${em} Hongdae + Sinchon area" @(
    Opt "Sinchon Dakgalbi Alley" "~`$12" "5-min walk toward Sinchon. A block of competing restaurants serving spicy stir-fried chicken in cast-iron pans. Where Seoul students eat."
    Opt "Dae Wang Tong Dak" "~`$18" "Retro Korean fried chicken on the Hongdae main strip. Soy-garlic half-bird + cold Cass. Good first-night energy."
    Opt "Hongdae Gopchang Street" "~`$20" "Grilled intestine restaurants behind the main strip ${em} loud, smoky, local. Brave first-night dining: gopchang + soju + neighbourhood regulars."
    Opt "Kimbap Nara (chain)" "~`$8" "If you${rsq}re jet-lagged and want something quick and light. Kimbap rolls, tteokbokki, ramen. Open late, cheap, zero decision-making required."
  )
  Block "23:00" "Ho Bar III (Hongdae)" "~`$5" "The classic Hongdae dive ${em} outdoor plastic-cup Cass, tables jammed with students and expats, the loudest street corner in the neighbourhood. First-night Seoul energy, bottled." $true
  Cluster "more bars ${em} all within 5 min of Ho Bar" @(
    Opt "Craftbros Hongdae" "~`$9" "Decent craft beer selection, slightly less chaotic than Ho Bar. Good for a quieter second drink."
    Opt "Eoulmadang-ro outdoor bar strip" "~`$8" "The outdoor bar street behind Hongdae park ${em} dozens of plastic tables, cheap pitchers, loud K-pop. The full Hongdae tableau."
  )
  Cluster "clubs ${em} all Hongdae, 2-min walk from Ho Bar" @(
    Opt "Club FF" "~`$10 cover" "Hongdae${rsq}s biggest dancefloor. Hip-hop, EDM, K-pop. Cover includes one drink. You${rsq}re sleeping 2 min away ${em} peak energy is after 1am."
    Opt "Club SOAP" "~`$15 cover" "Seoul${rsq}s most respected electronic club. Multi-room, curated lineups, serious sound system. Check Instagram for Saturday lineup."
    Opt "NB2 Hongdae" "~`$8 cover" "YG-affiliated hip-hop club. Young crowd, cheap entry, both floors packed by 1am. Walking distance from Nine Brick."
  )
) -join "`n"
$t = ReplSched $t 5 $d5

# ════════════════════════════════════════════════════════════════════════════════
# DAY 6 — Yongsan / Hannam → Itaewon
# ════════════════════════════════════════════════════════════════════════════════
$d6 = @(
  Area "Yongsan / Hannam" $true
  Block "10:00" "Dragon Hill Spa ${em} jjimjilbang + scrub" "~`$25" "Korea${rsq}s most famous jimjilbang in Yongsan (10 min from Hongdae). ${won}12,000 entry covers the full complex ${em} hot/cold pools, mugwort steam, charcoal sauna. Add a body scrub (Italian-towel scrub, ${won}20,000) for a deeply Korean experience. Plan 2${em}3 hours." $true "No tattoo restriction at Dragon Hill. Towels and shorts provided."
  Cluster "lunch ${em} Hannam-dong (5 min walk from Dragon Hill)" @(
    Opt "Myeongdong Kyoja ${em} Itaewon branch" "~`$12" "Michelin-listed kalguksu (knife-cut noodle soup) and mandu. The Itaewon branch has shorter queues than the Myeongdong original."
    Opt "O${rsq}Kitchen Hannam" "~`$18" "Korean-Western brunch cafe with a sunny patio. Good eggs, decent coffee. Hannam${rsq}s best casual lunch."
    Opt "Tartine Hannam" "~`$12" "Solid French-style bakery in Hannam ${em} pastries, tartines, espresso. Good for a quick, light post-spa lunch."
    Opt "Local gimbap / jeongsik spots (side alleys)" "~`$10" "Hannam${rsq}s back alleys have cheap set-meal restaurants (baekban) with banchan spreads. Ask your hotel; they${rsq}ll point you to the best block."
  )
  Cluster "afternoon ${em} pick one" @(
    Opt "Leeum Museum of Art (Hannam)" "~`$22" "Samsung${rsq}s private museum in Hannam ${em} Mario Botta, Jean Nouvel, and Rem Koolhaas designed the three buildings. Best contemporary Korean art collection in the country. Never crowded."
    Opt "N Seoul Tower / Namsan cable car" "~`$10" "15-min cab from Hannam. Cable car up (${won}16,000 return) or hike the steps in 25 min. Outdoor deck is free and often clearer than the observatory. Sunset panorama over the Han."
    Opt "Namsan park walk" "Free" "Skip the observatory; just walk the wooded Namsan circuit. Cool, shaded, uncrowded on weekdays. Good legs-reset after the spa."
  )
  Transit "$arr taxi / metro ${em} 10 min to Itaewon"
  Area "Itaewon ${em} evening"
  Cluster "dinner ${em} Itaewon (all within 5-min walk of each other)" @(
    Opt "Bogwangjung KBBQ" "~`$45" "4.9$star samgyeopsal specialist. The chef cooks at your table, pairs cuts with sauces, tells you when to eat. Book ahead. The best single KBBQ dinner of the trip."
    Opt "Bangkok Recipe" "~`$20" "Genuinely excellent Thai ${em} green curry, larb, basil fried rice. Best Thai in Seoul. Packed on weekends; arrive before 7pm."
    Opt "Vatos Urban Tacos" "~`$20" "Korean-Mex ${em} galbi tacos, kimchi fries, nachos. Chaotic, loud, fun. The anti-fine-dining Itaewon option."
    Opt "C${rsq}ote Korea" "~`$60" "French-Korean tasting menu in Itaewon. One nice dinner of the trip caliber. Book online."
    Opt "Hannam Halal Guys / street vendors" "~`$12" "If you want something fast and cheap. The Itaewon strip has halal carts and quick-service spots through to late."
  )
  Cluster "bars ${em} Itaewon" @(
    Opt "DUSK TILL DAWN" "~`$18" "4.9$star cocktail lounge. Jazz at perfect volume, genuinely great drinks, cozy booths. The best pre-club drink in Itaewon."
    Opt "Blacklist Bar" "~`$20" "Rooftop bar with Itaewon views and a strong cocktail list. 4.6$star. Good energy late in the week."
    Opt "Bar Cham" "~`$18" "Creative cocktails made with Korean spirits (soju, makgeolli, omija) in an intimate room. One of the most distinctly Korean bar experiences."
    Opt "Southside Parlor" "~`$20" "Internationally recognized cocktail bar with a seasonal rotating menu. Order what the bartender recommends."
  )
  Cluster "clubs ${em} Itaewon" @(
    Opt "Cakeshop" "~`$15 cover" "Basement Itaewon. Best sound system in Seoul. Packed on any night of the week, techno/house/bass. Lockers available."
    Opt "Venue" "~`$10" "Underground Itaewon ${em} 100m from DUSK TILL DAWN. Techno, small and sweaty. Closes at 6am."
    Opt "Pistil (Haebangchon rooftop)" "~`$10" "Open-air rooftop on the HBC hillside. Hip-hop, R&B, outdoor bar. Different vibe from the basement clubs."
  )
) -join "`n"
$t = ReplSched $t 6 $d6

# ════════════════════════════════════════════════════════════════════════════════
# DAY 7 — Hongdae / Sinchon → Mangwon / Mapo
# ════════════════════════════════════════════════════════════════════════════════
$d7 = @(
  Area "Hongdae / Sinchon ${em} morning" $true
  Block "12:00" "Personal Color Analysis" "~`$35" "Book ahead on Instagram or Naver (search: personal color Hongdae). An analyst drapes fabric swatches against your skin under natural light and identifies your seasonal tone: spring / summer / autumn / winter and sub-variants. Takes ~1 hour. Several studios are within 10 min of Nine Brick." $true "Most studios accommodate English. Book 2${em}3 days ahead."
  Cluster "coffee ${em} Hongdae area" @(
    Opt "Stylenanda Pink Pool Cafe (4F)" "~`$8" "The aesthetic pick: rooftop pink pool, Instagram crowd, overpriced but fun. Buy coffee, take the photo, move on."
    Opt "Anthracite Hongdae" "~`$7" "Industrial-style specialty coffee roaster in Hongdae. Serious espresso, slightly quieter than the chain cafes."
    Opt "Any Hollys / Ediya near Nine Brick" "~`$5" "Korean chains with good drip coffee and a seat. Zero pressure, fast, cheap."
  )
  Cluster "lunch ${em} Sinchon / Hongdae area" @(
    Opt "Sinchon Dakgalbi Alley" "~`$12" "A full street of spicy stir-fried chicken restaurants. Try the buldak (fire chicken) version if you can handle heat. This is where Seoul university students eat."
    Opt "Hongdae Fried Chicken strip" "~`$16" "The main Hongdae strip has a dozen fried chicken restaurants (Kyochon, BBQ Chicken, BHC) all competing within 50m. Try the soy-garlic version."
    Opt "Sinchon Budae Jjigae" "~`$10" "Army stew ${em} a legacy of the Korean War: spam, hot dogs, baked beans, ramen, cheese in spicy broth. Cheap, filling, and uniquely Korean."
    Opt "Cafeteria-style Korean set meal (jeongsik)" "~`$9" "Sinchon is a student area with cheap banchan-heavy set meals. Doenjang jjigae (soybean paste stew) + rice + six side dishes for under ${won}12,000."
  )
  Cluster "shopping ${em} Hongdae (walkable from lunch)" @(
    Opt "Stylenanda flagship + 3CE" "browse" "K-beauty and fashion brand ${em} the full store experience with photo-worthy interiors. Get the K-beauty picks before Myeongdong crowds."
    Opt "Kakao Friends Store (Hongdae)" "browse" "Ryan, Apeach, Muzi character goods. Great for quirky gifts at reasonable prices. Usually less crowded than the Myeongdong branch."
    Opt "Hongdae vintage/streetwear market" "~`$20" "Several vintage clothing stores around the park and behind the main street. Good quality rotation ${em} walk and see what${rsq}s good on the day."
    Opt "Hongdae art supply / stationery side streets" "browse" "Smaller stationery and art-goods shops around the neighbourhood ${em} better prices than Insadong, less tourist markup."
  )
  Transit "$arr bus 15 min or walk 20 min to Mangwon"
  Area "Mangwon / Mapo ${em} afternoon + evening"
  Block "18:30" "Mangwon Market" "~`$5" "Real neighbourhood covered market ${em} vendors selling tteok, fresh produce, small-batch makgeolli, grilled corn, hotteok. Locals shop here, not tourists. Pick up snacks and drinks for the park. Best before 6pm when it winds down." $true "Get a hotteok (sweet pancake) from the griddle stall near the entrance. Walk slowly."
  Block "19:30" "Mangwon Hangang Park ${em} chimaek by the river" "~`$20" "5-min walk from the market. Buy beer from the GS25 at the park entrance; order chicken delivery via Baemin app (hotel can pre-order). Eat on the grass watching the Han at golden hour. This is peak Seoul summer." $true "Kakao Bikes at the dock for a riverside cycle if you have the energy."
  Cluster "late evening ${em} Mangwon / Mapo" @(
    Opt "Neurin Maeul makgeolli bar" "~`$15" "Traditional craft makgeolli bar 10 min taxi from Mangwon Park. Draft rice wine in ceramic bowls, kimchi pajeon, bindaetteok. Warm, unhurried, proper local atmosphere."
    Opt "Whalehouse ${em} bookshop cafe" "~`$6" "Seoul${rsq}s most loved indie bookshop in Mangwon. Floor-to-ceiling shelves, good coffee, reading-room atmosphere. Good wind-down option."
    Opt "Mapo neighbourhood pubs" "~`$12" "The Mapo/Mangwon residential streets have small pojangmacha (outdoor tent pubs) and local bars. No recommendations needed ${em} just walk and pick one with a good crowd."
  )
) -join "`n"
$t = ReplSched $t 7 $d7

# ════════════════════════════════════════════════════════════════════════════════
# DAY 8 — Seongsu → Dongdaemun / Sindang
# ════════════════════════════════════════════════════════════════════════════════
$d8 = @(
  Area "Seongsu-dong ${em} Seoul${rsq}s Shoreditch" $true
  Block "09:30" "Cafe Onion (Seongsu)" "~`$10" "The anchor: a converted 1970s iron factory with the best cortado in Seoul and pastries worth eating. Industrial bones, high ceilings, long queues. Arrive at opening to beat the wait. The surrounding streets have sneaker boutiques, vinyl shops, and concept spaces." $true "Walk the blocks around Cafe Onion before or after ${em} each building is a project."
  Cluster "more coffee / breakfast ${em} Seongsu" @(
    Opt "Fritz Coffee Company (Seongsu branch)" "~`$7" "One of Seoul${rsq}s best specialty roasters. Clean espresso, excellent drip, relaxed interior. A shorter queue than Onion on most mornings."
    Opt "LCDC Seoul ground floor cafe" "~`$8" "Concept space in a Seongsu warehouse ${em} good coffee, gallery upstairs, design shop. Combines three stops in one building."
    Opt "Daelim Changgo (warehouse cafe)" "~`$7" "Giant converted warehouse turned multi-brand space. Cafes, shops, an art gallery. The full Seongsu warehouse-chic experience."
  )
  Cluster "lunch ${em} Seongsu" @(
    Opt "Grill5Taco (Seongsu)" "~`$14" "Seoul${rsq}s best tacos. Genuinely excellent, cheap, cheerful. Al pastor and bulgogi tacos side by side. Usually a short queue."
    Opt "Able cafe (Korean fusion set)" "~`$16" "Korean-fusion lunch in a photogenic industrial space. Set meals with banchan, solid brunch options. Good if you want a sit-down."
    Opt "Seongsu-dong local gimbap shops" "~`$8" "The residential side streets have family-run kimbap and jeongsik spots with no menus and no tourists. Cheap and proper."
    Opt "Seoul Forest Cafe area" "~`$10" "The streets near Seoul Forest have a cluster of cafes doing simple lunch sets. Good option if you${rsq}re heading to the park anyway."
  )
  Cluster "afternoon ${em} Seongsu" @(
    Opt "Seoul Forest" "Free" "10-min walk from Cafe Onion. Deer park, butterfly garden, riverside trail. The best city park in Seoul. Take the 2pm hour before it fills with after-school families."
    Opt "Boutique / concept store crawl" "browse" "Seongsu has small-run clothing brands, sneaker shops, and design-object stores that don${rsq}t exist anywhere else in Seoul. No list needed ${em} just walk the side streets."
    Opt "LCDC Seoul (galleries + shops)" "Free" "Multi-brand space in a warehouse. Three floors of Korean designer brands and a gallery. Good for finding things that aren${rsq}t on Garosu-gil."
  )
  Transit "$arr metro Line 2 ${em} 5 min to Sindang, or Line 2/5 to Dongdaemun"
  Area "Dongdaemun / Sindang ${em} evening"
  Block "15:00" "DDP ${em} Dongdaemun Design Plaza" "Free outside" "Zaha Hadid${rsq}s white curvilinear landmark. Walk the exterior at dusk when the LED facade illuminates. Museum galleries inside have rotating design exhibitions (${won}1,000${em}5,000). Best in late afternoon light." $false "The exterior is the attraction. You don${rsq}t need to pay for entry."
  Cluster "food ${em} Dongdaemun / Sindang area" @(
    Opt "Sindang Tteokbokki Town" "~`$10" "An entire block of tteokbokki stalls around Sindang Station. Every vendor is slightly different: some add ramen, some add cheese, some add fish cake. Pick two or three and compare. Wholly local crowd."
    Opt "Kyochon Chicken (Dongdaemun, 24h)" "~`$25" "5 min from DDP. Soy-garlic + honey half-and-half. Pair with Cass beer. The definitive version of Korean fried chicken."
    Opt "DDP food court / street stalls" "~`$12" "Street food vendors operate outside DDP in the evenings. Corn dogs, hotteok, odeng (fishcake skewers), tteok. Walk and graze."
    Opt "Dongdaemun area dakgalbi or Korean BBQ" "~`$20" "The streets around DDP have plenty of KBBQ and dakgalbi spots open late. Find one with a crowd and a grill."
  )
  Cluster "night ${em} Dongdaemun + Hongdae" @(
    Opt "Dongdaemun Night Market (DDP)" "browse" "Opens 8pm, runs to 4am. Wholesale and retail fashion, accessories, custom alterations. Walk both main halls. Great for cheap streetwear and oddities."
    Opt "Club SOAP (Hongdae, metro back)" "~`$15" "Saturday is the night in Seoul. Metro back to Hongdae (~20 min). SOAP is Seoul${rsq}s best electronic club ${em} multi-room, serious sound system."
    Opt "FREEBIRD (Hongdae)" "~`$10" "Hongdae hip-hop club a block from SOAP. Cheaper cover, more accessible, same energy. Good if house music isn${rsq}t your thing."
  )
) -join "`n"
$t = ReplSched $t 8 $d8

# ════════════════════════════════════════════════════════════════════════════════
# DAY 9 — Gyeongbokgung / Bukchon / Insadong → Ikseon-dong
# ════════════════════════════════════════════════════════════════════════════════
$d9 = @(
  Area "Gyeongbokgung / Bukchon / Insadong" $true
  Block "09:00" "Gyeongbokgung Palace in hanbok" "~`$25" "Rent hanbok from a shop outside the east gate (${won}20,000/2h, many styles). Entry is free in hanbok ${em} otherwise ${won}3,000. Go right at opening before the crowds. National Folk Museum inside is free and worth 45 min. This is the one Seoul sight that earns every tourist cliche about it." $true "Multiple rental shops compete on the same block. Walk the row before committing."
  Cluster "after the palace" @(
    Opt "Bukchon Hanok Village" "Free" "15-min walk east. Traditional tile-roofed hanok houses on steep alleys. Gahoe-ro 11-gil has the famous uphill view. Residential area ${em} stay on tourist corridors."
    Opt "National Folk Museum (inside Gyeongbokgung)" "Free" "Skip the hanbok queue and go straight to the Folk Museum if lines are long. Three buildings, strong English labels, genuinely interesting."
  )
  Cluster "lunch ${em} Insadong / Samcheong area" @(
    Opt "Tosokchon Samgyetang" "~`$18" "Famous whole-chicken-in-ginseng-soup restaurant near the palace. Long queues but moves fast. One of Seoul${rsq}s most distinctly Korean dining experiences."
    Opt "Sanchon (Insadong)" "~`$25" "All-vegetarian Korean temple-food set menu, ${won}30,000. Reservation recommended. Genuinely beautiful and unusual ${em} the only non-meat option in the area worth the premium."
    Opt "Galbitang restaurant (Insadong back alleys)" "~`$15" "Beef short-rib soup ${em} rich, slow-cooked, simple. The Insadong side alleys have several good spots. Better food than the main tourist drag."
    Opt "Doenjang jjigae set (neighbourhood spot)" "~`$10" "Fermented soybean paste stew + rice + banchan. Cheap, filling, the workman${rsq}s lunch of the palace district. Any neighborhood spot works."
    Opt "Insadong Ssamzigil courtyard food stalls" "~`$12" "Street food and cafe stalls inside the courtyard. Good for grazing ${em} pancakes, tteok, corn on the cob, cold noodles."
  )
  Cluster "cafes + shops ${em} Samcheong-dong / Insadong" @(
    Opt "Cafe Bora (Bukchon)" "~`$9" "Famous for matcha bingsu and purple-swirl soft serve. Tiny shop; expect a short queue. The Bukchon branch is slightly less hectic than Insadong."
    Opt "Samcheong-dong gallery walk" "Free ${em} small entry fees" "A string of contemporary Korean art galleries along Samcheong-daero. Drop in, browse, move on. Excellent without any prior knowledge."
    Opt "Insadong Ssamzigil (craft / design)" "browse" "Courtyard space with independent Korean ceramics, stationery, and design goods. Better quality-to-price than the main Insadong strip."
    Opt "Artbox Insadong" "~`$15" "Korean stationery and character goods. Notebooks, pens, oddities at ${won}3,000${em}10,000. The Insadong branch is larger than most."
    Opt "Traditional tea house" "~`$8" "Insadong has several tea houses (다원) in hanok buildings. Chrysanthemum tea or omija tea with tteok. 30-minute sit-down break."
  )
  Transit "$arr taxi or walk 10 min to Ikseon-dong"
  Area "Ikseon-dong ${em} evening cocktails in 1930s hanoks"
  Block "19:30" "Ikseon-dong alley bar-hop" "~`$30" "Modern cocktail bars inside 1930s Korean row houses. Low ceilings, exposed brick, serious drinks. The contrast between the setting and the craft cocktails is uniquely Ikseon. Walk the alley; each bar is tiny and the crowd spills into the lane." $true
  Cluster "specific bars ${em} Ikseon-dong" @(
    Opt "Bab Ajeossi Bar" "~`$15" "Creative Korean-spirit cocktails (omija, nuruk, soju base) in a warm hanok interior. The anchor of the alley."
    Opt "Blackbird" "~`$15" "Whisky-forward list. Dark, narrow, serious bartenders. Good for a longer sit-down."
    Opt "Bar de Nuit" "~`$14" "French-influenced cocktail bar in Ikseon ${em} good wine list, natural wine nights, minimal decor."
    Opt "Woo Saeng Go (우생고)" "~`$12" "Makgeolli and Korean beer bar in the alley. Cheaper than the cocktail bars. Good pajeon and snacks."
  )
) -join "`n"
$t = ReplSched $t 9 $d9

# ════════════════════════════════════════════════════════════════════════════════
# DAY 10 — Gapyeong Day Trip → Itaewon
# ════════════════════════════════════════════════════════════════════════════════
$d10 = @(
  Area "Day trip ${em} Gapyeong" $true
  Block "07:30" "ITX-Cheongchun: Cheongnyangni ${arr} Gapyeong" "${won}10,800 (~`$8)" "Metro to Cheongnyangni Station (Line 1 / Gyeongui-Jungang), then ITX intercity train to Gapyeong (~1h15m). Scenic final stretch through mountain valleys. At Gapyeong take the shuttle bus to the garden (30 min, ${won}3,000)." $false "Book ITX tickets at korail.go.kr the day before. Bring the card used to purchase."
  Block "09:30" "Garden of Morning Calm" "${won}11,000 (~`$8)" "5,000+ plant species across 100+ themed sections ${em} rose garden, Korean traditional garden, waterfall trail, wildflower meadow. Late July is peak summer flower season. Budget 2.5 hours; arrive before day-trip buses fill the paths." $true
  Cluster "lunch ${em} Gapyeong town (shuttle back)" @(
    Opt "Gapyeong riverside dakgalbi restaurant" "~`$14" "The origin region for dakgalbi. Spicy stir-fried chicken in cast iron by the river. The Gapyeong version is more pungent than Seoul${rsq}s ${em} order extra tteok."
    Opt "Local baekban (banchan set meal)" "~`$10" "Any neighbourhood restaurant in Gapyeong town does a set meal with rice, soup, and 8${em}10 side dishes. Quiet, unhurried, completely tourist-free."
  )
  Block "14:00" "Nami Island (optional)" "${won}20,000 (~`$15)" "20-min walk + boat from Gapyeong pier. Tree-lined avenues from the Winter Sonata K-drama. Surreal and quiet on weekday afternoons ${em} 1.5 hours is enough. Last ferry back around 5pm." $false "Skip if you${rsq}re gardenned-out and just want to head back. The garden is the main event."
  Block "17:00" "ITX back ${arr} metro to Hongdae" "" "~1h20m door-to-door. Back by 7pm. Shower, change, decompress."
  Transit "$arr metro/taxi ${em} 10 min to Itaewon"
  Area "Itaewon ${em} evening wind-down"
  Cluster "bars ${em} Itaewon (low-key end to a big day)" @(
    Opt "Blacklist Bar (rooftop)" "~`$20" "Rooftop bar with Itaewon views and a strong cocktail list. 4.6${star}. The right gear-down speed after the countryside."
    Opt "DUSK TILL DAWN" "~`$18" "4.9${star} cocktail lounge. Jazz at perfect volume, cozy booths. One of Seoul${rsq}s best bars, period."
    Opt "Southside Parlor" "~`$18" "Seasonal rotating cocktail menu, serious bartenders. Order what they recommend."
  )
) -join "`n"
$t = ReplSched $t 10 $d10

# ════════════════════════════════════════════════════════════════════════════════
# DAY 11 — Achasan ridge → Walkerhill Casino
# ════════════════════════════════════════════════════════════════════════════════
$d11 = @(
  Area "East Seoul ${em} Achasan ridge" $true
  Block "09:00" "Metro Line 5 ${arr} Achasan Station" "${won}1,450" "~30 min from Hongdae. The trailhead starts literally at the station exit ${em} no taxi, no bus. Bring water and sunscreen."
  Block "09:30" "Achasan ridge trail" "Free" "~4km loop, ~2 hours, easy to moderate. The ridgeline gives continuous views of the Han River bend ${em} one of Seoul${rsq}s best panoramas and nearly unknown to tourists. Go clockwise from the station via the main summit (285m). Steep in short bursts, never technical." $true "Start before 10am to beat the heat. Well-marked with pictograms."
  Cluster "post-hike lunch ${em} near Gwangjang-dong / east Seoul" @(
    Opt "Makguksu (cold buckwheat noodles)" "~`$10" "The trail deposits near Gwangjang-dong, which has several cold-noodle spots. Perfect post-hike: cool, light, sour. Order bibim makguksu (spicy dressed) or mul (broth)."
    Opt "Sundubu jjigae (soft tofu stew)" "~`$10" "Neighbourhood restaurants around Gwangjang-dong station do excellent sundubu. Hot, savoury, cheap."
    Opt "Gwangjang Market (5 min from trail)" "~`$15" "The trail is 10 min from Gwangjang Market. Post-hike bindaetteok and makgeolli at the central stalls. Walk in, sit down, order by pointing."
  )
  Cluster "afternoon rest (before the casino)" @(
    Opt "Ttukseom Hangang Park" "Free" "15 min metro. Riverside lie-down, GS25 cold beer, bike rental if you have energy. The best afternoon recovery in Seoul."
    Opt "Return to Hongdae, rest, prep" "Free" "Back to Nine Brick. Long shower. The casino does not require a specific look, but smart casual is more comfortable."
  )
  Block "19:00" "Walkerhill Casino" "Free entry ${em} bring passport" "W Seoul Walkerhill Grand Casino ${em} foreigners only, passport required. Smart casual dress. Blackjack, baccarat, roulette, slots from ${won}1,000. 24h. Set a limit before you walk in. ~${won}8,000 taxi from Achasan (~15 min)." $true "Active table players get complimentary drinks. The W hotel bar has good cocktails for pre-casino warmup."
) -join "`n"
$t = ReplSched $t 11 $d11

# ════════════════════════════════════════════════════════════════════════════════
# DAY 12 — Hannam / Garosu-gil → Gangnam
# ════════════════════════════════════════════════════════════════════════════════
$d12 = @(
  Area "Hannam / Garosu-gil (Sinsa)" $true
  Cluster "morning gym (optional)" @(
    Opt "Anytime Fitness Hongdae" "${won}15,000 day pass" "5-min walk from Nine Brick, 24h, English signage. Walk in and pay at the front desk."
    Opt "T5 Fitness Itaewon" "${won}15,000 day pass" "Foreigner-friendly, English-speaking staff, full free-weight floor. 10 min from Hongdae."
    Opt "LifeFit Sinchon" "${won}12,000 day pass" "Cheaper alternative 10 min away. Smaller but gets the job done."
  )
  Cluster "brunch ${em} Hannam-dong" @(
    Opt "O${rsq}Kitchen Hannam" "~`$18" "Korean-Western brunch, nice patio, good eggs and coffee. Hannam${rsq}s best casual sit-down."
    Opt "Tartine Hannam" "~`$14" "French bakery ${em} croissants, tartines, espresso. Light and quick if you${rsq}re hitting the shops."
    Opt "Myeongdong Kyoja ${em} Itaewon branch" "~`$12" "Michelin kalguksu and mandu. Efficient lunch, no fuss."
    Opt "Local neighbourhood cafe" "~`$10" "Hannam-dong${rsq}s side streets are full of independent cafes doing simple brunch plates. Walk 5 min off the main road."
  )
  Block "13:30" "Garosu-gil ${em} Sinsa / Apgujeong browse" "Free" "A ginkgo-lined kilometre of boutique fashion, specialty coffee, and independent restaurants. The Seoulite equivalent of a lazy weekend stroll ${em} no pressure, no crowds, great for finding things that aren${rsq}t in every travel guide." $true
  Cluster "shopping + cafes ${em} Garosu-gil area" @(
    Opt "Independent Korean fashion boutiques" "browse" "Garosu-gil has a dozen small-run Korean designer shops. Prices are real (not tourist inflated). Good for clothing you won${rsq}t find at home."
    Opt "Specialty coffee on Garosu-gil" "~`$7" "Several excellent single-origin coffee shops line the street. Walk until one looks right and sit down."
    Opt "Apgujeong Rodeo area (10-min walk)" "browse" "High-end Korean fashion and vintage stores in Apgujeong. More luxury than Garosu-gil, good for browsing."
    Opt "Leeum Museum of Art (15-min walk, Hannam)" "~`$22" "If you missed it on Day 6 ${em} Rem Koolhaas, Mario Botta, Jean Nouvel buildings housing the best private art collection in Korea."
  )
  Transit "$arr metro Line 3 from Sinsa ${em} 10 min to COEX / Samsung"
  Area "Gangnam ${em} evening"
  Block "17:00" "COEX Starfield Library" "Free" "Underground library with two-story bookshelves lining a curved gallery corridor. Just show up at Samsung Station (Line 2). Worth 45 min for the architecture alone. COEX food court for a cheap early dinner." $true
  Cluster "dinner ${em} Gangnam / COEX area" @(
    Opt "COEX food court" "~`$12" "Underground food court with 30+ stalls. Bibimbap, kalguksu, Korean fried chicken, tteokbokki. Cheap and fast before the bars."
    Opt "Sushi Plus / K-BBQ near Gangnam Station" "~`$25" "The streets around Gangnam Station have dozens of KBBQ spots at all price points. Pick by crowd density."
    Opt "Jindalae Makgeolli (Gangnam)" "~`$20" "Best makgeolli bar south of the river. Draft rice wine, kimchi pancake, warm atmosphere. Genuinely local even in Gangnam."
    Opt "Cheongdam-dong restaurant row" "~`$35" "Upscale Korean and Western restaurants in the Cheongdam neighbourhood. One of Seoul${rsq}s best dining streets."
  )
  Cluster "bars ${em} Gangnam / Cheongdam" @(
    Opt "Jindalae Makgeolli (if not for dinner)" "~`$15" "Go for drinks instead of dinner ${em} the makgeolli and pajeon setup works perfectly as a drinking session."
    Opt "Gin Gin Bar (Cheongdam)" "~`$18" "Gin-forward cocktail bar in Cheongdam. Good pours, relaxed setting."
    Opt "Alice Cheongdam" "~`$20" "Upscale cocktail bar in Cheongdam with a strong Korean spirits program. Sets the mood for Octagon."
  )
  Block "23:00" "Octagon Club (Gangnam)" "~`$25" "Consistently ranked top-5 in Asia. Three floors, industrial main room with world-class production, resident and international DJs. Cover ${won}20,000${em}30,000. Smart dress enforced ${em} no shorts, no sandals. Passport required for foreigners. Walk-in before midnight or book table service." $true "Check Octagon${rsq}s Instagram for the lineup. If a big name is playing, pre-register online."
) -join "`n"
$t = ReplSched $t 12 $d12

# ════════════════════════════════════════════════════════════════════════════════
# DAY 13 — Mangwon / Yeouido → Itaewon
# ════════════════════════════════════════════════════════════════════════════════
$d13 = @(
  Area "Mangwon ${em} morning market" $true
  Block "10:00" "Mangwon Jang (Mangwon Market)" "~`$10" "A real neighbourhood market ${em} vendors selling tteok, pajeon, grilled corn, fresh produce. Much more local than Gwangjang. 10 min bus from Hongdae. Get a hotteok and wander slowly." $true "Best before noon when the market winds down. Combine with coffee from one of the Mangwon cafe strip spots."
  Cluster "coffee / morning ${em} Mangwon area" @(
    Opt "Whalehouse ${em} bookshop cafe" "~`$6" "Seoul${rsq}s most loved indie bookshop in Mangwon. Floor-to-ceiling shelves, good coffee. Perfect slow-morning pace."
    Opt "Mangwon cafe strip (Wausan-ro)" "~`$7" "A strip of independent cafes near the market. Walk until you find one with a good vibe and sit down. Very neighbourhood, very un-touristy."
  )
  Transit "$arr metro 20 min to Yeouido"
  Area "Yeouido ${em} riverside afternoon"
  Block "12:30" "Yeouido Hangang Park ${em} riverside bikes" "~`$5" "Rent bikes at the Yeouido dock (${won}3,000/hr) and cycle the path east toward Banpo or west toward Mapo. Han river views, parkside GS25 snacks, open sky. The best lazy afternoon in Seoul." $true
  Cluster "lunch ${em} Yeouido area" @(
    Opt "GS25 riverside picnic" "~`$10" "Beer, ramyeon cup, kimbap roll, and whatever else looks good from the park convenience store. Eat on the grass. Maximum efficiency."
    Opt "Local jeongsik / bibimbap near Yeouido Station" "~`$12" "The blocks around Yeouido Station (west of the park) have cheap set-meal restaurants serving weekday workers. Zero tourist presence."
    Opt "Baemin delivery to the park" "~`$15" "Order Korean fried chicken or pizza delivery to your park coordinates via the Baemin app. Hotel staff can help set it up."
  )
  Block "16:00" "Seonyudo Park" "Free" "Tiny island in the Han ${em} accessible by footbridge from Yangpyeong Station. Converted water treatment plant turned botanical garden. Rusted industrial forms overgrown with plants. Quiet, photogenic, feels like a hidden find. 30-45 min is enough." $false
  Transit "$arr metro 20 min to Itaewon"
  Area "Itaewon ${em} evening"
  Cluster "dinner ${em} Itaewon" @(
    Opt "Bangkok Recipe" "~`$20" "The best Thai restaurant in Seoul. Green curry, larb, pad see ew. Arrive before 7pm to avoid the wait."
    Opt "Vatos Urban Tacos" "~`$18" "Korean-Mex: galbi tacos, kimchi quesadillas, loaded fries. Loud, fun, efficient."
    Opt "C${rsq}ote Korea" "~`$55" "French-Korean tasting menu in Itaewon. The one nice dinner of the trip if you${rsq}re doing it tonight."
    Opt "Bogwangjung KBBQ" "~`$45" "4.9${star} samgyeopsal specialist in Itaewon. Book ahead. Best single KBBQ dinner of the trip if you haven${rsq}t done it yet."
    Opt "Itaewon street food + chicken stalls" "~`$15" "The main Itaewon strip has pojangmacha (tent stalls) and fried chicken spots open late. Quick, cheap, cheerful."
  )
  Block "22:00" "DUSK TILL DAWN ${arr} Venue / Pistil" "~`$20" "4.9${star} cocktail lounge in Itaewon ${em} jazz at perfect volume, genuinely great drinks. Then Venue (underground techno, 100m away) or Pistil (Haebangchon rooftop, open-air, hip-hop). Both close at 6am." $true
  Cluster "more bars ${em} Itaewon" @(
    Opt "Bar Cham" "~`$18" "Creative cocktails with Korean spirits in an intimate room. The most distinctly Korean cocktail bar in Itaewon."
    Opt "Blacklist Bar (rooftop)" "~`$20" "4.6${star}. Good views, strong drinks, livelier on weekends."
    Opt "Southside Parlor" "~`$18" "Rotating seasonal menu, serious bartenders. Different from the others in style."
    Opt "Haebangchon pojangmacha" "~`$10" "The hill above Itaewon has outdoor tent bars that close around 2am. Cheap beer and soju with expats and locals mixed."
  )
) -join "`n"
$t = ReplSched $t 13 $d13

# ════════════════════════════════════════════════════════════════════════════════
# DAY 14 — Namdaemun / Myeongdong / Insadong → Itaewon (Friday)
# ════════════════════════════════════════════════════════════════════════════════
$d14 = @(
  Area "Namdaemun / Myeongdong / Insadong" $true
  Block "10:00" "Namdaemun Market" "~`$10" "580-year-old permanent market open since the Joseon dynasty. Cheap kimbap rolls, Korean ginseng, last-minute gifts, real-people Seoul energy. Not fancy, not touristy, just real. 25 min from Hongdae by metro." $false
  Cluster "K-beauty shopping ${em} Myeongdong (10-min walk from Namdaemun)" @(
    Opt "Olive Young (main Myeongdong store)" "browse" "Korea${rsq}s pharmacy chain ${em} the best single-stop for skincare. Cosrx, Some By Mi, Skin1004, own-brand products at good prices. Get VAT refund forms filled at the counter."
    Opt "Innisfree flagship" "browse" "Jeju Island brand ${em} green tea serums, sunscreen, sheet masks. Well-organized and easy to navigate."
    Opt "The Face Shop" "browse" "Reasonable prices, wide range. Good for stocking up on basics without the premium markup of the designer brands."
    Opt "Dr.Jart+ / Sulwhasoo / Laneige" "browse" "If you want prestige Korean beauty: these flagships are all on the same block. Tester bars at each one."
    Opt "Tony Moly" "browse" "Playful packaging, affordable prices. Good for gifts ${em} the peach hand cream and banana sleeping masks travel well."
  )
  Cluster "lunch ${em} Myeongdong area" @(
    Opt "Myeongdong Kyoja (original)" "~`$12" "Famous kalguksu and mandu. Long queue but moves fast. The original location ${em} 30+ years on the same block."
    Opt "Myeongdong street food crawl" "~`$10" "Cheese corn dog from one stall, tteokbokki from another, tornado potato from a third. Walk the entire length and graze."
    Opt "Korean set meal (jeongsik) in a side alley" "~`$12" "Step off the main shopping street into any of the back lanes and you${rsq}ll find cheap office-worker lunch restaurants with full banchan spreads."
    Opt "Egg Drop sandwich" "~`$9" "Korean fluffy egg sandwich chain ${em} a Myeongdong institution. Quick, satisfying, photogenic. Good if you${rsq}re tired of heavy food."
  )
  Cluster "gifts + stationery ${em} Insadong (10-min walk)" @(
    Opt "Artbox Insadong" "~`$20" "Korean stationery paradise. Quality notebooks, character goods, pens, oddities at ${won}3,000${em}10,000 each."
    Opt "Insadong Ssamzigil courtyard" "browse" "Independent ceramics, handmade craft, Korean design goods in a three-story courtyard. Better quality than the main drag."
    Opt "Traditional paper (hanji) shops" "browse" "Insadong has several hanji (Korean rice paper) shops selling stationery, cards, and lanterns. Genuinely beautiful and cheap."
    Opt "Joayo / Noo-ri ceramic shops" "browse" "Small independent ceramic studios on the Insadong back alleys. Hand-thrown teacups and bowls to take home."
  )
  Transit "$arr metro 20 min to Itaewon ${em} Friday night"
  Area "Itaewon ${em} Friday night"
  Cluster "dinner ${em} Itaewon" @(
    Opt "Bangkok Recipe" "~`$20" "The best Thai in Seoul. Arrive by 7pm."
    Opt "Bogwangjung KBBQ" "~`$45" "4.9${star} samgyeopsal. Book ahead. Friday night KBBQ with soju is the right Itaewon meal."
    Opt "Vatos Urban Tacos" "~`$18" "Korean-Mex. Fast, fun, loud. Good Friday-night energy."
    Opt "C${rsq}ote Korea" "~`$55" "French-Korean tasting menu. The splurge Friday dinner."
    Opt "Itaewon pojangmacha / street stalls" "~`$12" "Keep it light if you${rsq}re hitting the clubs early. Quick tent-bar food, cheap and cheerful."
  )
  Block "21:00" "Bar Cham ${arr} Cakeshop" "~`$20" "Friday night Itaewon. Bar Cham for creative cocktails made with Korean spirits in an intimate room. Then Cakeshop: basement Itaewon, best sound system in the city, packed on Fridays, techno/house/bass. Lockers available. Closes at 6am." $true
  Cluster "more options ${em} Friday clubs Itaewon" @(
    Opt "Venue (Itaewon basement)" "~`$10" "Underground techno, 100m from DUSK TILL DAWN. Smaller than Cakeshop, more raw."
    Opt "Pistil (Haebangchon rooftop)" "~`$10" "Open-air rooftop above the hill. Hip-hop and R&B. Best for a warm Friday night."
  )
) -join "`n"
$t = ReplSched $t 14 $d14

# ════════════════════════════════════════════════════════════════════════════════
# DAY 15 — Last day / Departure · Hongdae / Mapo / Yeouido
# ════════════════════════════════════════════════════════════════════════════════
$d15 = @(
  Area "Yeouido ${em} last morning by the river" $true
  Block "09:30" "Yeouido Hangang Park ${em} last morning" "Free" "Rent a tandem bike, grab supplies from the GS25, and sit by the water. The city${rsq}s living room. Banpo Bridge is a 10-min ride west. 20 min from Hongdae by metro ${em} worth it as a final Seoul morning." $true
  Area "Mangwon / Hongdae ${em} midday"
  Block "11:30" "Whalehouse bookshop-cafe (Mangwon)" "~`$6" "Seoul${rsq}s most loved indie bookshop. Floor-to-ceiling shelves, literary stationery, good coffee in a warm reading-room atmosphere. 10-min bus from Hongdae. A quiet last-morning counterpoint to everything loud." $false
  Cluster "lunch ${em} Hongdae / Mapo area" @(
    Opt "Sinchon Dakgalbi Alley" "~`$12" "Last dakgalbi. The Sinchon version. Spicy, simple, correct."
    Opt "Mapo Galmaegi KBBQ" "~`$30" "Galmaegi (pork skirt steak) KBBQ in Mapo. 15 min from Hongdae. Thin cuts, quick grill, beer and soju. Good send-off meal."
    Opt "Hongdae street food / fried chicken" "~`$15" "Stay local and cheap for the last lunch. Pick a fried chicken spot on the main strip."
    Opt "Local gimbap / kimbap joint" "~`$8" "Simple and quick if you${rsq}re packing and running behind. Every block in Hongdae has one."
  )
  Block "14:00" "Afternoon downtime ${em} pack + rest" "" "Nine Brick holds luggage after checkout. Come back, drop bags, rest. Optional: Thanks Nature Cafe (two live sheep at the entrance, Hongdae, 10-min walk) for a final quirky 90-min stop." $false "First subway from Hongik Univ. is 5:27am ${em} perfect timing from a Hongdae club. ICN check-in opens at 3am."
  Block "18:30" "Bossam & Jokbal ${em} Mapo farewell feast" "~`$30" "Mapo${rsq}s signature late-night ritual: bossam (boiled pork belly with fermented paste) and jokbal (soy-braised pig${rsq}s trotters), ordered as a combo platter and shared over soju. Messy, communal, unforgettable. 5 min from Hongdae." $true
  Block "21:00" "Soo Karaoke Club Hongdae" "~`$25" "Luxury noraebang with a famous 2-floor room and floor-to-ceiling windows. Large English song catalogue. Bring drinks from GS25 ${em} outside drinks are fine. Last-night release." $false
  Cluster "final clubs ${em} Hongdae (stay till subway opens at 5:27am)" @(
    Opt "NB2 Hongdae" "~`$15" "YG-affiliated hip-hop club. Last Saturday night in Seoul. Both floors packed by 1am. Walking distance from Nine Brick."
    Opt "Club FF" "~`$10" "The biggest dancefloor in Hongdae. Come full circle ${em} you started here on Night 1."
    Opt "Club SOAP" "~`$15" "Seoul${rsq}s best electronic club. If there${rsq}s a big name on the lineup, this is the right last-night call."
  )
) -join "`n"
$t = ReplSched $t 15 $d15


# ── Write back ────────────────────────────────────────────────────────────────
[System.IO.File]::WriteAllText($path, $t, $enc)
Write-Host "Written."

# ── Verify ────────────────────────────────────────────────────────────────────
$c = [System.IO.File]::ReadAllText($path, $enc)
@(
    "CSS area-label:       " + $c.Contains(".area-label {"),
    "CSS options-cluster:  " + $c.Contains(".options-cluster {"),
    "Transit JS removed:   " + (-not $c.Contains("DAY_TRANSIT")),
    "Day 5 Ho Bar block:   " + $c.Contains("Ho Bar III (Hongdae)"),
    "Day 6 Dragon Hill:    " + $c.Contains("Dragon Hill Spa"),
    "Day 7 Mangwon Park:   " + $c.Contains("Mangwon Hangang Park"),
    "Day 8 Cafe Onion:     " + $c.Contains("Cafe Onion (Seongsu)"),
    "Day 9 Gyeongbokgung:  " + $c.Contains("Gyeongbokgung Palace"),
    "Day 10 Garden:        " + $c.Contains("Garden of Morning Calm"),
    "Day 11 Achasan:       " + $c.Contains("Achasan ridge trail"),
    "Day 12 COEX Library:  " + $c.Contains("Starfield Library"),
    "Day 13 Seonyudo:      " + $c.Contains("Seonyudo Park"),
    "Day 14 Namdaemun:     " + $c.Contains("Namdaemun Market"),
    "Day 15 Bossam:        " + $c.Contains("Bossam & Jokbal"),
    "opt class present:    " + $c.Contains("class=`"opt`"")
) | ForEach-Object { Write-Host $_ }
