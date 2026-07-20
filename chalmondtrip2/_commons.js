const https=require('https');
const mode=process.argv[2],term=process.argv[3];
function api(p){const u='https://commons.wikimedia.org/w/api.php?'+Object.entries(p).map(([k,v])=>k+'='+encodeURIComponent(v)).join('&');return new Promise((res,rej)=>{https.get(u,{headers:{'User-Agent':'chalmond/1.0'}},r=>{let d='';r.on('data',c=>d+=c);r.on('end',()=>{try{res(JSON.parse(d))}catch(e){rej(e)}})}).on('error',rej)})}
(async()=>{const common={prop:'imageinfo',iiprop:'url|size|extmetadata',iiurlwidth:1280,format:'json'};
let p=mode==='cat'?{action:'query',generator:'categorymembers',gcmtitle:'Category:'+term,gcmtype:'file',gcmlimit:14,...common}:{action:'query',generator:'search',gsrsearch:term,gsrnamespace:6,gsrlimit:14,...common};
const j=await api(p);const pages=j.query?Object.values(j.query.pages):[];const out=[];
for(const pg of pages){const ii=pg.imageinfo&&pg.imageinfo[0];if(!ii)continue;if(!/\.(jpg|jpeg|png)$/i.test(pg.title))continue;const md=ii.extmetadata||{};const lic=(md.LicenseShortName||{}).value||'?';if(!/^(CC|Public|CC0|No restrictions)/i.test(lic)&&!/public domain/i.test(lic))continue;out.push({t:pg.title,u:ii.thumburl||ii.url,wh:(ii.thumbwidth||ii.width)+'x'+(ii.thumbheight||ii.height),l:lic})}
out.forEach(x=>console.log(' -',x.t,'|',x.l,'|',x.wh,'\n   ',x.u));})();
