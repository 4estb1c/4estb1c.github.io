$enc = New-Object System.Text.UTF8Encoding $false
$iPath = "C:\Users\bicke\Documents\GitHub\chalmondtrip2\itinerary.html"
$it = [System.IO.File]::ReadAllText($iPath, $enc).Replace("`r`n", "`n")

# --- 1. CSS: add .opt-imgs rules after .opt-desc ---
$it = $it.Replace(
    '.opt-desc { font-size:12px; color:var(--ink-soft); line-height:1.4; margin-top:1px; }',
    '.opt-desc { font-size:12px; color:var(--ink-soft); line-height:1.4; margin-top:1px; }' + "`n" +
    '.opt-imgs { display:flex; gap:4px; margin-top:6px; }' + "`n" +
    '.opt-imgs img { flex:1; min-width:0; height:65px; object-fit:cover; border-radius:4px; cursor:zoom-in; transition:opacity .15s; }' + "`n" +
    '.opt-imgs img:hover { opacity:.85; }'
)

# --- 2. JS: OPT_MAP + injection code (inserted before block-time conversion) ---
$optJs = @'
// ---- Option images -------------------------------------------------------
const OPT_MAP = {
  'sinchon dakgalbi':           'seo-kf8',
  'dakgalbi alley':             'seo-kf8',
  'dae wang tong dak':          'seo-ch1',
  'hongdae gopchang':           'seo-kf10',
  'kimbap nara':                'seo-m1',
  'bogwangjung':                'seo-b3',
  'mapo galmaegi':              'seo-mp1',
  'bangkok recipe':             'seo-ir1',
  'vatos urban tacos':          'seo-ir2',
  'tartine hannam':             'seo-ir5',
  'tartine':                    'seo-ir5',
  'tosokchon':                  'seo-kf1',
  'sanchon':                    'seo-ins1',
  'galbitang':                  'seo-kf6',
  'doenjang jjigae':            'seo-kf9',
  'sundubu jjigae':             'seo-kf9',
  'sundubu':                    'seo-kf9',
  'grill5taco':                 'seo-ga1',
  'able cafe':                  'seo-sc4',
  'able':                       'seo-sc4',
  'myeongdong kyoja':           'seo-no1',
  'sinchon budae':              'seo-kf7',
  'budae jjigae':               'seo-kf7',
  'hongdae fried chicken':      'seo-ch3',
  'makguksu':                   'seo-kf4',
  'egg drop':                   'seo-sf7',
  'gapyeong riverside':         'seo-ga4',
  'fritz coffee':               'seo-sc1',
  'anthracite':                 'seo-ant1',
  'lcdc seoul':                 'seo-sc2',
  'lcdc':                       'seo-sc2',
  'daelim changgo':             'seo-sc3',
  'cafe bora':                  'seo-ins2',
  'stylenanda pink pool':       'seo-cf6',
  'stylenanda flagship':        'seo-fa2',
  'gwangjang market':           'seo-m1',
  'gwangjang':                  'seo-m1',
  'myeongdong street food':     'seo-m2',
  'myeongdong night market':    'seo-m2',
  'sindang tteokbokki':         'seo-sf4',
  'kyochon':                    'seo-ch2',
  'dongdaemun night market':    'seo-s6',
  'ddp food':                   'seo-sf6',
  'bukchon hanok':              'seo-s1',
  'bukchon':                    'seo-s1',
  'national folk museum':       'seo-s4',
  'n seoul tower':              'seo-s2',
  'namsan park':                'seo-s2',
  'namsan':                     'seo-s2',
  'leeum museum':               'seo-mu2',
  'leeum':                      'seo-mu2',
  'seoul forest cafe':          'seo-ga1',
  'seoul forest':               'seo-ga1',
  'ttukseom':                   'seo-hng1',
  'hangang':                    'seo-e2',
  'gs25 riverside':             'seo-e2',
  'coex food court':            'seo-s8',
  'samcheong-dong gallery':     'seo-mu4',
  'artbox':                     'seo-st1',
  'kakao friends':              'seo-gi1',
  'hongdae vintage':            'seo-fa5',
  'olive young':                'seo-gi2',
  'innisfree':                  'seo-oy1',
  'the face shop':              'seo-gi2',
  'dr.jart':                    'seo-gi2',
  'tony moly':                  'seo-oy2',
  'garosu-gil':                 'seo-wk5',
  'garosu':                     'seo-wk5',
  'insadong ssamzigil courtyard food': 'seo-sf1',
  'insadong ssamzigil':         'seo-wk2',
  'hanji':                      'seo-gi3',
  'traditional paper':          'seo-gi3',
  'joayo':                      'seo-gi3',
  'apgujeong rodeo':            'seo-fa3',
  'hongdae art supply':         'seo-st3',
  'craftbros':                  'seo-hb1',
  'club ff':                    'seo-hb2',
  'freebird':                   'seo-hb3',
  'nb2':                        'seo-nc4',
  'club soap':                  'seo-nc3',
  'dusk till dawn':             'seo-cb3',
  'blacklist bar':              'seo-cb2',
  'blacklist':                  'seo-cb2',
  'bar cham':                   'seo-cb6',
  'southside parlor':           'seo-cb7',
  'cakeshop':                   'seo-nc2',
  'venue':                      'seo-nc5',
  'pistil':                     'seo-hb4',
  'bab ajeossi':                'seo-hb5',
  'blackbird':                  'seo-hb6',
  'bar de nuit':                'seo-hb7',
  'woo saeng go':               'seo-hb8',
  'alice cheongdam':            'seo-cb4',
  'gin gin bar':                'seo-chm1',
  'neurin maeul':               'seo-mk2',
  'whalehouse':                 'seo-st4',
  'mangwon cafe':               'seo-st4',
  'jindalae makgeolli':         'seo-chm2',
  'jindalae':                   'seo-chm2',
  'haebangchon pojangmacha':    'seo-sf5',
  'itaewon pojangmacha':        'seo-sf5',
  'itaewon street food':        'seo-sf5',
  'eoulmadang-ro':              'seo-sf5',
  'magpie':                     'seo-cb8',
  'local gimbap':               'seo-sf3',
  'local baekban':              'seo-kf3',
  'local jeongsik':             'seo-kf3',
  'cafeteria-style':            'seo-kf3',
  'seongsu-dong local':         'seo-ga1',
  'boutique':                   'seo-fa4',
  'traditional tea house':      'seo-mk1',
  'dongdaemun area':            'seo-kf8',
  'cheongdam-dong restaurant':  'seo-fd1',
  'any hollys':                 'seo-cf8',
  'local neighbourhood cafe':   'seo-cf8',
  'hongdae street food':        'seo-m2',
  'just hongdae':               'seo-nc4',
  'mapo neighbourhood':         'seo-mk2',
};

