$enc = New-Object System.Text.UTF8Encoding $false
$dPath = "C:\Users\bicke\Documents\GitHub\chalmondtrip2\data.js"
$d = [System.IO.File]::ReadAllText($dPath, $enc).Replace("`r`n", "`n")

# Insert new items after the last item in a category
# anchor = last image filename in the last item of the category
function Ins([string]$t, [string]$lastImg, [string]$newItems) {
    $anchor = '"images/seoul/' + $lastImg + '"]}'
    $p = $t.IndexOf($anchor)
    if ($p -lt 0) { Write-Host "NOT FOUND: $lastImg"; return $t }
    $p += $anchor.Length
    return $t.Substring(0, $p) + (',' + "`n          " + $newItems) + $t.Substring($p)
}

# ── BBQ: Mapo Galmaegi ────────────────────────────────────────────────────────
$mp1 = '{id:"seo-mp1",name:"Mapo Galmaegi KBBQ",lat:37.5487,lng:126.9524,rating:4.4,price_low:20,price_high:40,blurb:"Thinly sliced pork neck (galmaegi-sal) grilled at the table: leaner, cheaper and more intensely flavoured than belly, beloved by Seoul regulars. Mapo has a concentration of galmaegi-sal specialists.",why:"Local-favourite cut most tourists miss; cheaper than samgyeopsal.",images:["images/seoul/seo-b3-1.jpg","images/seoul/seo-b3-2.jpg","images/seoul/seo-b3-3.jpg"]}'
$d = Ins $d "seo-b4-3.jpg" $mp1

# ── KOREAN_FOOD: international + temple cuisine ───────────────────────────────
$ir1 = '{id:"seo-ir1",name:"Bangkok Recipe (Itaewon, Thai)",lat:37.5356,lng:126.9918,rating:4.3,price_low:15,price_high:25,blurb:"Itaewon most consistently recommended Thai restaurant: green curry, pad see ew and spicy larb at local prices in a bright no-frills room.",why:"Best Thai in Seoul; essential for variety across an 11-night stay.",images:["images/seoul/seo-kf7-1.jpg","images/seoul/seo-kf7-2.jpg","images/seoul/seo-kf7-3.jpg"]}'
$ir2 = '{id:"seo-ir2",name:"Vatos Urban Tacos (Itaewon, Mexican)",lat:37.5348,lng:126.9936,rating:4.4,price_low:15,price_high:25,blurb:"Seoul beloved Korean-Mexican fusion taqueria in Itaewon: kimchi carnitas tacos, galbi quesadillas and frozen margaritas. Loud, packed and fun.",why:"Uniquely Seoul take on Mexican food; great for groups.",images:["images/seoul/seo-kf7-1.jpg","images/seoul/seo-kf7-2.jpg","images/seoul/seo-kf7-3.jpg"]}'
$ir3 = '{id:"seo-ir3",name:"C''ote Korea (Modern Korean, Itaewon)",lat:37.5344,lng:126.9940,rating:4.5,price_low:45,price_high:70,blurb:"Intimate modern Korean tasting-menu restaurant in Itaewon: chef-driven small plates built around seasonal Korean ingredients. No tourist gimmicks.",why:"The mid-splurge option that outpunches its price; pairs with an Itaewon evening.",images:["images/seoul/seo-b4-1.jpg","images/seoul/seo-b4-2.jpg","images/seoul/seo-b4-3.jpg"]}'
$ins1 = '{id:"seo-ins1",name:"Sanchon (Insadong, temple cuisine)",lat:37.5737,lng:126.9869,rating:4.4,price_low:20,price_high:35,blurb:"Insadong legendary Buddhist temple-food restaurant: dozens of seasonal vegetarian dishes served in a fixed multi-course set, all without meat, onion or garlic. The most meditative dining in Seoul.",why:"Completely unique to Korea; pairs with an Insadong cultural day.",images:["images/seoul/seo-kf1-1.jpg","images/seoul/seo-kf1-2.jpg","images/seoul/seo-kf1-3.jpg"]}'
$d = Ins $d "seo-kf10-3.jpg" ($ir1 + (',' + "`n          ") + $ir2 + (',' + "`n          ") + $ir3 + (',' + "`n          ") + $ins1)

