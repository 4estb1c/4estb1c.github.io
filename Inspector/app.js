(() => {'use strict';
  const $ = (s, root=document) => root.querySelector(s);
  const path = location.pathname.replace(/\\/g,'/');
  const isReader = path.endsWith('/article.html');
  const fetchJSON = async url => { const r=await fetch(url); if(!r.ok) throw Error(`${r.status} ${url}`); return r.json(); };
  const text = (node, value) => { node.textContent=value ?? ''; return node; };
  const safeURL = value => { try { const u=new URL(value, location.href); return ['http:','https:','mailto:'].includes(u.protocol) ? u.href : null; } catch { return null; } };
  const localURL = value => {const url=safeURL(value);return url&&new URL(url).origin===location.origin?url:null};
  /* A small allow-list for article body markup. Data authors cannot introduce scripts, handlers, embeds, or unsafe URLs. */
  function safeFragment(html){
    const template=document.createElement('template'); template.innerHTML=String(html||'');
    const allowed=new Set(['EM','STRONG','I','B','A','SUP','SUB','CODE','SPAN','BR','CITE','IMG','MATH','MROW','MI','MN','MO','MSUP','MSUB','MFRAC','MSQRT','MTEXT','MSTYLE','MUNDER','MOVER','MUNDOVER']);
    const drop=new Set(['SCRIPT','STYLE','IFRAME','OBJECT','EMBED','FORM','INPUT','BUTTON','TEMPLATE','SVG','LINK','META']);
    const visit=node=>{[...node.children].forEach(child=>{const tag=child.tagName.toUpperCase();if(drop.has(tag)){child.remove();return}if(!allowed.has(tag)){visit(child);child.replaceWith(...child.childNodes);return} [...child.attributes].forEach(a=>{if(tag==='A'&&a.name==='href'){const url=safeURL(a.value);if(url){child.setAttribute('href',url);child.setAttribute('target','_blank');child.setAttribute('rel','noopener');}else child.removeAttribute('href')}else if(tag==='IMG'&&a.name==='src'){const url=safeURL(a.value);if(url)child.setAttribute('src',url);else child.removeAttribute('src')}else if(tag==='IMG'&&['alt','title','width','height'].includes(a.name)){}else if(!(tag==='SPAN'&&a.name==='class')&&!(tag==='MATH'&&['display','xmlns'].includes(a.name)))child.removeAttribute(a.name)});if(tag==='IMG'){child.loading='lazy';child.decoding='async';if(!child.hasAttribute('alt'))child.alt='Image from source article'}visit(child)})}; visit(template.content);return template.content;
  }
  function renderCatalogue(catalogue){
    const list=$('#article-list'), input=$('#article-search'), count=$('#catalogue-count'), articles=catalogue.articles||[];
    document.title=`${catalogue.site?.title||'Inspector'} — a reading room`;
    const draw=()=>{const q=input.value.trim().toLowerCase(); const matches=articles.filter(a=>[a.title,a.subtitle,a.author,...(a.tags||[])].join(' ').toLowerCase().includes(q));list.replaceChildren();count.textContent=`${matches.length} document${matches.length===1?'':'s'}`;matches.forEach((a,i)=>{const card=document.createElement('a');card.className='article-card';card.href=`article.html?id=${encodeURIComponent(a.id)}`;const number=text(document.createElement('span'),String(i+1).padStart(2,'0'));number.className='card-index';card.append(number);const copy=document.createElement('div'),h=text(document.createElement('h2'),a.title),p=text(document.createElement('p'),a.subtitle||a.summary||'');copy.append(h,p);card.append(copy);const tags=document.createElement('div');tags.className='tags';(a.tags||[]).slice(0,3).forEach(tag=>{const s=text(document.createElement('span'),tag);s.className='tag';tags.append(s)});card.append(tags);list.append(card)});if(!matches.length)list.append(text(document.createElement('p'),'No documents match that search.'));}; input.addEventListener('input',draw);draw();
  }
  const makeGlossary = (root, glossary, onlyTerms) => {
    const selected=Array.isArray(onlyTerms)?onlyTerms:null;
    const terms=Object.entries(glossary||{}).filter(([term])=>!selected||selected.some(t=>(typeof t==='string'?t:t?.term)===term)).sort((a,b)=>b[0].length-a[0].length); if(!terms.length)return;
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:n=>n.parentElement?.closest('a,button,.glossary-tip,math,.math')?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT}); const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
    nodes.forEach(node=>{let value=node.nodeValue, lower=value.toLowerCase(), found=[];terms.forEach(([term,definition])=>{let start=0, needle=term.toLowerCase();while((start=lower.indexOf(needle,start))>-1){const before=lower[start-1],after=lower[start+needle.length];if(!/[\p{L}\p{N}]/u.test(before||'')&&!/[\p{L}\p{N}]/u.test(after||''))found.push({start,end:start+term.length,term,definition});start+=needle.length;}});found.sort((a,b)=>a.start-b.start||b.end-a.end);let end=0,frag=document.createDocumentFragment();found.forEach(m=>{if(m.start<end)return;frag.append(value.slice(end,m.start));const definition=typeof m.definition==='string'?m.definition:(m.definition?.definition||m.definition?.text||'');const b=document.createElement('button');b.type='button';b.className='glossary';b.setAttribute('aria-label',`${m.term}: ${definition}`);b.append(m.term);const tip=text(document.createElement('span'),definition);tip.className='glossary-tip';tip.setAttribute('role','tooltip');b.append(tip);b.addEventListener('click',()=>b.classList.toggle('open'));frag.append(b);end=m.end;});if(end){frag.append(value.slice(end));node.replaceWith(frag)}});
  };
  function appendSources(holder, ids, sourceMap){if(!ids?.length)return;const ul=document.createElement('ul');ul.className='note-sources';ids.forEach(id=>{const src=sourceMap.get(id);if(!src)return;const li=document.createElement('li'),a=text(document.createElement('a'),src.label||src.publisher||id),url=safeURL(src.url);if(url){a.href=url;a.target='_blank';a.rel='noopener'}li.append(a);ul.append(li)});holder.append(ul)}
  function renderFigure(figure){
    const chart=window.InspectorCharts?.render(figure);
    if(!chart)return null;
    const wrap=document.createElement('figure'),series=Array.isArray(figure.series)?figure.series:[];
    wrap.className='chart';
    if(figure.title&&String(figure.title)!=='undefined'){
      const title=text(document.createElement('h4'),figure.title);title.className='chart-title';wrap.append(title);
    }
    if(figure.description&&String(figure.description)!=='undefined'){
      const description=text(document.createElement('p'),figure.description);description.className='chart-description';wrap.append(description);
    }
    if(chart.tagName.toLowerCase()==='svg'){
      const points=series.map((item,index)=>`${item.name||item.label||`Series ${index+1}`}: ${(Array.isArray(item.data)?item.data:[]).slice(0,20).map(point=>`${point.x}: ${point.y}`).join(', ')}`).join('. ');
      const histogram=figure.type==='histogram'&&Array.isArray(figure.values)?`Distribution of ${figure.values.length} values: ${figure.values.slice(0,20).join(', ')}`:'';
      const label=[figure.title,figure.description,points,histogram].filter(value=>value&&String(value)!=='undefined').join('. ');
      chart.setAttribute('aria-label',label||'Data chart');
    }
    wrap.append(chart);
    if(['line','scatter'].includes(figure.type)&&series.length>1){
      const legend=document.createElement('ul');legend.className='chart-legend';
      series.forEach((item,index)=>{
        const entry=document.createElement('li'),symbol=document.createElement('span');symbol.className=`chart-legend-symbol series-${index%4}`;
        if(typeof item.color==='string'&&/^(#[\da-f]{3,8}|[a-z]+)$/i.test(item.color))symbol.style.color=item.color;
        entry.append(symbol,text(document.createElement('span'),item.name||item.label||`Series ${index+1}`));legend.append(entry);
      });
      wrap.append(legend);
    }
    if(figure.source&&String(figure.source)!=='undefined')wrap.append(text(document.createElement('figcaption'),figure.source));
    return wrap;
  }
  function renderNote(note, sourceMap){const n=document.createElement('section');n.className=`annotation ${['update','context','original'].includes(note.kind)?note.kind:'context'}`;n.id=note.id?`note-${note.id}`:'';const kind={update:'Updated evidence',context:'Context',original:'Original footnote'}[note.kind]||'Commentary',meta=document.createElement('p');meta.className='annotation-kicker';meta.append(document.createTextNode(kind));if(note.status){const status=text(document.createElement('span'),note.status);status.className='annotation-status';meta.append(status)}n.append(meta);if(note.title)n.append(text(document.createElement('h3'),note.title));if(note.body){const p=document.createElement('p');p.append(safeFragment(note.body));n.append(p)}const fig=renderFigure(note.figure);if(fig)n.append(fig);appendSources(n,note.sourceIds,sourceMap);return n}
  function renderBlock(block, article, sourceMap){const section=document.createElement('section');section.className='article-block';section.dataset.type=block.type||'paragraph';section.id=`block-${block.id}`;if(block.label){const label=text(document.createElement('p'),block.label);label.className='block-label';section.append(label)}let content;switch(block.type){case'heading':content=text(document.createElement('h2'),block.text||block.title||'');break;case'image':content=document.createElement('img');content.className='article-image';content.src=safeURL(block.src)||'';content.alt=block.alt||'';content.loading='lazy';content.decoding='async';section.append(content);if(block.caption){const caption=text(document.createElement('p'),block.caption);caption.className='article-caption';section.append(caption)}content=null;break;case'figure':content=renderFigure(block.figure);break;case'equation':content=document.createElement('div');content.className='math';content.setAttribute('role','math');if(block.mathML){content.append(safeFragment(block.mathML))}else{text(content,block.text||'');content.setAttribute('aria-label',block.text||'Equation')}break;case'quote':content=document.createElement('blockquote');content.append(safeFragment(block.html||block.text));break;case'footnote':content=document.createElement('aside');content.className='original-footnote';content.append(safeFragment(block.html||block.text));break;default:content=document.createElement('p');content.append(safeFragment(block.html||block.text));}if(content)section.append(content);if(block.sourceIds?.length){const p=document.createElement('p');p.className='article-caption';p.append('Source: ');block.sourceIds.forEach((id,i)=>{const src=sourceMap.get(id);if(!src)return;if(i)p.append(', ');const a=text(document.createElement('a'),src.label||id),u=safeURL(src.url);if(u){a.href=u;a.target='_blank';a.rel='noopener'}p.append(a)});section.append(p)}if(block.type!=='image')makeGlossary(section,article.glossary,block.glossaryTerms);return section}
  function selectArticle(){return new URLSearchParams(location.search).get('id')||'situational-awareness'}
  async function renderReader(){
    const status=$('#reader-status'),reader=$('#reader');
    try{
      const id=selectArticle(),article=await fetchJSON(`data/${encodeURIComponent(id)}.json`);
      document.title=`${article.title} — Inspector`;
      text($('#article-kicker'),article.kicker||'Inspector / Reader');
      text($('#article-title'),article.title);
      text($('#article-dek'),article.dek||article.subtitle||'');
      text($('#article-meta'),[`Original by ${article.author||'Unknown'}`,`Inspector companion and research notes`,article.published&&`Original published ${article.published}`,article.updated&&`Companion reviewed ${article.updated}`].filter(Boolean).join(' · '));
      const source=$('#source-link');
      if(article.sourceUrl)source.href=safeURL(article.sourceUrl)||'#';else source.hidden=true;
      const contextUrl=localURL(article.context?.downloadUrl||'context/situational-awareness.md');
      if(contextUrl)$('#context-link').href=contextUrl;else $('#context-link').hidden=true;
      const edition=$('#edition-note');
      if(article.editionNote)text(edition,article.editionNote);else edition.hidden=true;
      const sources=new Map((article.sources||[]).map(item=>[item.id,item]));
      const rows=$('#reader-rows'),chapterList=$('#chapter-list'),blocks=article.blocks||[];
      let noteCount=0;
      const chapterMap=new Map((article.chapters||[]).map(chapter=>[chapter.id,chapter]));
      (article.chapters||[]).forEach(chapter=>{
        const first=blocks.find(block=>block.chapter===chapter.id),item=document.createElement('li');
        const link=text(document.createElement('a'),chapter.title||chapter.id);
        link.href=first?`#chapter-${chapter.id}`:'#original-column';item.append(link);chapterList.append(item);
      });
      let lastChapter;
      blocks.forEach(block=>{
        if(block.chapter&&block.chapter!==lastChapter){
          const chapter=chapterMap.get(block.chapter),divider=document.createElement('section');
          divider.className='chapter-divider';divider.id=`chapter-${block.chapter}`;
          divider.append(text(document.createElement('h2'),chapter?.title||block.chapter));
          rows.append(divider);lastChapter=block.chapter;
        }
        const row=document.createElement('div');row.className='reader-row';
        row.append(renderBlock(block,article,sources));
        const notes=document.createElement('aside');notes.className='margin-cell';
        notes.setAttribute('aria-label',`Commentary on ${block.label||block.text||block.id}`);
        (block.notes||[]).forEach(item=>{notes.append(renderNote(item,sources));noteCount++});
        if(!notes.childElementCount){notes.classList.add('margin-cell-empty');notes.setAttribute('aria-hidden','true')}
        row.append(notes);rows.append(row);
      });
      text($('#note-total'),`(${noteCount})`);
      $('#copy-prompt').addEventListener('click',async()=>{
        try{
          const promptUrl=localURL(article.context?.promptUrl||'prompts/discuss.md');
          if(!promptUrl||!contextUrl)throw Error('Prompt or generated context URL is invalid.');
          const [promptResponse,contextResponse]=await Promise.all([fetch(promptUrl),fetch(contextUrl)]);
          if(!promptResponse.ok||!contextResponse.ok)throw Error('Prompt or generated context is unavailable.');
          const prompt=await promptResponse.text(),research=await contextResponse.text();
          await navigator.clipboard.writeText(`${prompt}

ARTICLE URL
${location.href}

ARTICLE AND RESEARCH CONTEXT
${research}`);
          const toast=$('#toast-template').content.firstElementChild.cloneNode(true);document.body.append(toast);setTimeout(()=>toast.remove(),2200);
        }catch(error){
          const toast=$('#toast-template').content.firstElementChild.cloneNode(true);
          toast.textContent='Prompt or research context could not be copied.';toast.setAttribute('role','alert');document.body.append(toast);setTimeout(()=>toast.remove(),3200);console.error(error);
        }
      });
      const toggle=$('#mobile-notes'),heading=$('.margin-heading'),noteCells=[...document.querySelectorAll('.margin-cell')],mobile=matchMedia('(max-width: 800px)');
      const setNotesVisible=visible=>{
        heading.hidden=mobile.matches&&!visible;
        noteCells.forEach(cell=>{cell.hidden=mobile.matches&&!visible});
        toggle.setAttribute('aria-expanded',String(mobile.matches&&visible));
        toggle.firstChild.textContent=mobile.matches&&visible?'Hide commentary ':'Show commentary ';
      };
      toggle.addEventListener('click',()=>{
        const show=toggle.getAttribute('aria-expanded')!=='true';setNotesVisible(show);
      });
      mobile.addEventListener('change',()=>setNotesVisible(!mobile.matches));
      setNotesVisible(!mobile.matches);
      status.remove();reader.hidden=false;
      const target=location.hash?document.getElementById(decodeURIComponent(location.hash.slice(1))):null;
      if(target)setTimeout(()=>target.scrollIntoView({block:'start'}),0);
    }catch(error){status.textContent='This document could not be opened. Return to the library or check that its data file is present.';console.error(error)}
  }
  (async()=>{if(isReader)return renderReader();try{renderCatalogue(await fetchJSON('data/articles.json'))}catch(error){$('#article-list').append(text(document.createElement('p'),'The library is being prepared.'));console.error(error)}})();
})();