document.querySelectorAll('.opt').forEach(opt => {
  const nameEl = opt.querySelector('.opt-name');
  if (!nameEl) return;
  const raw = Array.from(nameEl.childNodes)
    .filter(n => n.nodeType === Node.TEXT_NODE)
    .map(n => n.textContent).join('').trim().toLowerCase();

  let matchId = null;
  for (const [kw, id] of Object.entries(OPT_MAP)) {
    if (raw.includes(kw)) { matchId = id; break; }
  }
  const item = _itemMap[matchId];
  if (!item || !item.images || !item.images.length) return;

  const wrap = document.createElement('div');
  wrap.className = 'opt-imgs';
  item.images.slice(0, 3).forEach(src => {
    const img = document.createElement('img');
    img.src = src;
    img.alt = '';
    img.loading = 'lazy';
    img.onclick = () => window.open(src, '_blank');
    wrap.appendChild(img);
  });
  opt.appendChild(wrap);
});

'@

# Use ASCII-safe anchor: the block-time querySelector line
$anchor = "document.querySelectorAll('.block-time').forEach"
$it = $it.Replace($anchor, $optJs + $anchor)

# --- 3. Fix seafood opt-name ---
$it = $it.Replace(
    'Sushi Plus / K-BBQ near Gangnam Station',
    'Local galbi or Korean BBQ near Gangnam Station'
)

# --- 4. Add C'ote and O'Kitchen to OPT_MAP via JS (apostrophe keys via double-quotes)
# Already handled above using single-quote keys without apostrophes in name;
# add the apostrophe variants as double-quoted keys by doing a targeted Replace
$apoKeys = 'const OPT_MAP = {'
$apoAdd = "const OPT_MAP = {`n  " + '"c' + "'ote korea" + '": ' + "'seo-ir3'," + "`n  " + '"c' + "'ote" + '": ' + "'seo-ir3'," + "`n  " + '"o' + "'kitchen" + '": ' + "'seo-ir4',"
$it = $it.Replace($apoKeys, $apoAdd)

[System.IO.File]::WriteAllText($iPath, $it, $enc)
Write-Host "itinerary.html written"

Write-Host ("opt-imgs CSS:         " + $it.Contains('.opt-imgs {'))
Write-Host ("OPT_MAP added:        " + $it.Contains('const OPT_MAP'))
Write-Host ("opt inject JS:        " + $it.Contains('opt.appendChild(wrap)'))
Write-Host ("seafood removed:      " + (-not $it.Contains('Sushi Plus')))