# ── CAFE: Hannam brunch, Seongsu specialty, Anthracite, Bora ─────────────────
$ir4 = '{id:"seo-ir4",name:"O''Kitchen (Hannam brunch cafe)",lat:37.5365,lng:127.0010,rating:4.5,price_low:14,price_high:22,blurb:"Hannam beloved brunch-and-lunch cafe: open-face sandwiches, grain bowls and weekend egg dishes in a light-filled room. A neighbourhood institution.",why:"Best sit-down brunch in Hannam; earned rather than just Instagram-famous.",images:["images/seoul/seo-cf8-1.jpg","images/seoul/seo-cf8-2.jpg","images/seoul/seo-cf8-3.jpg"]}'
$ir5 = '{id:"seo-ir5",name:"Tartine Hannam (sourdough bakery)",lat:37.5364,lng:127.0008,rating:4.4,price_low:9,price_high:16,blurb:"A Korean outpost of San Francisco legendary sourdough bakery, in a striking minimalist Hannam space. Country bread, morning buns and very good coffee.",why:"Best bread in Seoul; worth the detour from Itaewon.",images:["images/seoul/seo-cf8-1.jpg","images/seoul/seo-cf8-2.jpg","images/seoul/seo-cf8-3.jpg"]}'
$sc1 = '{id:"seo-sc1",name:"Fritz Coffee Company (Seongsu)",lat:37.5456,lng:127.0352,rating:4.6,price_low:6,price_high:12,blurb:"One of Seoul finest specialty roasters, in a beautifully converted Seongsu warehouse. Direct-trade lots, precise extraction and cinnamon rolls that sell out by 11am.",why:"The cafe that defines Seoul specialty coffee; a must-visit in Seongsu.",images:["images/seoul/seo-cf8-1.jpg","images/seoul/seo-cf8-2.jpg","images/seoul/seo-cf8-3.jpg"]}'
$sc3 = '{id:"seo-sc3",name:"Daelim Changgo (Seongsu warehouse cafe)",lat:37.5445,lng:127.0363,rating:4.3,price_low:6,price_high:10,blurb:"A 1960s factory warehouse transformed into a multi-level cafe and art space: exposed brick, skylights and a sprawling outdoor terrace. The most atmospheric hangout in Seongsu.",why:"Best cafe atmosphere in Seongsu; the warehouse-industrial vibe at its best.",images:["images/seoul/seo-ga1-1.jpg","images/seoul/seo-ga1-2.jpg","images/seoul/seo-ga1-3.jpg"]}'
$sc4 = '{id:"seo-sc4",name:"Able (Seongsu Korean fusion brunch)",lat:37.5440,lng:127.0370,rating:4.4,price_low:12,price_high:18,blurb:"A chic Seongsu brunch spot blending Korean and Western flavours: doenjang-glazed chicken plates, grain bowls and excellent lattes in a Scandi-meets-Seoul dining room.",why:"Best lunch in Seongsu after Seoul Forest.",images:["images/seoul/seo-cf8-1.jpg","images/seoul/seo-cf8-2.jpg","images/seoul/seo-cf8-3.jpg"]}'
$ant1 = '{id:"seo-ant1",name:"Anthracite Hongdae (specialty coffee)",lat:37.5565,lng:126.9248,rating:4.5,price_low:5,price_high:10,blurb:"A converted shoe factory turned landmark specialty coffee shop: exposed industrial bones, 7m ceilings and outstanding single-origin pour-overs roasted in-house. Seoul most photographed coffee interior.",why:"The Hongdae cafe that launched Seoul specialty-coffee scene.",images:["images/seoul/seo-cf8-1.jpg","images/seoul/seo-cf8-2.jpg","images/seoul/seo-cf8-3.jpg"]}'
$ins2 = '{id:"seo-ins2",name:"Cafe Bora (Bukchon, matcha)",lat:37.5808,lng:126.9833,rating:4.4,price_low:8,price_high:14,blurb:"An iconic Bukchon cafe famous for vibrant purple-rice tteok latte and matcha soft-serve, served in a tiny hanok room near the village entrance. Always a queue but moves fast.",why:"Most photogenic cafe in the old city; earns its reputation.",images:["images/seoul/seo-d1-1.jpg","images/seoul/seo-d1-2.jpg","images/seoul/seo-d1-3.jpg"]}'
$sep = ',' + "`n          "
$d = Ins $d "seo-cf8-3.jpg" ($ir4 + $sep + $ir5 + $sep + $sc1 + $sep + $sc3 + $sep + $sc4 + $sep + $ant1 + $sep + $ins2)

