'use strict';
function bettyNavigateRequest(question){
 const q=question.toLowerCase().replace(/[’']/g,'');
 if(typeof BettyROI!=='undefined'&&(/\broi\b|return on investment|pop.?ups?|retailer support|discount analysis|discount.*sales|how.*discount/.test(q)||(location.hash==='#roi'&&/strategy|recommend|best|margin|profit|break.even|worth|investment|click|conversion/.test(q)))&&!/\b(take me|go to|open|navigate)\b/.test(q)){bettyPresentSectionAnswer({route:'roi',text:roiSummary(BettyROI.calculate(bettyROIInputs))},question);return true;}
 if(!/\b(take me|go to|navigate|open|bring me|bring up)\b/.test(q)||/read|answer|tell me/.test(q))return false;
 const destinations=[['roi|return on investment|pop.?ups?|retailer support|discount analysis','roi'],['news|news that matters','news'],['daily brief|my brief','brief'],['what do i owe|commitments|follow.?ups','followups'],['my accounts|store map|accounts','accounts'],['prospects','prospects'],['market snaps|trends|competitive intel','market'],['products|product portfolio','catalog'],['merch','merch'],['brand','brand'],['field reports|activity reports','report'],['meeting notes','visits'],['more tools','more'],['home|quickhits|quick hits|dashboard','home']];
 const named=typeof crmMatchAccount==='function'?crmMatchAccount(q):null;
 const route=named?'account/'+named:destinations.find(([pattern])=>new RegExp(pattern).test(q))?.[1];
 if(!route)return false;
 ccStopAskPlayback();ccTranscript='';ccReply='';ccAskOverlay=false;document.getElementById('cc-global-ask')?.close();
 if(location.hash==='#'+route)render();else location.hash=route;
 return true;
}
let bettySectionAnswer=null;
function bettyPresentSectionAnswer(result,question){
 bettySectionAnswer={route:result.route,text:result.text};
 if(result.route==='brief')ccLiveBriefTab=/updates|attention|changed/i.test(question)?'updates':'meetings';
 ccBusy=false;ccTranscript='';ccAskOverlay=false;document.getElementById('cc-global-ask')?.close();
 const show=()=>{render();speak(result.text);};
 if(location.hash==='#'+result.route)show();else{window.addEventListener('hashchange',()=>setTimeout(show,0),{once:true});location.hash=result.route;}
}
const bettySectionRender=render;
render=function(){
 bettySectionRender();
 if(!bettySectionAnswer||ccAskOverlay||location.hash!=='#'+bettySectionAnswer.route)return;
 const main=document.getElementById('main');if(!main||main.querySelector('.betty-section-answer'))return;
 const panel=document.createElement('section');panel.className='cc-panel betty-section-answer';panel.setAttribute('aria-label','Betty’s answer');
 panel.innerHTML='<h2>Betty’s answer</h2><p class="cc-answer">'+esc(bettySectionAnswer.text)+'</p><div class="cc-actions"><button class="secondary" data-betty-answer-listen>Listen again</button><button class="secondary" data-information-stop>Stop audio</button><button class="secondary" data-betty-answer-copy>Copy</button><button class="secondary" data-betty-answer-email>Use in Email</button><button class="secondary" data-betty-answer-close>Dismiss</button></div>';
 main.querySelector('h1')?.insertAdjacentElement('afterend',panel);
};
document.addEventListener('click',async e=>{if(e.target.closest('[data-betty-answer-listen]'))speak(bettySectionAnswer?.text||'');if(e.target.closest('[data-betty-answer-copy]')){try{await navigator.clipboard.writeText(bettySectionAnswer?.text||'');toast('Answer copied.');}catch{revisionPanel('Copy answer','<textarea aria-label="Answer to copy" rows="8">'+esc(bettySectionAnswer?.text||'')+'</textarea>');}}if(e.target.closest('[data-betty-answer-email]'))openEmailDraft({account:ccAccount||undefined,text:bettySectionAnswer?.text||''});if(e.target.closest('[data-betty-answer-close]')){stopAudio();bettySectionAnswer=null;document.querySelector('.betty-section-answer')?.remove();}});
window.addEventListener('hashchange',()=>{if(bettySectionAnswer&&location.hash!=='#'+bettySectionAnswer.route)bettySectionAnswer=null;});
function bettyFriendlyIcon(route){
 // Display the actual approved artwork as CSS image windows; no replacement drawings.
 const crops={roi:[1166,874,42],brief:[515,815,40],news:[31,433,44],accounts:[512,693,36],prospects:[514,772,44],market:[514,859,44],catalog:[34,684,66],brand:[350,135,65],followups:[1166,912,44],report:[890,710,32],visits:[890,710,32],more:[35,588,66]};
 const [x,y,size]=crops[route]||crops.brief,scale=58/size;
 return '<span class="betty-friendly-icon betty-approved-icon" aria-hidden="true" style="background-size:'+(1448*scale)+'px '+(1086*scale)+'px;background-position:'+(-x*scale)+'px '+(-y*scale)+'px"></span>';
}
