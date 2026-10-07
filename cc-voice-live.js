'use strict';
let ccSpeechWriting=false,ccSpeechMode='idle',ccDictationTarget='';
function ccVoiceState(mode,message){
 ccSpeechMode=mode;const labels={starting:'Connecting…',idle:'TAP TO SPEAK',listening:'Listening…',thinking:'Working on it…',resolved:'Here’s What I Found',speaking:'Here’s What I Found',paused:'Paused',error:'Try again'};
 const shell=document.querySelector('.cc-voice'),mic=document.querySelector('.cc-mic'),status=document.getElementById('cc-voice-status')||document.getElementById('email-voice-status');
 if(shell)shell.dataset.state=mode;if(mic){mic.classList.toggle('listening',mode==='listening');mic.setAttribute('aria-label',mode==='listening'?'Done listening':labels[mode]);mic.disabled=mode==='thinking'||mode==='starting';}
 const title=shell?.querySelector('h1');if(title)title.textContent=labels[mode];if(status)status.textContent=mode==='error'?(message||(shell?.classList.contains('cc-voice-home')?'I couldn’t hear that. Tap the microphone to try again.':'I couldn’t hear that. Try again or type your question.')):message|| (shell?'':mode==='idle'?'':labels[mode]);
 const send=document.querySelector('#cc-question button.primary');if(send){send.disabled=mode==='thinking';send.textContent='Send';}const done=document.querySelector('[data-cc-done]');if(done)done.hidden=mode!=='listening';
 document.querySelectorAll('[data-dictate],[data-cc="note-mic"]').forEach(button=>{const target=button.dataset.dictate||'cc-note-text';if(target!==ccDictationTarget)return;const active=['starting','listening','thinking'].includes(mode);if(!button.dataset.voiceIdleLabel){button.dataset.voiceIdleLabel=button.getAttribute('aria-label')||button.textContent||'Dictate into this field';button.dataset.voiceIdleMarkup=button.innerHTML;}if(active)button.textContent=mode==='thinking'?'Transcribing…':'Stop recording';else button.innerHTML=button.dataset.voiceIdleMarkup;button.setAttribute('aria-label',active?button.textContent:button.dataset.voiceIdleLabel);button.setAttribute('aria-pressed',String(active));button.disabled=mode==='thinking';});
}
// Invoke speech on the microphone's user gesture, before the asynchronous Ask response.
function ccPrimeVoicePlayback(){if(!window.speechSynthesis)return;try{const prime=new SpeechSynthesisUtterance('Ready');prime.volume=0;window.speechSynthesis.resume();window.speechSynthesis.speak(prime);}catch{}}


