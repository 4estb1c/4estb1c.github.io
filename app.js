(() => {'use strict';
  const $ = (s, root=document) => root.querySelector(s);
  const path = location.pathname.replace(/\\/g,'/');
  const isReader = path.endsWith('/article.html');
  const fetchJSON = async url => { const r=await fetch(url,{cache:'no-cache'}); if(!r.ok) throw Error(`${r.status} ${url}`); return r.json(); };
  const text = (node, value) => { node.textContent=value ?? ''; return node; };
  const safeURL = value => { try { const u=new URL(value, location.href); return ['http:','https:','mailto:'].includes(u.protocol) ? u.href : null; } catch { return null; } };
  const localURL = value => {const url=safeURL(value);return url&&new URL(url).origin===location.origin?url:null};
  /* A small allow-list for article body markup. Data authors cannot introduce scripts, handlers, embeds, or unsafe URLs. */
  function safeFragment(html){
    const template=document.createElement('template'); template.innerHTML=String(html||'');
    const allowed=new Set(['P','EM','STRONG','I','B','A','SUP','SUB','CODE','SPAN','BR','CITE','IMG','UL','OL','LI','TABLE','THEAD','TBODY','TFOOT','TR','TH','TD','CAPTION','MATH','MROW','MI','MN','MO','MSUP','MSUB','MFRAC','MSQRT','MROOT','MTEXT','MSTYLE','MUNDER','MOVER','MUNDEROVER','MTABLE','MTR','MTD','MSPACE','MFENCED','MENCLOSE','MPADDED']);
    const drop=new Set(['SCRIPT','STYLE','IFRAME','OBJECT','EMBED','FORM','INPUT','BUTTON','TEMPLATE','SVG','LINK','META']);
    const setNumeric=(element,attribute,value,max)=>{
      if(!/^[1-9]\d{0,3}$/.test(value)||Number(value)>max)element.removeAttribute(attribute);
    };
    const visit=node=>{
      [...node.children].forEach(child=>{
        const tag=child.tagName.toUpperCase();
        if(drop.has(tag)){child.remove();return}
        if(!allowed.has(tag)){visit(child);child.replaceWith(...child.childNodes);return}
        [...child.attributes].forEach(attribute=>{
          const name=attribute.name,value=attribute.value;
          if(tag==='A'&&name==='href'){
            if(/^#[\w:.-]+$/.test(value)){child.setAttribute('href',value);return}
            const url=safeURL(value);
            if(!url){child.removeAttribute(name);return}
            child.setAttribute('href',url);
            if(/^https?:$/.test(new URL(url).protocol)){child.target='_blank';child.rel='noopener'}
            return;
          }
          if(tag==='IMG'&&name==='src'){
            const url=safeURL(value);
            if(url&&/^https?:$/.test(new URL(url).protocol))child.setAttribute('src',url);else child.removeAttribute(name);
            return;
          }
          if(tag==='IMG'&&['alt','title'].includes(name))return;
          if(tag==='IMG'&&['width','height'].includes(name)){setNumeric(child,name,value,4000);return}
          if(tag==='TH'&&name==='scope'&&['row','col','rowgroup','colgroup'].includes(value))return;
          if(['TH','TD'].includes(tag)&&['colspan','rowspan'].includes(name)){setNumeric(child,name,value,100);return}
          if(tag==='OL'&&name==='start'){setNumeric(child,name,value,10000);return}
          if(tag==='LI'&&name==='value'){setNumeric(child,name,value,10000);return}
          if(tag==='MATH'&&name==='display'&&['inline','block'].includes(value))return;
          if(tag==='MATH'&&name==='xmlns'&&value==='http://www.w3.org/1998/Math/MathML')return;
          child.removeAttribute(name);
        });
        if(tag==='IMG'){child.loading='lazy';child.decoding='async';if(!child.hasAttribute('alt'))child.alt='Image from source article'}
        visit(child);
      });
    };
    visit(template.content);return template.content;
  }
  function renderCatalogue(catalogue){
    const list=$('#article-list'), input=$('#article-search'), count=$('#catalogue-count'), articles=catalogue.articles||[];
    document.title=`${catalogue.site?.title||'Margin'} — a reading room`;
    const draw=()=>{const q=input.value.trim().toLowerCase(); const matches=articles.filter(a=>[a.title,a.subtitle,a.author,...(a.tags||[])].join(' ').toLowerCase().includes(q));list.replaceChildren();count.textContent=`${matches.length} document${matches.length===1?'':'s'}`;matches.forEach((a,i)=>{const card=document.createElement('a');card.className='article-card';card.href=`article.html?id=${encodeURIComponent(a.id)}`;const number=text(document.createElement('span'),String(i+1).padStart(2,'0'));number.className='card-index';card.append(number);const copy=document.createElement('div'),h=text(document.createElement('h2'),a.title),p=text(document.createElement('p'),a.subtitle||a.summary||'');copy.append(h,p);card.append(copy);const tags=document.createElement('div');tags.className='tags';(a.tags||[]).slice(0,3).forEach(tag=>{const s=text(document.createElement('span'),tag);s.className='tag';tags.append(s)});card.append(tags);list.append(card)});if(!matches.length)list.append(text(document.createElement('p'),'No documents match that search.'));}; input.addEventListener('input',draw);draw();
  }
  const makeGlossary = (root, glossary, onlyTerms) => {
    const selected=Array.isArray(onlyTerms)?onlyTerms.map(item=>typeof item==='string'?item:item?.term).filter(Boolean):[];
    if(!selected.length)return;
    const terms=Object.entries(glossary||{}).filter(([term])=>selected.includes(term)).sort((a,b)=>b[0].length-a[0].length); if(!terms.length)return;
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:n=>n.parentElement?.closest('a,button,.glossary-tip,math,.math')?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT}); const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
    nodes.forEach(node=>{let value=node.nodeValue, lower=value.toLowerCase(), found=[];terms.forEach(([term,definition])=>{let start=0, needle=term.toLowerCase();while((start=lower.indexOf(needle,start))>-1){const before=lower[start-1],after=lower[start+needle.length];if(!/[\p{L}\p{N}]/u.test(before||'')&&!/[\p{L}\p{N}]/u.test(after||''))found.push({start,end:start+term.length,term,definition});start+=needle.length;}});found.sort((a,b)=>a.start-b.start||b.end-a.end);let end=0,frag=document.createDocumentFragment();found.forEach(m=>{if(m.start<end)return;frag.append(value.slice(end,m.start));const definition=typeof m.definition==='string'?m.definition:(m.definition?.definition||m.definition?.text||''),sourceUrl=typeof m.definition==='object'?safeURL(m.definition?.sourceUrl):null;const wrapper=document.createElement('span');wrapper.className='glossary-wrap';const b=document.createElement('button');b.type='button';b.className='glossary';b.setAttribute('aria-label',`${m.term}: ${definition}`);b.append(m.term);const tip=document.createElement('span');tip.id=`glossary-${Math.random().toString(36).slice(2)}`;tip.className='glossary-tip';tip.setAttribute('role','note');b.setAttribute('aria-describedby',tip.id);tip.append(document.createTextNode(definition));if(sourceUrl&&/^https?:$/.test(new URL(sourceUrl).protocol)){const cite=text(document.createElement('a'),m.definition.sourceLabel||'Source');cite.href=sourceUrl;cite.target='_blank';cite.rel='noopener';tip.append(document.createTextNode(' '),cite)}wrapper.append(b,tip);b.addEventListener('click',()=>{wrapper.classList.remove('dismissed');wrapper.classList.toggle('open')});b.addEventListener('keydown',event=>{if(event.key==='Escape'){wrapper.classList.remove('open');wrapper.classList.add('dismissed');b.focus()}});frag.append(wrapper);end=m.end;});if(end){frag.append(value.slice(end));node.replaceWith(frag)}});
  };
  function appendSources(holder, ids, sourceMap){if(!ids?.length)return;const ul=document.createElement('ul');ul.className='note-sources';ids.forEach(id=>{const src=sourceMap.get(id);if(!src)return;const li=document.createElement('li'),a=text(document.createElement('a'),src.label||src.publisher||id),url=safeURL(src.url);if(url&&/^https?:$/.test(new URL(url).protocol)){a.href=url;a.target='_blank';a.rel='noopener'}li.append(a);ul.append(li)});if(ul.childElementCount)holder.append(ul)}
  function renderSourceImage(data){
    const image=document.createElement('img'),url=safeURL(data?.src);
    if(url&&/^https?:$/.test(new URL(url).protocol))image.src=url;
    image.alt=String(data?.alt||'Image from source article');image.loading='lazy';image.decoding='async';
    for(const key of ['width','height'])if(Number.isInteger(Number(data?.[key]))&&Number(data[key])>0)image.setAttribute(key,String(Number(data[key])));
    return image;
  }
  function renderSourceFigure(block){
    const figure=document.createElement('figure');figure.className='source-figure';
    (Array.isArray(block.images)?block.images:[]).forEach(item=>figure.append(renderSourceImage(item)));
    if(block.tableHtml)figure.append(safeFragment(block.tableHtml));
    else if(block.tableText)figure.append(text(document.createElement('p'),block.tableText));
    const caption=block.captionHtml?safeFragment(block.captionHtml):null;
    if(caption?.childNodes.length){const node=document.createElement('figcaption');node.append(caption);figure.append(node)}
    else if(block.captionText)figure.append(text(document.createElement('figcaption'),block.captionText));
    return figure.childNodes.length?figure:null;
  }
  function renderFigure(figure){
    const chart=window.MarginCharts?.render(figure);
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
  function renderNote(note, sourceMap, anchorId, number, index){
    const section=document.createElement('div');section.className='annotation';section.setAttribute('role','note');
    section.id=note.id?`note-${note.id}`:`note-${anchorId}-${index+1}`;section.dataset.anchor=anchorId;
    section.setAttribute('aria-label',`Margin note ${number}${note.title?`: ${note.title}`:''}`);
    const paragraph=document.createElement('p');paragraph.className='annotation-body';
    const back=text(document.createElement('a'),`m${number}`);back.className='annotation-number';back.href=`#ref-${section.id}`;back.setAttribute('aria-label',`Back to passage for margin note ${number}`);paragraph.append(back,document.createTextNode(' '));
    if(note.title){const title=document.createElement('strong');title.append(safeFragment(note.title));paragraph.append(title);if(note.body)paragraph.append(document.createTextNode(' '))}
    if(note.body)paragraph.append(safeFragment(note.body));
    if(paragraph.childNodes.length)section.append(paragraph);
    const figure=renderFigure(note.figure);if(figure)section.append(figure);
    appendSources(section,note.sourceIds,sourceMap);return section;
  }
  function addMarginReference(sourceNode, annotation, number){
    const candidates=sourceNode.querySelectorAll('p, li, figcaption, blockquote, h2, h3, h4, h5, h6, td, th');
    const target=candidates[candidates.length-1]||sourceNode;
    const marker=document.createElement('sup'),link=text(document.createElement('a'),`m${number}`);
    marker.className='margin-ref';link.id=`ref-${annotation.id}`;link.href=`#${annotation.id}`;
    link.setAttribute('aria-label',`Read margin note ${number}`);
    marker.append(link);target.append(marker);
  }
  function linkOriginalFootnotes(sourceBlocks){
    const references=new Map();
    sourceBlocks.querySelectorAll('a[href^="#footnote-"]').forEach(link=>{
      const target=link.getAttribute('href').slice(1);
      if(!/^[\w:.-]+$/.test(target))return;
      link.classList.add('source-footnote-ref');
      link.setAttribute('aria-label',`Read original footnote ${link.textContent.trim()}`);
      if(!references.has(target)){
        link.id=`ref-${target}`;
        references.set(target,link.id);
      }
    });
    sourceBlocks.querySelectorAll('.original-footnote').forEach((footnote,index)=>{
      const match=/^footnote-(\d+)(?:-|$)/.exec(footnote.id);
      const number=match?match[1]:String(index+1);
      const back=document.createElement(references.has(footnote.id)?'a':'span');
      back.className='original-footnote-number';text(back,`${number}.`);
      if(back.tagName==='A'){
        back.href=`#${references.get(footnote.id)}`;
        back.setAttribute('aria-label',`Back to original footnote reference ${number}`);
      }
      footnote.prepend(back,document.createTextNode(' '));
    });
  }
  function renderBlock(block, article, sourceMap){
    const section=document.createElement('section');section.className='article-block';
    section.dataset.type=block.type||'paragraph';section.id=`block-${block.id}`;
    let content;
    switch(block.type){
      case 'heading': {
        const requested=Number(block.level),level=Number.isInteger(requested)?Math.max(2,Math.min(6,requested)):2;
        content=document.createElement(`h${level}`);
        if(block.html)content.append(safeFragment(block.html));else text(content,block.text||block.title||'');
        break;
      }
      case 'image': {
        content=renderSourceImage(block);content.className='article-image';section.append(content);
        if(block.caption){const caption=text(document.createElement('p'),block.caption);caption.className='article-caption';section.append(caption)}
        content=null;break;
      }
      case 'figure': content=block.figure?renderFigure(block.figure):renderSourceFigure(block);break;
      case 'equation': {
        content=document.createElement('div');content.className='math';content.setAttribute('role','math');
        if(block.mathML)content.append(safeFragment(block.mathML));
        else{text(content,block.text||'');content.setAttribute('aria-label',block.text||'Equation')}
        break;
      }
      case 'quote': content=document.createElement('blockquote');content.append(safeFragment(block.html||block.text));break;
      case 'footnote': {
        content=document.createElement('aside');content.className='original-footnote';
        if(typeof block.footnoteId==='string'&&/^[\w:.-]+$/.test(block.footnoteId))content.id=block.footnoteId;
        content.append(safeFragment(block.html||block.text));break;
      }
      case 'list': {
        if(block.html)content=safeFragment(block.html);
        else{
          const makeList=(items,ordered)=>{
            const list=document.createElement(ordered?'ol':'ul');
            (Array.isArray(items)?items:[]).forEach(item=>{
              const li=document.createElement('li');
              if(item&&typeof item==='object'&&item.html)li.append(safeFragment(item.html));
              else li.append(safeFragment(item&&typeof item==='object'?item.text:item));
              if(Array.isArray(item?.children)&&item.children.length)li.append(makeList(item.children,item.ordered===true||item.listType==='ordered'));
              list.append(li);
            });
            return list;
          };
          content=makeList(block.items,block.ordered===true||block.listType==='ordered'||block.listType==='ol');
        }
        break;
      }
      case 'separator': content=document.createElement('hr');content.className='article-separator';break;
      default: content=document.createElement('p');content.append(safeFragment(block.html||block.text));
    }
    if(content)section.append(content);
    makeGlossary(section,article.glossary,block.glossaryTerms);return section;
  }
  function selectArticle(){return new URLSearchParams(location.search).get('id')||'situational-awareness'}
  async function renderReader(){
    const status=$('#reader-status'),reader=$('#reader');
    try{
      const id=selectArticle(),article=await fetchJSON(`data/${encodeURIComponent(id)}.json`);
      document.title=`${article.title} — Margin`;
      const kicker=$('#article-kicker');
      if(article.kicker)text(kicker,article.kicker);
      else{kicker.hidden=article.sourceMode==='full';if(!kicker.hidden)text(kicker,'Margin / Reader')}
      text($('#article-title'),article.title);
      text($('#article-dek'),article.dek||article.subtitle||'');
      text($('#article-meta'),[`Original by ${article.author||'Unknown'}`,'Margin commentary and research',article.published&&`Original published ${article.published}`,article.updated&&`Companion reviewed ${article.updated}`].filter(Boolean).join(' · '));
      const source=$('#source-link');
      if(article.sourceUrl)source.href=safeURL(article.sourceUrl)||'#';else source.hidden=true;
      const contextUrl=localURL(article.context?.downloadUrl||'context/situational-awareness.md');
      if(contextUrl)$('#context-link').href=contextUrl;else $('#context-link').hidden=true;
      const edition=$('#edition-note');if(article.editionNote)text(edition,article.editionNote);else edition.hidden=true;
      const sources=new Map((article.sources||[]).map(item=>[item.id,item]));
      const sourceBlocks=$('#source-blocks'),marginNotes=$('#margin-notes'),marginColumn=$('#margin-column'),chapterNav=$('.chapter-nav'),chapterList=$('#chapter-list'),blocks=article.blocks||[];
      const chapters=Array.isArray(article.chapters)?article.chapters:[];
      if(chapters.length===1&&chapters[0].showHeading===false)chapterNav.hidden=true;
      const noteNodes=[];let noteCount=0;
      chapters.forEach(chapter=>{
        const first=blocks.find(block=>block.chapter===chapter.id),item=document.createElement('li');
        const link=text(document.createElement('a'),chapter.title||chapter.id);
        link.href=first?`#block-${first.id}`:'#original-column';item.append(link);chapterList.append(item);
      });
      blocks.forEach(block=>{
        const sourceNode=renderBlock(block,article,sources);sourceBlocks.append(sourceNode);
        (block.notes||[]).forEach((note,index)=>{
          const annotation=renderNote(note,sources,block.id,noteCount+1,index);
          annotation.dataset.anchor=`block-${block.id}`;marginNotes.append(annotation);noteNodes.push(annotation);noteCount++;
          addMarginReference(sourceNode,annotation,noteCount);
          sourceNode.setAttribute('aria-describedby',[sourceNode.getAttribute('aria-describedby'),annotation.id].filter(Boolean).join(' '));
        });
      });
      linkOriginalFootnotes(sourceBlocks);
      text($('#note-total'),`(${noteCount})`);
      const toggle=$('#mobile-notes'),mobile=matchMedia('(max-width: 800px)');
      let layoutQueued=false;
      const scheduleNoteLayout=()=>{
        if(layoutQueued)return;layoutQueued=true;
        requestAnimationFrame(()=>{layoutQueued=false;layoutNotes()});
      };
      function layoutNotes(){
        if(mobile.matches){marginNotes.style.minHeight='';noteNodes.forEach(note=>{note.style.top=''});return}
        let previousBottom=0;
        noteNodes.forEach(note=>{
          const anchor=document.getElementById(note.dataset.anchor),requested=anchor?anchor.offsetTop:previousBottom;
          const top=Math.max(requested,previousBottom?previousBottom+28:0);
          note.style.top=`${top}px`;previousBottom=top+note.offsetHeight;
        });
        marginNotes.style.minHeight=`${Math.max(sourceBlocks.offsetHeight,previousBottom)}px`;
      }
      const setNotesVisible=visible=>{
        marginColumn.hidden=mobile.matches&&!visible;
        toggle.setAttribute('aria-expanded',String(mobile.matches&&visible));
        toggle.firstChild.textContent=mobile.matches&&visible?'Hide commentary ':'Show commentary ';
        if(!mobile.matches)scheduleNoteLayout();
      };
      sourceBlocks.addEventListener('click',event=>{
        const link=event.target.closest('.margin-ref a');
        if(!link||!mobile.matches)return;
        event.preventDefault();setNotesVisible(true);
        location.hash=link.hash;
        requestAnimationFrame(()=>document.getElementById(link.hash.slice(1))?.scrollIntoView({block:'start'}));
      });
      toggle.addEventListener('click',()=>{
        const show=toggle.getAttribute('aria-expanded')!=='true';setNotesVisible(show);
        if(show&&mobile.matches)marginColumn.scrollIntoView({behavior:'smooth',block:'start'});
      });
      mobile.addEventListener('change',()=>setNotesVisible(!mobile.matches));
      if('ResizeObserver'in window){
        const observer=new ResizeObserver(scheduleNoteLayout);observer.observe(sourceBlocks);noteNodes.forEach(note=>observer.observe(note));
        sourceBlocks.querySelectorAll('img').forEach(image=>image.addEventListener('load',scheduleNoteLayout,{once:true}));
      }
      window.addEventListener('resize',scheduleNoteLayout,{passive:true});
      if(document.fonts?.ready)document.fonts.ready.then(scheduleNoteLayout);
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
      setNotesVisible(!mobile.matches);status.remove();reader.hidden=false;scheduleNoteLayout();
      const target=location.hash?document.getElementById(decodeURIComponent(location.hash.slice(1))):null;
      if(target)setTimeout(()=>target.scrollIntoView({block:'start'}),0);
    }catch(error){status.textContent='This document could not be opened. Return to the library or check that its data file is present.';console.error(error)}
  }
  (async()=>{if(isReader)return renderReader();try{renderCatalogue(await fetchJSON('data/articles.json'))}catch(error){$('#article-list').append(text(document.createElement('p'),'The library is being prepared.'));console.error(error)}})();
})();
