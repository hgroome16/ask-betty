'use strict';
// Conversation content remains in memory; sample records are explicitly separate.
const ccAdminSamples=[
 {rep:'Harry',topic:'Preparation',question:"What's on my schedule today?",answer:'Review your account meetings, check the latest account changes, and prepare the next steps before each visit.'},
 {rep:'Harry',topic:'Preparation',question:'What should I discuss at my next account meeting?',answer:'Start with the last conversation, confirm open commitments, and bring the product information the buyer requested.'},
 {rep:'Sturgill',topic:'Products',question:"What's the best-selling product in New York?",answer:'Check the latest approved product-level sales report before recommending a top seller. Brand-level totals alone do not establish a product ranking.'},
 {rep:'Sturgill',topic:'Products',question:'Which product materials should I bring to a buyer?',answer:'Bring the relevant sell sheets and product details, then confirm availability and pricing with the approved source.'},
 {rep:'Bonnie',topic:'Competition',question:'Who are my competitors?',answer:'Review the approved competitor sources and compare current positioning without assuming unverified pricing or inventory.'},
 {rep:'Bonnie',topic:'Follow-up',question:'What do I owe my accounts?',answer:'Review open commitments, identify the next action for each account, and prepare a follow-up message.'}
].map((r,i)=>({...r,id:'sample-'+i,sample:true}));
const ccAdminSession=[];
let ccAdminDataMode='sample',ccAdminSearch='';
function ccAdminTopic(q){return /compet/i.test(q)?'Competition':/product|sell|catalog|price/i.test(q)?'Products':/owe|follow|commit/i.test(q)?'Follow-up':/news/i.test(q)?'News':'Preparation';}
const ccAdminEventBase=ccEvent;
ccEvent=function(type,ids=[]){
 ccAdminEventBase(type,ids);
 if(type!=='question')return;
 const answer=ccAskHistory.at(-1),question=ccAskHistory.at(-2);
 if(question?.role==='user'&&answer?.role==='assistant')ccAdminSession.push({id:'session-'+ccAdminSession.length,rep:'Current browser session',question:question.content,answer:answer.content,topic:ccAdminTopic(question.content),at:new Date().toISOString(),sample:false});
};
function ccAdminRows(){return ccAdminDataMode==='sample'?ccAdminSamples:ccAdminSession;}
function ccAdminRoute(view,filter=''){return '#admin/'+view+(filter?'/'+encodeURIComponent(filter):'');}
function ccAdminModeControl(){return '<div class="cc-admin-mode" role="group" aria-label="Conversation data"><button class="secondary" data-admin-mode="sample" aria-pressed="'+(ccAdminDataMode==='sample')+'">Sample conversations</button><button class="secondary" data-admin-mode="session" aria-pressed="'+(ccAdminDataMode==='session')+'">This session ('+ccAdminSession.length+')</button></div><p class="cc-admin-context">'+(ccAdminDataMode==='sample'?'Sample data · Illustrative questions and answers, not recorded rep activity.':'Actual questions and answers from this browser tab since this page was loaded. Not saved after reload; rep identity is not authenticated.')+'</p>';}
function ccAdminMetricCards(){
 const rows=ccAdminRows(),reps=new Set(rows.map(r=>r.rep)).size,topics=new Set(rows.map(r=>r.topic)).size;
 return '<div class="cc-kpis">'+[['Active Reps',reps,'reps'],['Questions Asked',rows.length,'conversations'],['Answers',rows.filter(r=>r.answer).length,'conversations'],['Key Insights',topics,'insights']].map(([label,n,view])=>'<a class="cc-panel cc-metric-link" href="'+ccAdminRoute(view)+'"><h2>'+label+'</h2><b>'+n+'</b><span>View details</span></a>').join('')+'</div>';
}
function ccAdminInsights(){
 const rows=ccAdminRows(),topics=[...new Set(rows.map(r=>r.topic))];
 const copy={Preparation:'These example questions suggest reps value a fast pre-meeting summary. Keep schedules, account changes and talking points together.',Products:'These examples point to demand for clearer product guidance. Prioritize current sell sheets and verified product-level sales information.',Competition:'This example highlights interest in competitive positioning. Keep approved competitor references current.', 'Follow-up':'This example highlights the value of a clear commitment list and easy email preparation.'};
 return '<div class="cc-admin-columns">'+(topics.map(topic=>{const count=rows.filter(r=>r.topic===topic).length;return ccPanel(topic,'<p>'+count+' '+(count===1?'question':'questions')+'</p><p>'+esc(ccAdminDataMode==='sample'?copy[topic]||'Example topic for review.':'Questions mentioning this topic appeared in this session. Review the answers before drawing broader conclusions.')+'</p><a href="'+ccAdminRoute('conversations','topic:'+topic)+'">View supporting conversations</a>');}).join('')||ccPanel('No insights yet','<p>Ask QuickHits a question to begin. Session topics are grouped by keywords, not a measure of rep performance.</p>'))+'</div>';
}
function ccAdminConversations(filter=''){
 let rows=ccAdminRows();
 if(filter.startsWith('topic:'))rows=rows.filter(r=>r.topic===filter.slice(6));
 if(filter.startsWith('rep:'))rows=rows.filter(r=>r.rep===filter.slice(4));
 const query=ccAdminSearch.trim().toLowerCase();
 if(query)rows=rows.filter(r=>(r.question+' '+r.answer+' '+r.rep).toLowerCase().includes(query));
 return '<p><a href="#admin/insights">Key Insights</a> · <a href="#admin/reps">Browse reps</a></p>'+
 (filter?'<p>Showing '+esc(filter.replace(':',': '))+' · <a href="#admin/conversations">Clear topic / rep filter</a></p>':'')+
 '<form id="cc-admin-search"><label for="cc-admin-query">Search questions and answers</label><div class="cc-admin-search-row"><input id="cc-admin-query" value="'+esc(ccAdminSearch)+'" maxlength="200"><button class="primary">Search</button><button class="secondary" type="button" data-admin-clear>Clear</button></div></form><p>'+rows.length+' matching conversations</p>'+
 rows.map(r=>'<details class="cc-panel cc-conversation"><summary>'+esc(r.question)+'</summary><p class="cc-record-meta">'+esc(r.rep)+' · '+esc(r.topic)+(r.sample?' · Sample conversation':' · '+esc(new Date(r.at).toLocaleString()))+'</p><h3>QuickHits answer</h3><p class="cc-conversation-answer">'+esc(r.answer)+'</p><a href="'+ccAdminRoute('insights')+'">Explore Key Insights</a></details>').join('')+
 (!rows.length?ccPanel('No matching conversations', '<p>'+(ccAdminRows().length?'Try another search or clear the filter.':'Ask QuickHits in the rep experience, then return here. Earlier activity counts do not contain question text.')+'</p>'):'');
}
function ccAdminReps(){const rows=ccAdminRows();return '<div class="cc-admin-columns">'+[...new Set(rows.map(r=>r.rep))].map(rep=>ccPanel(esc(rep),'<p>'+rows.filter(r=>r.rep===rep).length+' questions</p><a href="'+ccAdminRoute('conversations','rep:'+rep)+'">View conversations</a>')).join('')+'</div>'+(!rows.length?'<p>No active session conversations yet.</p>':'');}
const ccAdminExperienceBase=ccAdmin;
ccAdmin=function(view='dashboard'){
 if(!['dashboard','analytics','conversations','insights','reps'].includes(view))return ccAdminExperienceBase(view);
 let filter='';try{filter=decodeURIComponent(location.hash.split('/').slice(2).join('/'));}catch{}
 const title={dashboard:'Betty’s Eddies Client Dashboard',analytics:'Usage & Insights',conversations:'Conversations',insights:'Key Insights',reps:'Active Reps'}[view];
 const nav=[...CC_ADMIN_NAV];nav.splice(nav.findIndex(r=>r[0]==='conversations')+1,0,['insights','Key Insights'],['reps','Active Reps']);
 const body=view==='conversations'?ccAdminConversations(filter):view==='reps'?ccAdminReps():view==='insights'?'<p>Follow each insight back to the questions behind it.</p>'+ccAdminInsights():ccAdminMetricCards()+'<h2>Key Insights</h2>'+ccAdminInsights()+ccPanel('Recent questions',ccAdminRows().slice(-3).reverse().map(r=>'<p><a href="'+ccAdminRoute('conversations','rep:'+r.rep)+'">'+esc(r.question)+'</a></p>').join('')||'<p>No questions in this session yet.</p>');
 return '<div class="cc-admin-layout"><aside class="cc-admin-sidebar">'+ccLogo()+'<details class="cc-admin-menu" open><summary>Admin navigation</summary><nav>'+nav.map(([r,t])=>'<a href="#admin/'+r+'" '+(r===view?'aria-current="page"':'')+'>'+t+'</a>').join('')+'</nav></details><a href="#home">Back to rep experience</a></aside><div class="cc-admin-main"><a href="#home">Back to rep experience</a><h1>'+title+'</h1>'+ccAdminModeControl()+body+'</div></div>';
};
document.addEventListener('click',e=>{
 const mode=e.target.closest('[data-admin-mode]');
 if(mode){ccAdminDataMode=mode.dataset.adminMode;ccAdminSearch='';render();}
 if(e.target.closest('[data-admin-clear]')){ccAdminSearch='';render();}
});
document.addEventListener('submit',e=>{if(e.target.id!=='cc-admin-search')return;e.preventDefault();ccAdminSearch=document.getElementById('cc-admin-query').value;render();document.getElementById('cc-admin-query')?.focus();});
render();


