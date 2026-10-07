'use strict';
// Show the introduction on each app load, with no microphone prompt.
(() => {
 if(document.body.classList.contains('cc-admin')||location.hash.startsWith('#admin'))return;
 const points=[
  ['brief','Daily Brief','Hear your schedule, meeting prep, and account updates before your first stop.'],
  ['followups','What Do I Owe?','Stay on top of buyer requests, due dates, and account commitments.'],
  ['roi','Retail ROI','Compare pop-ups, support, and discounts against costs and competitor pricing with demo assumptions.'],
  ['more','Prospects','Find buyers who need attention and your next step to move the conversation forward.'],
  ['visits','Meeting Notes & Field Reports','Review notes and dictate field reports connected to your accounts.']
 ];
 const dialog=document.createElement('dialog');dialog.id='betty-welcome';dialog.className='betty-welcome';dialog.setAttribute('aria-labelledby','betty-welcome-title');dialog.setAttribute('aria-describedby','betty-welcome-intro');
 const heading='Your sales day, powered by your voice.';
 const intro='Meet Ask Betty, the easy-to-use voice-directed sales companion. Ask questions, get answers, and listen to the information you need.';
 dialog.innerHTML='<button class="betty-welcome-close" aria-label="Close welcome">×</button><div class="betty-welcome-masthead"><div class="betty-welcome-lockup">'+ccLogo().replace(/<small class="betty-territory">[\s\S]*?<\/small>/,'')+'</div><h1 id="betty-welcome-title" tabindex="-1" autofocus>'+heading+'</h1></div><p id="betty-welcome-intro">'+intro+'</p><h2 class="betty-welcome-features-title">Here are a few of the features</h2><ol class="betty-welcome-points">'+points.map(([route,title,copy])=>'<li>'+bettyFriendlyIcon(route)+'<div><h2>'+title+'</h2><p>'+copy+'</p></div></li>').join('')+'</ol><div class="betty-welcome-actions"><button class="primary" data-welcome-start>Let’s get started</button><button class="secondary" data-welcome-listen>Listen to overview</button><button class="secondary" data-welcome-stop hidden>Stop audio</button></div>';
 document.body.append(dialog);
 const previousFocus=document.activeElement;
 let playing=false;
 const stop=()=>{if(playing){stopAudio();playing=false;}dialog.querySelector('[data-welcome-stop]').hidden=true;};
 dialog.querySelector('.betty-welcome-close').onclick=()=>dialog.close();
 dialog.querySelector('[data-welcome-start]').onclick=()=>{
  dialog.close();
  const focusMic=()=>requestAnimationFrame(()=>{window.scrollTo({top:0,left:0,behavior:'instant'});document.querySelector('.cc-voice-home .cc-mic')?.focus({preventScroll:true});});
  if(location.hash==='#home')focusMic();else{window.addEventListener('hashchange',focusMic,{once:true});location.hash='home';}
 };
 dialog.querySelector('[data-welcome-listen]').onclick=()=>{playing=true;speak(heading+' '+intro+' Here are a few of the features. '+points.map(([,title,copy])=>title+'. '+copy).join(' '));dialog.querySelector('[data-welcome-stop]').hidden=false;};
 dialog.querySelector('[data-welcome-stop]').onclick=stop;
 dialog.addEventListener('close',()=>{stop();if(previousFocus?.isConnected&&previousFocus!==document.body)previousFocus.focus();else document.querySelector('.cc-mic,[data-global-ask]')?.focus();});
 dialog.showModal();
})();