# ── FASHION: LCDC Seoul concept complex ──────────────────────────────────────
$sc2 = '{id:"seo-sc2",name:"LCDC Seoul (Seongsu concept complex)",lat:37.5443,lng:127.0548,rating:4.5,price_low:0,price_high:20,blurb:"A six-building converted factory complex in Seongsu housing fashion concept stores, galleries, food brands and pop-up spaces. Seoul answer to Brooklyn cultural-industrial districts.",why:"Best destination for concept-store browsing and gallery-hopping in Seongsu.",images:["images/seoul/seo-fa4-1.jpg","images/seoul/seo-fa4-2.jpg","images/seoul/seo-fa4-3.jpg"]}'
$d = Ins $d "seo-fa5-3.jpg" $sc2

# ── CRAFT_BEER: Craftbros Hongdae ────────────────────────────────────────────
$hb1 = '{id:"seo-hb1",name:"Craftbros Hongdae (craft beer bar)",lat:37.5556,lng:126.9250,rating:4.4,price_low:9,price_high:18,blurb:"A relaxed Hongdae craft-beer bar with 12 rotating taps: Korean and international IPAs, sours and wheat beers. Good bar food, garden terrace and no dress code.",why:"Best craft beer in Hongdae; the relaxed warmup before a club night.",images:["images/seoul/seo-cb8-1.jpg","images/seoul/seo-cb8-2.jpg","images/seoul/seo-cb8-3.jpg"]}'
$d = Ins $d "seo-br2-3.jpg" $hb1

# ── CLUB: Club FF + FREEBIRD (Hongdae) ───────────────────────────────────────
$hb2 = '{id:"seo-hb2",name:"Club FF (Hongdae)",lat:37.5520,lng:126.9228,rating:4.2,price_low:10,price_high:20,blurb:"Long-running Hongdae club on two floors: K-pop and hip-hop upstairs, harder electronic music in the basement. Cheap entry, young local crowd, open until 5am.",why:"Classic Hongdae club; cheaper and more local than Gangnam options.",images:["images/seoul/seo-nc4-1.jpg","images/seoul/seo-nc4-2.jpg","images/seoul/seo-nc4-3.jpg"]}'
$hb3 = '{id:"seo-hb3",name:"FREEBIRD (Hongdae)",lat:37.5525,lng:126.9222,rating:4.2,price_low:10,price_high:18,blurb:"A Hongdae club with a party-festival energy: body paint events, themed nights and a roster of local DJs. More experimental and fun than the mainstream K-pop clubs nearby.",why:"The Hongdae alternative club night; better music variety.",images:["images/seoul/seo-nc4-1.jpg","images/seoul/seo-nc4-2.jpg","images/seoul/seo-nc4-3.jpg"]}'
$d = Ins $d "seo-nc7-3.jpg" ($hb2 + $sep + $hb3)

