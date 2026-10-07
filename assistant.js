'use strict';
// Fictional wholesale CRM performance. Never inferred from menu listings.
const SALES={bowery:{current:8400,prior:9600,orders:3},borough:{current:11200,prior:10000,orders:4},capital:{current:14600,prior:12800,orders:5},queens:{current:4200,prior:5600,orders:2},buffalo:{current:9800,prior:9100,orders:3},rochester:{current:6300,prior:6000,orders:2}};
const VISITS={bowery:{date:'2026-09-22',text:'Jordan asked for a tighter flower assortment and a follow-up on pre-roll availability.'},borough:{date:'2026-09-24',text:'Sam asked for a side-by-side flower comparison before the next order.'},capital:{date:'2026-09-17',text:'The team requested staff education on the new pre-roll format.'},queens:{date:'2026-09-21',text:'Casey wanted to confirm the gummy assortment before discussing a reorder.'},buffalo:{date:'2026-09-24',text:'Jamie was open to the expanded flower assortment and requested a merchandising check.'},rochester:{date:'2026-09-20',text:'Drew asked to schedule product education for the floor team.'}};
let selectedAccount='bowery',responseMode='voice',recognizer=null,listening=false,utterance=null,speechSequence=0;
try{responseMode=localStorage.getItem("quickhits-reply-mode")||"voice";}catch{}
const hasSpeech=()=>typeof window.speechSynthesis!=='undefined'&&typeof window.SpeechSynthesisUtterance!=='undefined';
const money=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(n);
const accountNotes=a=>notes.filter(n=>n.account===a.id).sort((x,y)=>new Date(y.date)-new Date(x.date));
function salesBrief(a){const s=SALES[a.id];if(!s)return 'This is a prospect. There are no orders or sales in the demo CRM yet.';const delta=(s.current-s.prior)/s.prior*100;return `We invoiced ${money(s.current)} across ${s.orders} orders for August 29 through September 25, ${delta<0?'down':'up'} ${Math.abs(delta).toFixed(1)}% versus the previous 28 days (${money(s.prior)}). Retail sell-through is not connected.`;}
function competitorBrief(a){if(a.id==='borough')return 'Northline, a fictional competitor, lists comparable 3.5 gram flower at $38.72 versus our $44. That is 12% lower. Check whether it is a promotion before discussing price.';if(a.id==='bowery')return 'Northline, a fictional competitor, lists comparable 3.5 gram flower at $39 versus our $42. That is 7.1% lower. Compare positioning and promotion status with Jordan.';return 'There is no account-specific competitor snapshot for this location. In the synthetic territory comparison, Northline flower averages $39.50 versus our $42.50 for 3.5 grams. That is territory context, not a verified price at this store.';}
function visitBrief(a){const local=accountNotes(a).find(n=>n.type==='Store visit');const seed=VISITS[a.id];if(local&&(!seed||new Date(local.date)>new Date(seed.date)))return `Last time you were in: ${formatDate(local.date)}. ${local.text}`;return seed?`Your last recorded store visit was ${formatDate(seed.date+'T12:00:00')}. ${seed.text}`:'No store visit is recorded for this prospect. Review the introductory notes before going in.';}
function commentsBrief(a){const latest=accountNotes(a).slice(0,2);return latest.length?latest.map(n=>`${n.author}, ${formatDate(n.date)}, ${n.type.toLowerCase()}: ${n.text}`).join('\n\n'):'No rep comments are recorded for this account yet.';}
function answer(q){
 const lower=q.toLowerCase().replace(/[’']/g,'');
 const named=ACCOUNTS.filter(a=>lower.includes(a.name.toLowerCase())||lower.includes(a.id));
 if(named.length>1)return 'Please choose one account for this briefing. I can cover each account separately so sales and notes stay in the right context.';
 if(named.length===1)selectedAccount=named[0].id;
 const a=ACCOUNTS.find(a=>a.id===selectedAccount);
 if(/what (?:has )?changed/.test(lower))return `${a.name} — here’s the change\n\n${a.skus} menu listings now, ${a.previous} last time. ${a.opportunity}. ${a.action}\n\nDemo menu snapshot · Sep 25. A missing listing doesn’t confirm a stockout.`;
 if(/leave open|owe|follow.up/.test(lower))return `${a.name} — where we left it\n\n${visitBrief(a)}\n\nNext up: ${a.action}\n\nDemo history and saved visit notes.`;
 if(/news|industry|market update|market brief|territory brief/.test(lower))return dailyNewsText(a.region);
 if(/\b(today|priorities|territory)\b/.test(lower)&&!named.length&&!/sales|compet/.test(lower))return 'Demo territory priorities: start with Bowery Green to confirm two missing menu listings, then review Borough Bloom’s competitor price gap. Hudson Valley Collective is the prospect follow-up. Select an account for its sales, last visit and buyer notes.';
 if(/\b(sales|selling|revenue|orders|sell.through|performance)\b/.test(lower))return `${a.name} — sales\n\n${salesBrief(a)}\n\nSource: synthetic wholesale CRM, as of September 25, 2026. Menu data is a separate source.`;
 if(/compet|price|pricing/.test(lower))return `${a.name} — competition\n\n${competitorBrief(a)}\n\nSource: synthetic menu observations, September 25, 2026. Prices are before tax.`;
 if(/last visit|last time|visited|previous visit/.test(lower))return `${a.name} — last visit\n\n${visitBrief(a)}\n\nSource: demo visit history and locally saved store visits.`;
 if(/comments?|notes?|said|conversation/.test(lower))return `${a.name} — notes and comments\n\n${commentsBrief(a)}\n\nSource: synthetic seed notes and locally saved rep activity.`;
 if(/status|stock|available|availability|menu/.test(lower))return `${a.name} — current status\n\n${a.status} account. ${a.skus} current brand menu listings, versus ${a.previous} in the prior snapshot. ${a.opportunity}. ${a.action}\n\nSource: synthetic menu snapshot, September 25, 2026. A missing listing is not a confirmed stockout.`;
 if(/catch me up|brief|prepare|heading|way to|tell me|customer|account|walk me/.test(lower))return `${a.name} — pre-visit briefing\n\n${a.status} account. You’re seeing ${a.contact}, ${a.role.toLowerCase()}. ${a.opportunity}.\n\n${salesBrief(a)}\n\n${competitorBrief(a)}\n\n${visitBrief(a)}\n\nNext up: ${a.action}\n\nDemo sources: CRM, menu snapshot and visit history. Follow up with “What were the comments?” for the latest notes.`;
 return `I’m focused on ${a.name}. I can brief you on current status, sales, competitors, your last visit or rep comments. This demo uses predefined responses, so I may not understand every phrasing. Select another account if that is the customer you mean.`;
}

let activeShortcut='brief';
function crewShortcuts(a){const items=[{id:'brief',label:'Catch me up',prompt:'Catch me up'},{id:'owe',label:'What do I owe them?',prompt:'What do I owe them? Review this account’s recorded visit notes and follow-ups. Tell me what I promised, who owns each next step, and any recorded due dates. Say when those details are missing.'},{id:'news',label:'Product and brand news',prompt:'What product and brand news is relevant to this customer? Use the supplied dated sources, name the source and publication date, and say when no current product or brand update is available.'},{id:'past',label:'My Past Notes',href:'#pastnotes/'+a.id},{id:'notes',label:'Take Notes',href:'#debrief/'+a.id}];return '<div class="crew-shortcuts">'+items.map(i=>i.href?'<a data-shortcut="'+i.id+'" class="'+(activeShortcut===i.id?'primary':'secondary')+'" href="'+i.href+'">'+i.label+'</a>':'<button data-shortcut="'+i.id+'" aria-pressed="'+(activeShortcut===i.id)+'" class="'+(activeShortcut===i.id?'primary':'secondary')+'" data-prompt="'+esc(i.prompt)+'">'+i.label+'</button>').join('')+'</div>';}
document.addEventListener('click',e=>{const b=e.target.closest('[data-shortcut]');if(!b)return;activeShortcut=b.dataset.shortcut;document.querySelectorAll('[data-shortcut]').forEach(x=>{const active=x.dataset.shortcut===activeShortcut;x.classList.toggle('primary',active);x.classList.toggle('secondary',!active);if(x.tagName==='BUTTON')x.setAttribute('aria-pressed',String(active));});},true);

function ai(){const a=ACCOUNTS.find(a=>a.id===selectedAccount);return `<div class="chat-shell field-assistant crew-assistant"><div class="eyebrow">Betty’s Eddies · NEW YORK CREW</div><h1>Hey, Harry.</h1><p class="page-subhead">Get ready for your next stop, talk it through, and keep your notes together.</p><section class="briefing-setup"><div class="briefing-account"><label for="brief-account">Where are you headed?</label><select id="brief-account">${ACCOUNTS.map(x=>`<option value="${x.id}" ${x.id===a.id?'selected':''}>${x.name}</option>`).join('')}</select><p>${a.contact} · ${a.city}</p></div><fieldset class="response-mode"><legend>Talk or type</legend><label><input type="radio" name="reply-mode" value="voice" ${responseMode==='voice'?'checked':''} ${hasSpeech()?'':'disabled'}> Talk</label><label><input type="radio" name="reply-mode" value="text" ${responseMode==='text'?'checked':''}> Quiet mode</label></fieldset></section><form id="chat-form" class="composer"><label for="chat-input" class="sr-only">Message</label><textarea id="chat-input" placeholder="Ask any question about this account. Write and send an email from here." maxlength="1000" rows="2" required></textarea><button id="voice-button" class="secondary" type="button" aria-label="Speak your message">${icon("mic")} Speak</button><button class="primary" type="submit">Send →</button></form><p id="voice-status" class="fineprint" role="status"></p>${crewShortcuts(a)}<div class="email-entry"><button class="primary" data-new-email>Send email →</button><span class="fineprint">Review here. Send from your Gmail.</span></div><div id="chat-messages" class="chat-messages" aria-live="polite">${renderMessages()}</div><p class="fineprint">Type or speak here for an answer. To keep a visit note, use <a href="#debrief/${a.id}">Take Notes</a>.</p><div class="audio-controls" aria-label="Voice playback"><button id="replay-reply" class="secondary" ${responseMode==='text'?'disabled':''}>▶ Listen again</button><button id="stop-audio" class="secondary">■ Stop</button><span id="audio-status" role="status">${responseMode==='text'?'Quiet mode · sound off':hasSpeech()?'I’m here when you need me.':'Voice playback unavailable. You can still type.'}</span></div><details class="crew-details"><summary>Demo & voice details</summary><p class="fineprint">Set up while parked. This demo needs the app open; continuous hands-free follow-ups and screen-locked use are not connected. Microphone recordings go to OpenAI for transcription when you finish speaking. Recordings are not saved by this demo. Microphone permission is requested when you tap to talk.</p><button id="preview-voice" class="secondary" ${responseMode==='text'?'disabled':''}>Try the voice</button><p class="fineprint">Demo accounts and sales · Oct 6, 2026. Prepared replies, no live AI or CRM connection. <a href="#news">News sources & dates</a>.</p></details></div>`;}
function renderMessages(){return messages.map((m,i)=>`<div class="message ${m.role}"><small>${m.role==='user'?'You':'QuickHits'}${m.account?' · '+esc(ACCOUNTS.find(a=>a.id===m.account)?.name||''):''}</small>${esc(m.text)}${m.role==='assistant'?`<div class="email-message-action"><button class="secondary" data-review-email="${i}">Review as email →</button></div>`:''}</div>`).join('');}
function audioStatus(text){const el=document.getElementById('audio-status');if(el)el.textContent=text;const bar=document.getElementById('persistent-audio'),status=document.getElementById('persistent-audio-status');if(bar&&status){status.textContent=text;bar.hidden=!/Speaking|Starting|One sec|unavailable|failed|Could not play/.test(text);}}
function stopAudio(){if(typeof macVoiceCleanup==='function')macVoiceCleanup();speechSequence++;if(hasSpeech())window.speechSynthesis.cancel();utterance=null;audioStatus('Audio stopped.');}
function speak(text){if(isMacDesktop())return speakMac(text);if(!hasSpeech()){audioStatus('Voice playback is unavailable. Read the reply below.');return;}stopListening();stopAudio();const seq=speechSequence;utterance=new SpeechSynthesisUtterance(spokenCopy(text));utterance.lang='en-US';utterance.rate=0.95;utterance.pitch=1.03;const voice=friendlyVoice();if(voice)utterance.voice=voice;audioStatus('Starting voice playback…');utterance.onstart=()=>{if(seq===speechSequence)audioStatus('Speaking · '+(voice?voice.name:'device voice'));};utterance.onend=()=>{if(seq===speechSequence)audioStatus('Reply complete. Ask a follow-up or replay.');};utterance.onerror=()=>{if(seq===speechSequence)audioStatus('Could not play audio. Your text reply is available below.');};try{window.speechSynthesis.resume();window.speechSynthesis.speak(utterance);}catch{audioStatus('Voice playback failed. Your text reply is available below.');}}
function send(q){if(!q.trim())return;stopListening();stopAudio();const reply=answer(q.trim());messages.push({role:'user',text:q.trim(),account:selectedAccount},{role:'assistant',text:reply,account:selectedAccount});render();if(responseMode==='voice')speak('Demo briefing. '+reply);else audioStatus('Quiet mode · reply ready.');}
function voiceStatus(text){const el=document.getElementById(document.getElementById('email-dialog')?.open?'email-voice-status':document.getElementById('note-dialog')?.open?'note-voice-status':'voice-status');if(el)el.textContent=text;}
function stopListening(){if(recognizer){const old=recognizer;recognizer=null;old.onresult=null;old.onend=null;old.onerror=null;try{old.abort();}catch{}}listening=false;const b=document.getElementById('speak-question');if(b)b.innerHTML=icon('mic')+' Tap to talk';}
function startListening(){if(listening){stopListening();voiceStatus('Listening stopped.');return;}const Recognition=window.SpeechRecognition||window.webkitSpeechRecognition;if(!Recognition){voiceStatus('Voice input is not available in this browser. Type your question or use keyboard dictation.');return;}stopAudio();const r=new Recognition();recognizer=r;listening=true;r.lang='en-US';r.interimResults=false;r.continuous=false;voiceStatus('Starting microphone…');r.onstart=()=>{voiceStatus('Go ahead. I’m listening…');const b=document.getElementById('speak-question');if(b)b.textContent='Stop listening';};r.onresult=e=>{const transcript=e.results[0][0].transcript;stopListening();send(transcript);};r.onerror=e=>{stopListening();voiceStatus(({ 'not-allowed':'Microphone access was not granted. You can still type a question.','no-speech':'No speech detected. Try again while parked, or type your question.','network':'The browser speech service is unavailable. Type your question instead.','audio-capture':'No microphone is available. Type your question instead.'})[e.error]||'Voice input stopped. Type a question or try again.');};r.onend=()=>{if(recognizer===r){stopListening();voiceStatus('Listening ended. Type a question or try again.');}};try{r.start();}catch{stopListening();voiceStatus('Voice input could not start. Type your question instead.');}}
document.addEventListener('click',e=>{if(e.target.closest('#preview-voice'))speak('Morning, Harry. Let’s get you ready for your next visit. I’ve got the account context, the latest market updates, and the follow-ups worth remembering. Just ask when you need a quick rundown.');if(e.target.closest('#speak-question'))startListening();if(e.target.closest('#replay-reply')){const last=[...messages].reverse().find(m=>m.role==='assistant');if(last)speak('Demo briefing. '+last.text);else audioStatus('Ask a question or get an account briefing first.');}if(e.target.closest('#stop-audio')){stopListening();stopAudio();voiceStatus('Microphone is off.');}});
document.addEventListener('change',e=>{if(e.target.id==='brief-account'){stopListening();stopAudio();selectedAccount=e.target.value;messages=[];render();}if(e.target.name==='reply-mode'){responseMode=e.target.value;stopListening();stopAudio();try{localStorage.setItem('quickhits-reply-mode',responseMode)}catch{}render();}});
window.addEventListener('hashchange',()=>{stopListening();});
window.addEventListener('pagehide',()=>{stopListening();stopAudio();});
// Prefer higher-quality English voices exposed by this browser, with a device fallback.
// Keep the established Windows/iPhone path; macOS needs voice readiness and queue recovery.
function isMacDesktop(){return /Macintosh|MacIntel/.test(navigator.userAgent+' '+navigator.platform)&&!(navigator.maxTouchPoints>1);}
let macVoiceCleanup=()=>{};
function speakMac(text){
 if(!hasSpeech()){audioStatus('Voice playback is unavailable. Your text reply is ready.');return;}
 stopListening();stopAudio();const seq=speechSequence,synth=window.speechSynthesis;
 let timer,readyTimer,attempt=0,current=null,started=false,finished=false;
 const valid=()=>seq===speechSequence&&!finished;
 const cleanup=()=>{clearTimeout(timer);clearTimeout(readyTimer);synth.removeEventListener?.('voiceschanged',ready);};
 macVoiceCleanup=cleanup;
 const fail=message=>{if(!valid())return;finished=true;cleanup();audioStatus(message);};
 const launch=()=>{
  if(!valid())return;cleanup();started=false;
  const voices=synth.getVoices().filter(v=>/^en(?:[-_]|$)/i.test(v.lang));
  const local=voices.filter(v=>v.localService!==false);
  const ranked=[...local].sort((a,b)=>(Number(b.default)-Number(a.default))||Number(/^en[-_]US$/i.test(b.lang))-Number(/^en[-_]US$/i.test(a.lang)));
  const voice=ranked[attempt]|| (attempt?null:voices.find(v=>v.default)||voices[0]);
  const u=new SpeechSynthesisUtterance(spokenCopy(text));current=u;utterance=u;
  u.lang=voice?.lang||'en-US';if(voice)u.voice=voice;u.volume=1;u.rate=.95;u.pitch=1;
  const retry=()=>{if(!valid()||current!==u)return;cleanup();if(attempt++===0){u.onstart=u.onend=u.onerror=null;synth.cancel();timer=setTimeout(launch,180);}else fail('Could not start audio. Tap Listen again. If it stays silent, check this browser’s sound permission and your Mac’s audio output.');};
  u.onstart=()=>{if(!valid()||current!==u)return;started=true;clearTimeout(timer);audioStatus('Speaking · '+(voice?.name||'Mac default voice'));};
  u.onend=()=>{if(!valid()||current!==u)return;if(!started){retry();return;}finished=true;cleanup();audioStatus('Reply complete. Ask a follow-up or replay.');};
  u.onerror=e=>{if(!valid()||current!==u)return;if(e.error==='not-allowed'){fail('Could not play audio automatically. Tap Listen again to start sound.');return;}if(started){fail('Audio playback stopped. Tap Listen again to replay.');return;}retry();};
  timer=setTimeout(retry,3000);
  try{synth.resume();synth.speak(u);}catch{retry();}
 };
 const ready=()=>{if(!valid()||!synth.getVoices().length)return;cleanup();timer=setTimeout(launch,100);};
 audioStatus('Starting voice playback…');
 // Let macOS finish cancelling its previous queue before creating the next utterance.
 if(synth.getVoices().length)timer=setTimeout(launch,100);
 else{synth.addEventListener?.('voiceschanged',ready);readyTimer=setTimeout(launch,1500);}
}
function friendlyVoice(){
 const voices=window.speechSynthesis.getVoices().filter(v=>/^en[-_]/i.test(v.lang));
 const score=v=>(/zira|aria|jenny|ava|emma|samantha|susan|hazel|victoria|karen|moira|tessa|fiona|serena|allison|salli|joanna|kendra|kimberly|michelle|ana|libby|sonia|natasha/i.test(v.name)?200:0)+(/^en[-_]US$/i.test(v.lang)?20:0)+(/natural|neural|online/i.test(v.name)?60:0)+(/google us english/i.test(v.name)?25:0)+(v.default?2:0);
 return voices.sort((a,b)=>score(b)-score(a))[0];
}
function spokenCopy(text){
 // Speech has its own presentation; the original reply stays intact for reading/copy/email.
 const cleaned=String(text||'').replace(/\r\n?/g,'\n')
  .replace(/\b(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2})(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:?\d{2})?)?\b/g,(_,year,month,day)=>{const date=new Date(Date.UTC(Number(year),Number(month)-1,Number(day)));return date.getUTCFullYear()===Number(year)&&date.getUTCMonth()===Number(month)-1&&date.getUTCDate()===Number(day)?date.toLocaleDateString('en-US',{month:'long',day:'numeric',timeZone:'UTC'}):'';})
  .replace(/```[\s\S]*?```/g,'')
  .replace(/!\[[^\]]*\]\([^)]*\)/g,'')
  .replace(/\[([^\]]+)\]\((?:https?:\/\/|#)[^)]*\)/g,(_,label)=>/^(?:source|read more|view source|link|\d+)$/i.test(label.trim())?'':label)
  .replace(/https?:\/\/[^\s<>]+|www\.[^\s<>]+/gi,'')
  .replace(/\uE200[^\uE201]*\uE201|\uE202[^\uE201]*\uE201/g,'')
  .replace(/\[(?:\d+(?:\s*[,–-]\s*\d+)*|source[^\]]*|citation[^\]]*|\^[^\]]+)\]/gi,'')
  .replace(/&#(x[0-9a-f]+|[0-9]+);/gi,(_,n)=>{const code=n[0].toLowerCase()==='x'?parseInt(n.slice(1),16):Number(n);return code<=0x10ffff?String.fromCodePoint(code):'';})
  .replace(/<[^>]*>/g,'')
  .replace(/\*\*|__|`/g,'');
 let inSources=false;const lines=[];
 for(const raw of cleaned.split('\n')){
  const heading=/^\s*#{1,6}\s+/.test(raw);
  const line=raw.replace(/^\s*(?:#{1,6}\s+|[-*+•]\s+|\d+[.)]\s+)/,'').trim();
  if(/^(?:sources?|citations?|references?|source notes?|sources used|data sources?|reporting period|data provenance|technical details|retrieved sources|reporting metadata)\s*(?::|$)/i.test(line)){inSources=true;continue;}
  if(inSources){if(heading)inSources=false;else continue;}
  if(/^(?:published|retrieved|accessed|source url|record id|account_id|sample_data|dataset|source period)\s*:/i.test(line))continue;
  if(!line||/^[-|: _*]+$/.test(line))continue;
  const natural=line.replace(/\b(?:sources?|citations?|references?|source period|reporting metadata)\s*:[\s\S]*$/i,'').replace(/\((?:source|citation|ref(?:erence)?)\s*:[^)]*\)/gi,'')
   .replace(/(^|\s)#[\p{L}\p{N}_]+/gu,'$1')
   .replace(/\*([^*]+)\*/g,'$1').replace(/\s*[|]\s*/g,', ')
   .replace(/&amp;/g,' and ').replace(/&nbsp;/g,' ').replace(/&quot;/g,'"')
   .replace(/\bfollow[\s_–—-]*ups\b/gi,'follow up tasks').replace(/\bfollow[\s_–—-]*up\b/gi,'follow up')
   .replace(/\b(?:account_updates|meeting_notes|contacts_demo|field_reports)\b/gi,m=>m.replace(/_/g,' '))
   .replace(/→/g,' to ').replace(/\s+[—–]\s+/g,', ')
   .replace(/\p{Extended_Pictographic}[\uFE0F\u200D]*/gu,'')
   .replace(/[:]{2,}|[{}<>]|[=_]{2,}/g,' ')
   .replace(/(?<!\d):(?!\d)/g,', ')
   .replace(/\(\s*\)|\[\s*\]/g,'').replace(/\s+/g,' ').trim();
  if(natural)lines.push(/[.!?:;]$/.test(natural)?natural:natural+'.');
 }
 return lines.join(' ').replace(/\s+([,.;:!?])/g,'$1').replace(/,\s*\./g,'.').trim();
}

if(hasSpeech())window.speechSynthesis.getVoices();

render();

// Gmail compose handoff: no message is sent or marked sent by QuickHits.
function extractEmailDraft(text){
 let body=(text||'').replace(/\r\n/g,'\n').trim();
 const subject=body.match(/^\s*(?:\*\*)?Subject:(?:\*\*)?\s*(.+)$/im);
 const title=subject?subject[1].replace(/\*\*$/,'').trim():'';
 // Prefer an explicitly separated email block; leave ordinary prose untouched.
 const blocks=body.split(/^\s*(?:---+|\*\*\*+|\x60\x60\x60(?:text|email)?)\s*$/im);
 const emailBlock=blocks.find(b=>/^\s*(?:#{1,3}\s*)?(?:\*\*)?(?:Hi|Hey|Hello|Dear)\b[^\n]*[,!:]\s*$/im.test(b));
 if(emailBlock)body=emailBlock.trim();
 body=body.replace(/^\s*(?:\*\*)?Subject:(?:\*\*)?\s*.+$/im,'').trim();
 const greeting=body.search(/^\s*(?:\*\*)?(?:Hi|Hey|Hello|Dear)\b[^\n]*[,!:](?:\*\*)?\s*$/im);
 if(greeting>=0)body=body.slice(greeting).trim();
 else body=body.replace(/^(?:(?:Sure|Absolutely|Of course|Yep)[^\n]*\n+|(?:Here(?:’|')s|Here is)[^\n]*(?:draft|email)[^\n]*\n+)/i,'').trim();
 // Remove only assistant-style offers separated from the draft by a blank line.
 body=body.replace(/\n\s*\n(?:Want (?:me to|it |this |a |an )|Would you like (?:me to|a |an |this |it )|Let me know if you(?:’|')d like (?:me to|a |an )|I can (?:also |make |adjust |rewrite |shorten ))[\s\S]*$/i,'').trim();
 body=body.replace(/^\s*(?:---+|\x60\x60\x60(?:text|email)?)\s*$/gim,'').trim();
 return {subject:title,body};
}

function accountEmail(id){
 try{const saved=JSON.parse(localStorage.getItem('quickhits-contact-emails-v1')||'{}');if(typeof saved[id]==='string')return saved[id];}catch{}
 return ACCOUNTS.find(a=>a.id===id)?.email||'';
}
function contactEmailEditor(a){return `<form data-contact-email="${a.id}" class="contact-email-editor"><label>Contact email<input name="contact-email" type="email" maxlength="254" value="${esc(accountEmail(a.id))}" placeholder="Add the buyer’s email"></label><button class="secondary" type="submit">Save email</button><p class="fineprint" role="status">Saved on this browser. Used to fill email drafts automatically.</p></form>`;}
function saveAccountEmail(id,email){
 if(!ACCOUNTS.some(a=>a.id===id))return false;
 try{const saved=JSON.parse(localStorage.getItem('quickhits-contact-emails-v1')||'{}');saved[id]=email;localStorage.setItem('quickhits-contact-emails-v1',JSON.stringify(saved));return true;}catch{return false;}
}
document.addEventListener('submit',e=>{
 const form=e.target.closest('[data-contact-email]');if(!form)return;e.preventDefault();
 const saved=saveAccountEmail(form.dataset.contactEmail,form.elements['contact-email'].value.trim());
 form.querySelector('[role="status"]').textContent=saved?'Saved. Email drafts will use this address.':'Could not save in this browser.';
});

let emailAttachmentFiles=[];
function openEmailDraft(message){
 stopListening();stopAudio();
 const account=ACCOUNTS.find(a=>a.id===(message?.account||selectedAccount));
 document.getElementById('email-account-context').textContent=(account?.name||'Account')+' · '+(account?.contact||'Contact')+(accountEmail(account?.id)?' · Saved contact email':' · No email saved yet. Add it below and save it for next time.');
 document.getElementById('save-recipient').hidden=false;
 document.getElementById('email-form').dataset.account=account?.id||'';
 document.getElementById('email-to').value=accountEmail(account?.id);
 emailAttachmentFiles=[];renderEmailFiles();
 const draft=extractEmailDraft(message?.text||'');
 document.getElementById('email-subject').value=draft.subject||'A quick hello from Harry — Betty’s Eddies';
 document.getElementById('email-body').value=draft.body;
 document.getElementById('email-status').textContent='Nothing has been sent. Check names, facts, and any demo information before sharing.';
 document.getElementById('email-voice-status').textContent='Dictate to add to your message, then review before sending. Voice uses your OpenAI connection.';
 document.getElementById('email-dialog').showModal();
}
document.addEventListener('click',async e=>{
 const review=e.target.closest('[data-review-email]');
 if(review)openEmailDraft(messages[Number(review.dataset.reviewEmail)]);
 if(e.target.closest('[data-new-email]'))openEmailDraft([...messages].reverse().find(m=>m.role==='assistant'&&m.account===selectedAccount));
 if(e.target.closest('#save-recipient')){
  const input=document.getElementById('email-to');if(!input.reportValidity())return;
  const saved=saveAccountEmail(document.getElementById('email-form').dataset.account,input.value.trim());
  document.getElementById('email-status').textContent=saved?'Contact email saved. Future drafts for this account will fill it in automatically.':'Could not save the contact email in this browser.';
 }
 if(e.target.closest('#close-email'))document.getElementById('email-dialog').close();
 if(e.target.closest('#copy-email')){
  const text='Subject: '+document.getElementById('email-subject').value+'\n\n'+document.getElementById('email-body').value;
  try{await navigator.clipboard.writeText(text);document.getElementById('email-status').textContent='Copied. You can paste this into Gmail.';}catch{document.getElementById('email-status').textContent='Copy unavailable. Select and copy the text above.';}
 }
});
document.getElementById('email-form').addEventListener('submit',e=>{
 e.preventDefault();
 stopListening();
 const params=new URLSearchParams({view:'cm',fs:'1',to:document.getElementById('email-to').value.trim(),su:document.getElementById('email-subject').value.trim(),body:document.getElementById('email-body').value});
 const url='https://mail.google.com/mail/?'+params.toString();
 if(url.length>7500){document.getElementById('email-status').textContent='This draft is too long for a reliable Gmail link. Use Copy email, then paste it into Gmail.';return;}
 const mobile=/iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
 if(mobile){
  const appParams=new URLSearchParams({to:params.get('to'),subject:params.get('su'),body:params.get('body')});
  const status=document.getElementById('email-status');status.textContent='Open your reviewed draft:';
  const choices=document.createElement('div');choices.className='cc-actions';
  const add=(label,href)=>{const a=document.createElement('a');a.className='secondary';a.textContent=label;a.href=href;choices.append(a);};
  if(/iPhone|iPad|iPod/i.test(navigator.userAgent))add('Open Gmail app','googlegmail:///co?'+appParams.toString());
  add('Open Gmail web',url);add('Open mail app','mailto:'+encodeURIComponent(params.get('to'))+'?'+new URLSearchParams({subject:params.get('su'),body:params.get('body')}).toString());
  status.append(choices);return;
 }
 window.open(url,'_blank','noopener,noreferrer');
 document.getElementById('email-status').textContent=(emailAttachmentFiles.length?'Attach these '+emailAttachmentFiles.length+' selected files using Gmail’s paperclip before sending: '+emailAttachmentFiles.map(f=>f.name).join(', ')+'. ':'')+'Gmail requested in a new tab. Review, then press Send there. QuickHits cannot confirm whether it was sent. If no tab opened, allow pop-ups or use Copy email.';
});

function renderEmailFiles(){
 document.getElementById('email-files').value='';
 document.getElementById('email-file-list').innerHTML=emailAttachmentFiles.map((f,i)=>`<li><span>${esc(f.name)} <small>(${(f.size/1024/1024).toFixed(2)} MB)</small></span><button type="button" class="text-button" data-download-email-file="${i}" aria-label="Download ${esc(f.name)}">Download</button><button type="button" class="text-button" data-remove-email-file="${i}" aria-label="Remove ${esc(f.name)}">Remove</button></li>`).join('');
 document.getElementById('email-file-status').textContent=emailAttachmentFiles.length?emailAttachmentFiles.length+' files selected locally. Not yet attached in Gmail.':'No files selected.';
}
document.getElementById('email-files').addEventListener('change',e=>{
 const rejected=[];for(const f of e.target.files){if(emailAttachmentFiles.some(x=>x.name===f.name&&x.size===f.size&&x.lastModified===f.lastModified))continue;if(emailAttachmentFiles.length>=10||emailAttachmentFiles.reduce((n,x)=>n+x.size,0)+f.size>20*1024*1024){rejected.push(f.name);continue;}emailAttachmentFiles.push(f);}
 renderEmailFiles();if(rejected.length)document.getElementById('email-file-status').textContent='Not added (demo file limit): '+rejected.join(', ')+'. Selected files still need attaching in Gmail.';
});
document.addEventListener('click',e=>{const b=e.target.closest('[data-remove-email-file]');if(b){emailAttachmentFiles.splice(Number(b.dataset.removeEmailFile),1);renderEmailFiles();}});

document.addEventListener('click',e=>{const b=e.target.closest('[data-download-email-file]');if(!b)return;const file=emailAttachmentFiles[Number(b.dataset.downloadEmailFile)];if(!file)return;const url=URL.createObjectURL(file),link=document.createElement('a');link.href=url;link.download=file.name;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});

document.addEventListener('click',e=>{if(e.target.closest('#persistent-stop'))stopAudio();});
