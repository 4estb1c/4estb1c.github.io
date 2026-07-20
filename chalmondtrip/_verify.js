const fs=require("fs"); const TRIP=require("./data.js");
const html=fs.readFileSync("itinerary.html","utf8");
const all={};
for(const c of Object.values(TRIP.cities))
  for(const it of Object.values(c.categories))
    for(const x of it) all[x.id]=x;

function parseMap(name){
  const start=html.indexOf("const "+name+" = {");
  const seg=html.slice(start, html.indexOf("};",start));
  const m={}; let x; const re=/(?:'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)")\s*:\s*(?:'([a-z0-9-]+)'|null)/g;
  while((x=re.exec(seg))){ const k=(x[1]!==undefined?x[1]:x[2]).replace(/\\'/g,"'"); m[k]=x[3]||null; }
  return m;
}
const TITLE=parseMap("TITLE_MAP"), OPT=parseMap("OPT_MAP");
function mmatch(raw,map){ raw=raw.toLowerCase().replace(/[‘’ʼ]/g,"'"); for(const[k,id]of Object.entries(map)) if(id&&raw.includes(k)) return id; return null; }
function coord(id){ const it=all[id]; return (it&&it.lat&&it.lng)?[it.lat,it.lng]:null; }
const strip=h=>h.replace(/<[^>]+>/g,"").replace(/\s+/g," ").trim();

// split into days
const days=[];
const dre=/<!-- DAY (\d+) -->([\s\S]*?)(?=<!-- DAY \d+ -->|<\/div><!-- \/tab-)/g;
let dm;
while((dm=dre.exec(html))) days.push({num:+dm[1], html:dm[2]});

let problems=[];
let dupGlobal={};
for(const d of days){
  const sched=d.html.slice(d.html.indexOf('<div class="schedule">'));
  // find top-level activities (blocks + option clusters) in order
  const acts=[];
  const are=/<div class="(block(?:\s+highlight)?|options-cluster)">/g;
  let am, idxs=[];
  while((am=are.exec(sched))) idxs.push({pos:am.index, type:am[1].startsWith("block")?"block":"cluster"});
  for(let i=0;i<idxs.length;i++){
    const seg=sched.slice(idxs[i].pos, i+1<idxs.length?idxs[i+1].pos:undefined);
    if(idxs[i].type==="block"){
      const t=seg.match(/<div class="block-title">([\s\S]*?)<\/div>/);
      const name=t?strip(t[1].replace(/<span class="cost">[\s\S]*?<\/span>/,"")):"?";
      acts.push({type:"block", name, id:mmatch(name,TITLE)});
    } else {
      const h=seg.match(/<div class="options-head">([\s\S]*?)<\/div>/);
      const name=h?strip(h[1]):"?";
      const opts=[...seg.matchAll(/<div class="opt-name">([\s\S]*?)<\/div>/g)]
        .map(o=>strip(o[1].replace(/<span class="cost">[\s\S]*?<\/span>/,"")));
      let id=null; for(const o of opts){ id=mmatch(o,OPT); if(id&&coord(id)) break; }
      acts.push({type:"cluster", name, id, opts});
    }
  }
  // carry-forward map points (mirror _buildStops)
  let last=null;
  const pts=acts.map(a=>{ const own=a.id?coord(a.id):null; const p=a.type==="block"?(own||last):(last||own); if(p)last=p; return p; });
  const firstP=pts.find(Boolean);
  const finalPts=pts.map(p=>p||firstP);
  const markers=finalPts.filter(Boolean).length;
  if(markers!==acts.length) problems.push(`Day ${d.num}: ${acts.length} activities but ${markers} markers`);

  // per-day image dedup + duplicate-file check
  const shown=new Set(); const usedImgs=new Set();
  function gallery(id){
    if(!id) return; const it=all[id]; if(!it||!it.images||!it.images.length) return;
    if(shown.has(id)) return; shown.add(id);
    for(const src of it.images){
      if(usedImgs.has(src)) problems.push(`Day ${d.num}: duplicate image within day: ${src}`);
      usedImgs.add(src);
      (dupGlobal[src]=dupGlobal[src]||new Set()).add(id);
    }
  }
  for(const a of acts){
    if(a.type==="block") gallery(a.id);
    else for(const o of a.opts){ const id=mmatch(o,OPT); gallery(id); }
  }
}
// global: any image file used by >1 distinct venue id
for(const [src,ids] of Object.entries(dupGlobal)) if(ids.size>1) problems.push(`Image ${src} shared by venues: ${[...ids].join(", ")}`);

console.log("Days parsed:", days.map(d=>d.num).join(","));
console.log("Per-day activity counts:", days.map(d=>{const sc=d.html.slice(d.html.indexOf('schedule'));const n=(sc.match(/<div class="(block(?:\s+highlight)?|options-cluster)">/g)||[]).length;return d.num+":"+n;}).join("  "));
if(problems.length){ console.log("\nPROBLEMS ("+problems.length+"):"); problems.forEach(p=>console.log("  - "+p)); }
else console.log("\nALL GOOD: every numbered activity resolves to a marker; no duplicate images.");