ccStartDictation=async function(target){
 if(ccRecognition){const current=ccRecognition;current.stop();if(!current.active&&ccRecognition===current)ccRecognition=null;return;}
 ccDictationTarget=target;
 stopAudio();ccPrimeVoicePlayback();const Recognition=window.SpeechRecognition||window.webkitSpeechRecognition;
 let hostedTranscription=false;try{const response=await fetch('/api/voice-status',{cache:'no-store'});if(response.ok)hostedTranscription=(await response.json()).transcriptionConnected===true;}catch{}
 if(document.hidden)return;
 if(hostedTranscription||openAIState.connected||!Recognition){ccRecordedDictation(target);return;}
 const session=new QuickHitsSpeechSession({Recognition,read:()=>document.getElementById(target)?.value||'',write:text=>{const input=document.getElementById(target);if(!input){session.stop();return;}ccSpeechWriting=true;input.value=text.slice(0,input.maxLength>0?input.maxLength:10000);input.dispatchEvent(new Event('input',{bubbles:true}));ccSpeechWriting=false;},complete:()=>{if(target==='cc-input'){window.ccPlayNextReply=true;document.getElementById('cc-question')?.requestSubmit();}},state:(mode,reason)=>{if(!session.active&&ccRecognition===session)ccRecognition=null;if(mode==='error'&&['network','service-not-allowed','service-unavailable'].includes(reason)){ccRecordedDictation(target);return;}ccVoiceState(mode,mode==='error'?ccRecognitionMessage(reason):undefined);}});
 ccRecognition=session;session.start();
};
document.addEventListener('input',e=>{if(!ccSpeechWriting&&ccRecognition&&e.target.matches('textarea,input')){const typed=e.target.value;ccRecognition.abort();ccRecognition=null;e.target.value=typed;}},true);
document.addEventListener('click',e=>{if(e.target.closest('[data-cc-done]')){ccRecognition?.stop();ccRecognition=null;}},true);
function ccLeaveVoice(){window.ccPlayNextReply=false;ccRecognition?.abort();ccRecognition=null;stopAudio();}
window.addEventListener('hashchange',ccLeaveVoice);
window.addEventListener('pagehide',ccLeaveVoice);
document.addEventListener('visibilitychange',()=>{if(document.hidden)ccLeaveVoice();});
const voiceLiveBase=ccVoice;
ccVoice=function(){return voiceLiveBase().replace('<details class="cc-compose" open><summary>Ask QuickHits</summary>','<div class="cc-compose">').replace('</details>','</div>').replace('<button class="primary">Send</button>','<button class="secondary" type="button" data-cc-done hidden>Done</button><button class="primary" type="submit">Send</button>');};
const liveAudioStatus=audioStatus;
audioStatus=function(text){liveAudioStatus(text);const active=/Speaking|paused/i.test(text),bar=document.getElementById('persistent-audio');let pause=document.getElementById('cc-live-audio-pause');if(active&&bar&&!pause){pause=document.createElement('button');pause.id='cc-live-audio-pause';pause.className='secondary';bar.append(pause);pause.onclick=()=>{if(speechSynthesis.paused){speechSynthesis.resume();audioStatus('Speaking…');}else{speechSynthesis.pause();audioStatus('Paused');}};}if(pause){pause.hidden=!active;pause.textContent=/paused/i.test(text)?'Resume':'Pause';}if(bar&&active)bar.hidden=false;const shell=document.querySelector('.cc-voice');if(bar){const host=shell||document.querySelector('main');if(host&&bar.parentElement!==host)host.append(bar);}if(/Speaking/.test(text))ccVoiceState('speaking');else if(/paused/i.test(text))ccVoiceState('paused');else if(/complete|stopped/i.test(text)&&!ccBusy&&!ccRecognition&&ccSpeechMode!=='error')ccVoiceState(ccReply?'resolved':'idle');};
const ccAnswerVoiceBase=ccVoice;ccVoice=function(){let html=ccAnswerVoiceBase();if(ccReply)html=html.replace(esc(ccReply),esc(ccReply).replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>').replace(/https:\/\/[^\s<>]+/g,url=>'<a href="'+url.replace(/[).,]+$/,'')+'" target="_blank" rel="noopener">View source</a>')).replace('</section>','<div class="cc-actions"><button class="secondary" data-live-reply-email>Use in Email</button></div></section>');return html;};
document.addEventListener('click',e=>{if(e.target.closest('[data-live-reply-email]'))openEmailDraft({account:ccAccount,text:ccReply});});
render();

function ccRecognitionMessage(reason){return ({'not-allowed':'Microphone access is blocked. Allow microphone access in your browser’s site settings, then try again.','audio-capture':'No microphone audio is available. Check your selected microphone and try again.'})[reason]||'I couldn’t hear that. Tap the microphone and try again.';}
function ccRecordedDictation(target){
 if(document.hidden)return;
 if(!navigator.mediaDevices?.getUserMedia||!(window.AudioContext||window.webkitAudioContext)){ccVoiceState('error','Voice input is unavailable in this browser. Open this page in Chrome or Safari, or type your question.');return;}
 const session=new QuickHitsRecorder({read:()=>document.getElementById(target)?.value||'',write:text=>{const field=document.getElementById(target);if(!field)return;ccSpeechWriting=true;field.value=text.slice(0,field.maxLength>0?field.maxLength:10000);field.dispatchEvent(new Event('input',{bubbles:true}));ccSpeechWriting=false;},complete:()=>{if(target==='cc-input'){window.ccPlayNextReply=true;document.getElementById('cc-question')?.requestSubmit();}},state:(mode,message)=>{if(!session.active&&ccRecognition===session)ccRecognition=null;ccVoiceState(mode,message);}});
 ccRecognition=session;session.start();
}