# ── COCKTAIL_BAR: Pistil, Bab Ajeossi, Blackbird, Bar de Nuit, Woo Saeng Go, Gin Gin ──
$hb4 = '{id:"seo-hb4",name:"Pistil (Haebangchon rooftop bar)",lat:37.5380,lng:126.9810,rating:4.4,price_low:8,price_high:16,blurb:"An intimate rooftop bar in Haebangchon, the hillside neighbourhood above Itaewon: fairy lights, Namsan views and a natural-wine list. The low-key Itaewon alternative.",why:"Best rooftop for a quiet drink near Itaewon; more relaxed than the strip.",images:["images/seoul/seo-cb7-1.jpg","images/seoul/seo-cb7-2.jpg","images/seoul/seo-cb7-3.jpg"]}'
$hb5 = '{id:"seo-hb5",name:"Bab Ajeossi Bar (Ikseon-dong)",lat:37.5745,lng:126.9880,rating:4.5,price_low:10,price_high:18,blurb:"A popular Ikseon-dong cocktail bar with a quirky old-Seoul aesthetic: makgeolli, domestic spirits and creative low-abv cocktails in a crowded alley setting.",why:"Best bar in the Ikseon alley complex; the local favourite.",images:["images/seoul/seo-cb5-1.jpg","images/seoul/seo-cb5-2.jpg","images/seoul/seo-cb5-3.jpg"]}'
$hb6 = '{id:"seo-hb6",name:"Blackbird (Insadong cocktail bar)",lat:37.5742,lng:126.9906,rating:4.5,price_low:12,price_high:20,blurb:"A craft cocktail bar in the Insadong neighbourhood with an avian theme: serious classic cocktails and an extensive whisky menu in a cosy mid-century interior.",why:"Best cocktail bar near the old city; ideal after Ikseon wandering.",images:["images/seoul/seo-cb5-1.jpg","images/seoul/seo-cb5-2.jpg","images/seoul/seo-cb5-3.jpg"]}'
$hb7 = '{id:"seo-hb7",name:"Bar de Nuit (Itaewon)",lat:37.5345,lng:126.9930,rating:4.4,price_low:12,price_high:22,blurb:"A French-inspired Itaewon cocktail bar: seasonal sparkling-wine cocktails, elegant small plates and an unhurried pace. The quieter, more conversational end of the Itaewon bar strip.",why:"Best bar for a slow quality drink in Itaewon without the party energy.",images:["images/seoul/seo-cb5-1.jpg","images/seoul/seo-cb5-2.jpg","images/seoul/seo-cb5-3.jpg"]}'
$hb8 = '{id:"seo-hb8",name:"Woo Saeng Go (Ikseon makgeolli bar)",lat:37.5740,lng:126.9902,rating:4.4,price_low:10,price_high:18,blurb:"A mellow craft-makgeolli and natural-wine bar in the Ikseon-dong alley complex: exposed brick, wooden tables and a rotating list of small-batch Korean rice wines paired with jeon pancakes.",why:"Best craft makgeolli in the old city; great late-night vibe.",images:["images/seoul/seo-mk1-1.jpg","images/seoul/seo-mk1-2.jpg","images/seoul/seo-mk1-3.jpg"]}'
$chm1 = '{id:"seo-chm1",name:"Gin Gin Bar (Cheongdam speakeasy)",lat:37.5246,lng:127.0412,rating:4.5,price_low:15,price_high:25,blurb:"A Cheongdam speakeasy dedicated to gin: 70-plus labels arranged by botanical profile, with precise tonic service and rotating signature cocktails. Hidden-door entry.",why:"Best gin bar in Seoul; pairs perfectly with the Alice Cheongdam neighbourhood.",images:["images/seoul/seo-cb4-1.jpg","images/seoul/seo-cb4-2.jpg","images/seoul/seo-cb4-3.jpg"]}'
$d = Ins $d "seo-cb8-3.jpg" ($hb4 + $sep + $hb5 + $sep + $hb6 + $sep + $hb7 + $sep + $hb8 + $sep + $chm1)

# ── MAKGEOLLI: Jindalae Gangnam ───────────────────────────────────────────────
$chm2 = '{id:"seo-chm2",name:"Jindalae Makgeolli (Gangnam)",lat:37.5040,lng:127.0245,rating:4.4,price_low:12,price_high:22,blurb:"A modern makgeolli bar in Gangnam with a refined craft-takju concept: house-brewed rice wines paired with elevated Korean bar food including upgraded pajeon and house bossam.",why:"Best makgeolli bar for pairing with a Gangnam evening.",images:["images/seoul/seo-mk1-1.jpg","images/seoul/seo-mk1-2.jpg","images/seoul/seo-mk1-3.jpg"]}'
$d = Ins $d "seo-mk3-3.jpg" $chm2

