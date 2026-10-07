'use strict';
// Content adapters reuse the C&C renderer, email, asset and speech controllers.
ccLiveSource=()=>'';
brandCreatives=()=>BETTY_BRAND_ASSETS;
const bettyAssetBase=revisionAssets;
revisionAssets=kind=>kind==='product'?bettyAssetBase(kind):BETTY_BRAND_ASSETS.filter(a=>kind==='merch'?a.category!=='Brand imagery':a.category==='Brand imagery').map(a=>({...a,url:new URL(a.url,location.href).href}));
ccInformationRoutes.add('merch');
const bettyAccountBase=ccLiveAccountPage;
ccLiveAccountPage=id=>{let html=bettyAccountBase(id);const products=BETTY_PRODUCTS.filter(p=>['perk-up-pumpkin','bite-a-mins','raspberrycreme-bedtimebettys'].includes(p.id));return html.replace('<a href="#catalog">View the product portfolio</a>',products.map(p=>'<p><strong>'+esc(p.name)+'</strong><br>'+esc(p.description)+'<br>'+esc(p.formats)+'</p>').join('')+'<a class="secondary" href="#catalog">View the product portfolio</a>');};
let bettyActiveAudioButton=null,bettyRequestedAudioButton=null;
const bettyAudioLabels=new WeakMap();
function bettyResetListen(){if(bettyActiveAudioButton){const original=bettyAudioLabels.get(bettyActiveAudioButton);if(original){bettyActiveAudioButton.textContent=original.text;if(original.aria)bettyActiveAudioButton.setAttribute('aria-label',original.aria);else bettyActiveAudioButton.removeAttribute('aria-label');}bettyActiveAudioButton.removeAttribute('aria-pressed');bettyActiveAudioButton=null;}}
const bettyStopBase=stopAudio;stopAudio=function(){bettyResetListen();return bettyStopBase();};
const bettySpeakBase=speak;speak=function(text){const eventButton=window.event?.target?.closest?.('button');const requested=bettyRequestedAudioButton||((eventButton&&/^(listen|stop)\b/i.test(eventButton.textContent.trim()))?eventButton:null);bettyRequestedAudioButton=null;if(requested&&requested===bettyActiveAudioButton)return stopAudio();const result=bettySpeakBase(text);if(requested&&hasSpeech()){bettyAudioLabels.set(requested,{text:requested.textContent,aria:requested.getAttribute('aria-label')});bettyActiveAudioButton=requested;requested.textContent='Stop';requested.setAttribute('aria-label','Stop');requested.setAttribute('aria-pressed','true');}return result;};
const bettyAudioStatusBase=audioStatus;audioStatus=function(text){bettyAudioStatusBase(text);if(/complete|stopped|unavailable|failed|could not|couldn’t/i.test(text))bettyResetListen();};
window.addEventListener('click',event=>{const button=event.target.closest('button');if(!button)return;if(button===bettyActiveAudioButton){event.preventDefault();event.stopImmediatePropagation();stopAudio();return;}if(/^listen\b/i.test(button.textContent.trim()))bettyRequestedAudioButton=button;},true);
function bettyCleanInterface(){
 const route=(location.hash.slice(1)||'session').split('/')[0],main=document.getElementById('main');
 document.querySelectorAll('.betty-demo-note,.betty-source-stamp').forEach(e=>e.remove());
 if(route==='admin')return;
 main.querySelectorAll('a').forEach(a=>{if(/^(Product source|View original source)$/i.test(a.textContent.trim()))a.remove();});
 main.querySelectorAll('small').forEach(e=>{if(/synthetic|LIT Alerts|demo metric|source:/i.test(e.textContent))e.remove();});
 // Keep news publisher and publication date visible.
 const nav=document.querySelector('.topbar nav');if(nav){const ask=nav.querySelector('[data-global-ask]');if(ask){ask.setAttribute('aria-label','Ask Betty');ask.innerHTML=icon('mic')+'<span>Ask Betty</span>';}}
 
 main.querySelectorAll('.cc-information-actions,.cc-actions,.cc-brief-actions').forEach(actions=>{if(!actions.querySelector('[data-global-ask]'))actions.insertAdjacentHTML('beforeend','<button class="secondary" data-global-ask aria-label="Ask Betty about this information">Ask Betty</button>');});
 const pageActions=main.querySelector('.cc-information-actions');if(pageActions&&!pageActions.querySelector('[data-betty-information]'))pageActions.insertAdjacentHTML('beforeend','<button class="secondary" data-betty-information="copy">Copy</button><button class="secondary" data-betty-information="download">Download</button><button class="secondary" data-betty-information="send">Send</button>');
 
}
const bettyConsistentRender=render;render=function(){bettyConsistentRender();const route=(location.hash.slice(1)||'session').split('/')[0],main=document.getElementById('main');if(!ccAskOverlay&&route==='merch'){main.innerHTML='<h1>Merch</h1><p>Betty’s apparel and accessories for your next retailer conversation.</p>'+revisionAssetCards('merch');ccInformationActions();}if(route==='brand'&&!ccAskOverlay){main.querySelector('h1').textContent='Brand';main.querySelector('h1').insertAdjacentHTML('afterend','<a class="secondary betty-merch-link" href="#merch">Explore Merch →</a>');}bettyCleanInterface();};
ccLogo=()=>'<span class="cc-brand"><img class="betty-illustrated-logo" src="assets/ask-betty-illustrated.png" alt="Ask Betty"><span class="betty-attribution"><span>by</span><span class="quickhits-logo-window"><img src="assets/quickhits-johnny-wordmark.svg" alt="QuickHits"></span></span><small class="betty-territory">Massachusetts demo information</small></span>';
const bettyDesignRender=render;render=function(){bettyDesignRender();if(document.body.classList.contains('cc-admin'))return;};
const bettyVisualVoiceState=ccVoiceState;ccVoiceState=function(mode,message){bettyVisualVoiceState(mode,message);if(mode==='idle'){const h=document.querySelector('.cc-voice h1');if(h)h.textContent='TAP TO SPEAK';}};
window.addEventListener('hashchange',()=>window.scrollTo({top:0,behavior:'instant'}));
// Home links also reset scroll when the visitor is already on home.
document.addEventListener('click',event=>{if(event.target.closest('a.cc-voice-logo,a.betty-header-lockup'))requestAnimationFrame(()=>window.scrollTo({top:0,left:0,behavior:'instant'}));});
document.addEventListener('click',async event=>{const button=event.target.closest('[data-betty-information]');if(!button)return;const main=document.getElementById('main'),title=main.querySelector('h1')?.textContent||'Ask Betty',text=ccInformationText(main),action=button.dataset.bettyInformation;if(action==='copy'){try{await navigator.clipboard.writeText(text);toast('Copied.');}catch{revisionPanel('Copy information','<textarea aria-label="Information to copy" rows="10">'+esc(text)+'</textarea>');}}if(action==='send')openEmailDraft({account:location.hash.startsWith('#account/')?location.hash.split('/')[1]:ccAccount||undefined,text:'Subject: Betty’s Eddies — '+title+'\n\n'+text});if(action==='download'){bettyDownloadText(title,text);}});
about=()=>'<h1>Help & Support</h1>'+ccPanel('Your Betty’s workspace','<p>Ask Betty about the portfolio, brand news, meeting preparation, account notes and follow-ups. Use the dashboard to move between your tools. Listen reads the current information; tap Stop to end playback. Copy, Download and Send use the shared QuickHits workflow.</p>')+ccPanel('Massachusetts','<p>This workspace contains ten Massachusetts account profiles. Product and brand photographs come from Betty’s Eddies. Account records and figures are sample data for this presentation.</p>');
render();


function bettyDownloadText(title,text){let frame=document.getElementById('betty-export-frame');if(!frame){frame=document.createElement('iframe');frame.id=frame.name='betty-export-frame';frame.hidden=true;frame.title='File download';document.body.append(frame);}const form=document.createElement('form');form.method='POST';form.action='/api/export';form.target=frame.name;form.hidden=true;for(const [name,value] of Object.entries({title,text})){const input=document.createElement('input');input.type='hidden';input.name=name;input.value=value;form.append(input);}document.body.append(form);form.submit();form.remove();toast('Download requested.');}
