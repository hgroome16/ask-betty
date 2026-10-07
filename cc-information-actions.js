'use strict';
// One narration path for every information page; written content stays unchanged.
const ccInformationRoutes=new Set(['brief','news','prospects','market','accounts','account','prep','appointment','pastnotes','followups','brand','catalog','products','visits','team','contacts','activity','report','sources','about','meetings']);
function ccInformationText(root){
 if(!root)return '';
 const copy=root.cloneNode(true);
 const report=root.querySelector('#report-draft');if(report?.value.trim()){const draft=document.createElement('p');draft.textContent=report.value;copy.append(draft);}
 copy.querySelectorAll('button,nav,.betty-masthead,.betty-home-title,form,input,textarea,select,label,script,style,svg,img,[hidden],.cc-information-actions,.cc-actions,.cc-brief-actions,.cc-brief-pager,.cc-stats,#persistent-audio,details:not([open]),.cc-source,.fineprint').forEach(e=>e.remove());
 copy.querySelectorAll('small').forEach(e=>{if(/LIT Alerts|source:|retrieved|reporting metadata/i.test(e.textContent))e.remove();});
 copy.querySelectorAll('a').forEach(a=>{if(/^https?:/i.test(a.getAttribute('href')||'')||/^(view|read|download|copy|send|email|explore|back|open|log|add)\b/i.test(a.textContent.trim()))a.remove();});
 copy.querySelectorAll('h1,h2,h3,h4,p,li,article,section,small,strong,tr').forEach(e=>e.append(document.createTextNode('\n')));
 return copy.textContent.replace(/[ \t]+/g,' ').replace(/\n\s*\n/g,'\n').trim();
}

function ccInformationActions(){
 const route=(location.hash.slice(1)||'session').split('/')[0];
 if(!ccInformationRoutes.has(route)||ccAskOverlay)return;
 const main=document.getElementById('main'),heading=main?.querySelector('h1');
 if(!heading)return;
 if(!main.querySelector('.cc-information-actions')){
  const bar=document.createElement('div');bar.className='cc-information-actions';bar.setAttribute('role','group');bar.setAttribute('aria-label','Page audio controls');
  bar.innerHTML='<button class="cc-listen-button" data-information-listen="page">Listen</button><button class="secondary" data-information-stop>Stop audio</button>';
  heading.insertAdjacentElement('afterend',bar);
 }
 main.querySelectorAll('[data-crm-prospect-email],[data-live-email],[data-owed-id]').forEach(b=>b.textContent='Email Contact');
 main.querySelectorAll('.cc-panel,.cc-owe-item,.cc-task').forEach(card=>{
  if(card.matches('a')||card.querySelector('.cc-panel,.cc-owe-item,.cc-task')||!card.querySelector('h2,h3')||card.querySelector('form'))return;
  if([...card.querySelectorAll('button')].some(b=>/^listen\b/i.test(b.textContent.trim())))return;
  let actions=card.querySelector('.cc-actions');
  if(!actions){actions=document.createElement('div');actions.className='cc-actions';card.append(actions);}
  const listen=document.createElement('button');listen.className='cc-listen-button';listen.dataset.informationListen='card';listen.textContent='Listen';listen.setAttribute('aria-label','Listen to '+card.querySelector('h2,h3').textContent.trim());actions.append(listen);
 });
 main.querySelectorAll('button').forEach(b=>{if(/^listen\b/i.test(b.textContent.trim()))b.classList.add('cc-listen-button');});
}
const ccInformationRender=render;render=function(){ccInformationRender();ccInformationActions();};
document.addEventListener('click',event=>{
 const listen=event.target.closest('[data-information-listen]');
 if(listen){
  const root=listen.dataset.informationListen==='page'?document.getElementById('main'):listen.closest('.cc-panel,.cc-owe-item,.cc-task');
  const text=ccInformationText(root);
  if(text)speak(text);else toast('There is no information to read yet.');
 }
 if(event.target.closest('[data-information-stop]'))stopAudio();
});
window.addEventListener('hashchange',()=>stopAudio());
render();