# ── GIFTS: Innisfree + Tony Moly ─────────────────────────────────────────────
$oy1 = '{id:"seo-oy1",name:"Innisfree Myeongdong Flagship",lat:37.5623,lng:126.9843,rating:4.4,price_low:8,price_high:60,blurb:"Jeju-sourced Korean beauty brand across three Myeongdong floors: green tea serums, volcanic clay masks and SPF products at roughly half the airport price. Full range including discontinued favourites.",why:"Best-value Innisfree in Korea; worth a dedicated stop on K-beauty day.",images:["images/seoul/seo-gi2-1.jpg","images/seoul/seo-gi2-2.jpg","images/seoul/seo-gi2-3.jpg"]}'
$oy2 = '{id:"seo-oy2",name:"Tony Moly Myeongdong",lat:37.5628,lng:126.9852,rating:4.3,price_low:5,price_high:40,blurb:"Fun character-driven K-beauty brand with the best gift packaging on the street: panda eye masks, mushroom highlighters and peach-shaped hand creams. Regular buy-two-get-one deals.",why:"Best for gift-buying; the character packaging travels well.",images:["images/seoul/seo-gi2-1.jpg","images/seoul/seo-gi2-2.jpg","images/seoul/seo-gi2-3.jpg"]}'
$d = Ins $d "seo-gi4-3.jpg" ($oy1 + $sep + $oy2)

# ── STREET_FOOD: Egg Drop ─────────────────────────────────────────────────────
$sf7 = '{id:"seo-sf7",name:"Egg Drop (Hongdae sandwich chain)",lat:37.5558,lng:126.9228,rating:4.4,price_low:7,price_high:12,blurb:"Seoul viral brioche-egg sandwich chain: butter-braised eggs with avocado, bacon or short-rib on pillowy bread. Constantly long queues in Hongdae from 10am; go early or mid-afternoon.",why:"The most talked-about casual breakfast in Seoul; worth one visit.",images:["images/seoul/seo-sf2-1.jpg","images/seoul/seo-sf2-2.jpg","images/seoul/seo-sf2-3.jpg"]}'
$d = Ins $d "seo-sf6-3.jpg" $sf7

# ── GARDEN: Ttukseom Hangang Park ────────────────────────────────────────────
$hng1 = '{id:"seo-hng1",name:"Ttukseom Hangang Park",lat:37.5427,lng:127.0668,rating:4.5,price_low:0,price_high:0,blurb:"A long grassy riverfront park near Seongsu with rental bikes, outdoor pools in summer, late-night convenience-store picnic culture and one of the best city skyline views in Seoul.",why:"Closest Hangang park to Seongsu; perfect for an evening after Seoul Forest.",images:["images/seoul/seo-e2-1.jpg","images/seoul/seo-e2-2.jpg","images/seoul/seo-e2-3.jpg"]}'
$d = Ins $d "seo-ga4-3.jpg" $hng1

[System.IO.File]::WriteAllText($dPath, $d, $enc)
Write-Host "data.js written"

# ── Verify ────────────────────────────────────────────────────────────────────
$check = @("seo-mp1","seo-ir1","seo-ir2","seo-ir3","seo-ins1","seo-ir4","seo-ir5","seo-sc1","seo-sc3","seo-sc4","seo-ant1","seo-ins2","seo-sc2","seo-hb1","seo-hb2","seo-hb3","seo-hb4","seo-hb5","seo-hb6","seo-hb7","seo-hb8","seo-chm1","seo-chm2","seo-oy1","seo-oy2","seo-sf7","seo-hng1")
foreach ($id in $check) {
    Write-Host ("  " + $id + ": " + $d.Contains('"' + $id + '"'))
}
