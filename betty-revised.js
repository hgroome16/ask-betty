'use strict';
// Creative brief refinement: preserve shared controllers, relocate existing records.
let bettyAccountView='list';
let bettyAskContext={title:'',text:''};
const bettyQuickHits=[['brief','Daily Brief','calendar'],['news','News That Matters','news'],['accounts','My Accounts','people'],['prospects','Prospects','people'],['market','Market Snaps','market'],['catalog','Products','products'],['brand','Brand','star'],['followups','What Do I Owe?','check'],['report','Field Reports','calendar'],['visits','Meeting Notes','calendar'],['roi','Retail ROI','market'],['more','More tools','star']];
ccHomeTools=()=>'<section id="cc-home-tools" class="cc-home-tools" aria-labelledby="cc-home-tools-title"><h2 id="cc-home-tools-title">What you need<br>right now</h2><div class="cc-home-grid">'+bettyQuickHits.map(([route,label,glyph],i)=>'<a class="cc-tile cc-tile-'+i+'" href="#'+route+'">'+bettyFriendlyIcon(route)+'<strong>'+label+'</strong></a>').join('')+'</div></section>';
const bettyFocusedVoice=ccVoice;ccVoice=function(){let html=bettyFocusedVoice();if(ccAskOverlay){html=html.replace(/<div class="betty-typed">[\s\S]*?<\/div>/,'');if(bettyAskContext.title)html=html.replace(/(<section class="cc-voice[^>]*>)/,'$1<p class="betty-ask-context">About: '+esc(bettyAskContext.title)+'</p>');}if(ccReply)html=html.replace('<button class="secondary" data-live-reply-email>','<button class="secondary" data-information-stop>Stop audio</button><button class="secondary" data-live-reply-email>');return html;};
const bettyRevisedBrief=ccLiveBrief;ccLiveBrief=function(){const html=bettyRevisedBrief();if(ccLiveBriefTab!=='meetings')return html;const m=crmBriefMeetings()[ccCRMMeeting];return m?html.replace('<div class="cc-brief-actions">','<a class="secondary betty-prep-link" href="#prep/'+encodeURIComponent(m.account_id)+'">Open Meeting Prep →</a><div class="cc-brief-actions">'):html;};
const bettyRevisedMarket=ccLiveMarket;ccLiveMarket=function(){const html=bettyRevisedMarket();const alerts=revisionNews().filter(n=>/pumpkin|campaign|breast|bite-a-mins/i.test(n.headline));return html+ccPanel('Market Alerts',alerts.map(n=>'<article><h3>'+esc(n.headline)+'</h3><p>'+esc(n.summary)+'</p><a href="#news">Explore the dated story</a></article>').join('')||'<p>No new market alerts.</p>');};
// Broad story links remain available; buyer requests stay in Daily Brief updates.
function bettyCompactActions(main){
 main.querySelectorAll('.cc-information-actions,.cc-asset-card>.cc-actions').forEach(bar=>{
  if(bar.querySelector('.betty-action-menu'))return;
  const page=bar.classList.contains('cc-information-actions');
  const extras=[...bar.children].filter(e=>page?e.matches('[data-betty-information]'):!e.matches('[data-information-listen]'));
  if(!extras.length)return;
  const menu=document.createElement('details');menu.className='betty-action-menu';
  const label=document.createElement('summary');label.textContent=page?'Share':'More actions';menu.append(label);
  const content=document.createElement('div');content.className='betty-action-options';extras.forEach(e=>{if(!e.hasAttribute('aria-label'))e.setAttribute('aria-label',e.textContent.trim());content.append(e);});menu.append(content);bar.append(menu);
 });
 main.querySelectorAll('.cc-panel .cc-actions:not(.cc-asset-card .cc-actions)').forEach(bar=>bar.classList.add('betty-card-actions'));
}
const bettyRevisedRender=render;render=function(){
 bettyRevisedRender();if(document.body.classList.contains('cc-admin')||ccAskOverlay)return;
 const main=document.getElementById('main'),route=(location.hash.slice(1)||'session').split('/')[0];
 const nav=document.querySelector('.topbar nav a[href="#home"]');if(nav)nav.textContent='QuickHits';
 if(route==='accounts'&&ccLive){
  const list=main.querySelector('.cc-account-grid');
  const search=main.querySelector('#cc-live-search');
  if(search&&list){
   const control=document.createElement('div');control.className='betty-account-switch';control.setAttribute('role','group');control.setAttribute('aria-label','Account view');
   control.innerHTML='<button class="secondary" data-betty-account-view="list" aria-pressed="'+(bettyAccountView==='list')+'">List</button><button class="secondary" data-betty-account-view="map" aria-pressed="'+(bettyAccountView==='map')+'">Map</button>';
   search.closest('label').insertAdjacentElement('afterend',control);
   list.hidden=bettyAccountView!=='list';
   if(bettyAccountView==='map'){const wrapper=document.createElement('div');wrapper.innerHTML=bettyTerritoryDashboard();const map=wrapper.querySelector('.betty-map-panel');if(map){map.querySelector('h2').textContent='Massachusetts Store Map';map.querySelector('svg').setAttribute('role','group');map.querySelector('svg').setAttribute('aria-label','Massachusetts account map — choose a store');list.insertAdjacentElement('afterend',map);}else list.insertAdjacentHTML('afterend','<p>No matching accounts.</p>');}
  }
 }
 if(['account','prep','appointment','pastnotes'].includes(route))main.querySelector('[data-rev-account-listen]')?.remove();
 if(route==='prep'){const prep=[...main.querySelectorAll('.cc-panel')].find(p=>p.querySelector('h2')?.textContent==='Meeting Prep'),first=main.querySelector('.cc-panel');if(prep&&first&&prep!==first)first.insertAdjacentElement('beforebegin',prep);}
 if(route==='merch')main.querySelector('h1').insertAdjacentHTML('beforebegin','<a class="betty-breadcrumb" href="#brand">← Brand</a>');
 if(route==='news'&&!main.querySelector('.betty-news-discovery'))main.querySelector('h1')?.insertAdjacentHTML('afterend','<p class="betty-news-discovery">Dated brand news and free coverage. <a href="https://news.google.com/search?q=%22Betty%27s%20Eddies%22&hl=en-US&gl=US&ceid=US%3Aen" target="_blank" rel="noopener">More news on Google News ↗</a></p>');
 bettyCompactActions(main);
};
document.addEventListener('click',event=>{const view=event.target.closest('[data-betty-account-view]');if(view){bettyAccountView=view.dataset.bettyAccountView;render();document.querySelector('[data-betty-account-view="'+bettyAccountView+'"]')?.focus();}const action=event.target.closest('.betty-action-options button,.betty-action-options a');if(action)action.closest('details').open=false;});
// Retain the originating account and return focus when the existing Ask overlay closes.
const bettyContextAsk=crmGlobalAsk;crmGlobalAsk=function(question){const trigger=document.activeElement,route=location.hash.split('/'),main=document.getElementById('main'),card=trigger?.closest('.cc-panel,.cc-owe-item'),context=card||main;bettyAskContext={title:context?.querySelector(card?'h2,h3':'h1')?.textContent||'',text:ccInformationText(context).slice(0,2000)};if(['#account','#prep','#appointment','#pastnotes'].includes(route[0])&&crmAccount(route[1])){ccAccount=route[1];selectedAccount=route[1];}else if(route[0]==='#brief'&&ccLiveBriefTab==='meetings'){const m=crmBriefMeetings()[ccCRMMeeting];ccAccount=m?.account_id||'';selectedAccount=ccAccount;}else{ccAccount='';selectedAccount='';}bettyContextAsk(question);const dialog=document.getElementById('cc-global-ask');dialog?.setAttribute('aria-label','Ask Betty');if(dialog&&!dialog.dataset.bettyFocusReturn){dialog.dataset.bettyFocusReturn='true';dialog.addEventListener('close',()=>trigger?.isConnected&&trigger.focus(),{once:true});}dialog?.querySelector('[data-close-ask]')?.focus();};
document.addEventListener('keydown',event=>{const dialog=document.getElementById('cc-global-ask');if(event.key==='Escape'){document.querySelectorAll('.betty-action-menu[open]').forEach(e=>e.open=false);if(dialog?.open){event.preventDefault();ccStopAskPlayback();ccAskOverlay=false;dialog.close();}}if(event.key==='Tab'&&dialog?.open){const focusable=[...dialog.querySelectorAll('button:not([disabled]),textarea,a[href],input')].filter(e=>e.getClientRects().length),first=focusable[0],last=focusable.at(-1);if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}}});
const bettyMenuEmail=openEmailDraft;openEmailDraft=function(message){document.querySelectorAll('.betty-action-menu[open]').forEach(e=>e.open=false);return bettyMenuEmail(message);};
// The instruction belongs to the illustrated microphone, with a curved Betty label.
const bettyBadgeVoice=ccVoice;
let bettyMicEngaged=false;
document.addEventListener('click',event=>{
 if(!event.target.closest('.cc-mic[data-cc="mic"]'))return;
 bettyMicEngaged=true;
 document.querySelectorAll('.betty-mic-inviting').forEach(mic=>mic.classList.remove('betty-mic-inviting'));
},true);
ccVoice=function(){
 const id=ccAskOverlay?'betty-mic-curve-overlay':'betty-mic-curve-home';
 const label='<svg class="betty-mic-label" viewBox="0 0 300 300" aria-hidden="true" focusable="false"><defs><path id="'+id+'" d="M 36 217 Q 150 345 264 217"/></defs><use href="#'+id+'" class="betty-mic-ribbon-edge"/><use href="#'+id+'" class="betty-mic-ribbon"/><text dominant-baseline="central"><textPath href="#'+id+'" startOffset="50%" text-anchor="middle" textLength="212" lengthAdjust="spacingAndGlyphs">TAP TO SPEAK</textPath></text></svg>';
 return bettyBadgeVoice().replace(/(<button class="cc-mic"[^>]*>)([\s\S]*?)(<\/button>)/,(_,start,content,end)=>(bettyMicEngaged?start:start.replace('class="cc-mic"','class="cc-mic betty-mic-inviting"'))+content+label+end).replace('<h1>TAP TO SPEAK</h1>','<h1 class="betty-voice-state-title">TAP TO SPEAK</h1>');
};
render();