// Keep the same navigation and shared Ask pipeline available on every admin page.
const ccAdminNavigationBase=ccAdmin;
ccAdmin=function(view='dashboard'){
 const toolbar='<nav class="cc-admin-toolbar" aria-label="Client dashboard navigation"><button class="secondary" data-admin-back>Back</button><button class="secondary cc-admin-ask" data-global-ask aria-label="Ask QuickHits" title="Ask QuickHits">'+icon('mic')+'</button><a class="secondary" href="#admin/dashboard">Dashboard</a><a class="cc-admin-rep-link" href="#home">Rep home</a></nav>';
 return ccAdminNavigationBase(view).replace('<div class="cc-admin-main">','<div class="cc-admin-main">'+toolbar).replace('<a href="#home">Back to rep experience</a><h1>','<h1>');
};
let ccAdminPreviousRoute='#admin/dashboard',ccAdminCurrentRoute=location.hash;
window.addEventListener('hashchange',()=>{
 if(ccAdminCurrentRoute.startsWith('#admin'))ccAdminPreviousRoute=ccAdminCurrentRoute;
 ccAdminCurrentRoute=location.hash;
});
document.addEventListener('click',e=>{
 const toolbar=e.target.closest('.cc-admin-toolbar');
 if(!toolbar||e.target.closest('[data-global-ask]'))return;
 if(e.target.closest('a,[data-admin-back]')){
  ccStopAskPlayback();
  document.getElementById('cc-global-ask')?.close();
 }
 if(e.target.closest('[data-admin-back]')){
  e.preventDefault();
  const fallback=location.hash==='#admin/dashboard'||location.hash==='#admin'?'#home':'#admin/dashboard';
  location.hash=ccAdminPreviousRoute!==location.hash?ccAdminPreviousRoute:fallback;
 }
},true);
render();
