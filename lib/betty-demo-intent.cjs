'use strict';
const normalize=s=>String(s||'').toLowerCase().replace(/[’']/g,'').replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim();
module.exports=(state,body)=>{
 const q=normalize(body.question);
 const accounts=state.crm.accounts;
 const named=accounts.filter(a=>{const full=normalize(a.name),short=full.replace(/\b(wellness|dispensary|cannabis|collective)\b/g,'').trim();return q.includes(full)||(short&&new RegExp('\\b'+short+'\\b').test(q));});
 if(named.length>1)return {text:'Which account should I check first?',accountId:null};
 const account=named[0]||(/this account|current account|their|them/.test(q)?accounts.find(a=>a.name===body.accountName):null);
 const name=id=>accounts.find(a=>a.id===id)?.name||'Account';
 const scoped=rows=>rows.filter(r=>!account||r.account_id===account.id);
 const localDate=state.current_local_date||new Intl.DateTimeFormat('en-CA',{timeZone:'America/New_York'}).format(new Date());
 const day=d=>String(d||'').slice(0,10);
 const clock=d=>new Date(d).toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit',timeZone:'America/New_York'});
 const result=(route,text)=>({route,text,accountId:account?.id||null});
 if(/meeting prep|prepare.*meeting|prep.*appointment/.test(q)){const rows=scoped(state.crm.meetings||[]).filter(m=>!/(cancel|completed)/i.test(m.status)).sort((a,b)=>a.date.localeCompare(b.date));return result(account?'prep/'+account.id:'brief',rows.length?rows.slice(0,3).map(m=>name(m.account_id)+', '+day(m.date)+' at '+clock(m.date)+'. '+m.objective+'. '+m.prep).join('\n\n'):'No scheduled meeting preparation is recorded.');}
 if(/meeting notes|past conversations|saved notes|any notes|read.*notes/.test(q)){
  const rows=scoped(state.crm.meeting_notes||[]).sort((a,b)=>String(b.date).localeCompare(String(a.date)));
  return result('visits',rows.length?'You have '+rows.length+' saved meeting notes.\n'+rows.map(n=>name(n.account_id)+', '+day(n.date)+': '+n.text).join('\n\n'):'You have no saved meeting notes'+(account?' for '+account.name:'')+'.');
 }
 if(/field reports|activity reports/.test(q)){const rows=scoped(state.crm.field_reports||[]);return result('report',rows.length?rows.map(n=>name(n.account_id)+': '+(n.text||n.summary||n.content||'Saved field report')).join('\n\n'):'You have no saved field reports yet. You can draft or dictate one here.');}
 if(/account updates|accounts.*attention|needs? attention|what.*changed|updates.*account/.test(q)){
  const rows=scoped(state.crm.account_updates||[]).sort((a,b)=>String(b.date).localeCompare(String(a.date)));
  return result('brief',rows.length?'Accounts with updates:\n'+rows.map(u=>name(u.account_id)+': '+u.title+'. '+u.summary+' Next step: '+u.next_action).join('\n\n'):'No account updates are recorded.');
 }
 if(/prospect|buyers|new business/.test(q)){const rows=scoped(state.crm.prospects||[]);return result('prospects',rows.length?'Start with these buyers:\n'+rows.map(p=>p.name+', '+p.city+', Massachusetts. '+p.contact+', '+p.role+'. '+p.reason+' Next action: '+p.next_action).join('\n\n'):'No prospects are recorded for this account.');}
 if(/news|news items|headlines/.test(q)){const rows=[...(state.news||[])].sort((a,b)=>b.published_at.localeCompare(a.published_at)).slice(0,5);return result('news','Here are the latest saved news items:\n'+rows.map(n=>n.headline+', '+day(n.published_at)+'. '+n.summary+'\n'+n.source_url).join('\n\n'));}
 if(/my day|day like|today s agenda|today.*schedule|schedule.*today|daily brief|appointments|my meetings|meetings.*today|who.*meeting|what.*meetings/.test(q)){
  const rows=scoped(state.crm.meetings||[]).filter(m=>!/(cancel|completed)/i.test(m.status)&&day(m.date)===localDate).sort((a,b)=>a.date.localeCompare(b.date));
  const tasks=scoped(state.crm.follow_ups||[]).filter(t=>t.status!=='completed'&&day(t.due)<=localDate);
  return result('brief',(rows.length?'You have '+rows.length+' meetings today:\n'+rows.map(m=>clock(m.date)+', '+name(m.account_id)+'. '+m.objective).join('\n'):'You have no meetings scheduled for today.')+'\n\n'+tasks.length+' open commitments are due today or overdue. '+(state.crm.account_updates||[]).length+' account updates and '+(state.news||[]).length+' saved news items are available in your Daily Brief.');
 }
 if(/top\s*(10|ten)|best sell|selling|what s moving|whats moving|trends|market snaps|sales movement/.test(q)){
  const rows=state.product_movement||[];
  return result('market',rows.length?'Top product movement for '+state.period.start+' through '+state.period.end+' (estimated demo units):\n'+[...rows].sort((a,b)=>b.est_units-a.est_units).slice(0,10).map((p,i)=>(i+1)+'. '+p.name+': '+p.est_units+' estimated units.').join('\n'):'Fruit chews lead recorded movement with '+state.totals.estimated_units+' estimated units for '+state.period.start+' through '+state.period.end+'. Individual product sales are not recorded, so I cannot rank ten products from these records.');
 }
 if(/my accounts|which accounts|list.*accounts/.test(q)&&!/owe|follow up|followup|commitment/.test(q))return result('accounts','Your Massachusetts accounts:\n'+accounts.map(a=>a.name+', '+a.city+'. '+a.status+'. Buyer: '+a.contact+'. Next step: '+a.next_action).join('\n\n'));
 if(/merch|apparel|accessories/.test(q))return result('merch','The merch collection includes Betty’s apparel and accessories. Choose an item here to view its photo, copy the details, download the image, or prepare an email draft.');
 if(/brand|brand materials|sales materials/.test(q))return result('brand','Betty’s Eddies is known for handcrafted fruit chews made with full-spectrum cannabis and real organic fruits. Your brand page has imagery and materials for retailer conversations, plus the merch collection.');
 if(/more tools|support|help.*tools/.test(q))return result('more','More tools brings together activity reports, account tools, support and administration. Choose the tool you need here.');
 if(/products|portfolio|assortment/.test(q)&&!account)return result('catalog','Your Betty’s product portfolio includes:\n'+state.content.filter(p=>p.category==='Brand'&&p.content).slice(0,12).map(p=>p.title+'. '+p.content).join('\n\n'));
 if(account&&!/\b(owe|oh|o)\b|follow up|followup|commitment|promis/.test(q))return result('account/'+account.id,account.name+', '+account.city+', Massachusetts. '+account.background+' Buyer: '+account.contact+'. Next step: '+account.next_action);
 if(!/\b(owe|oh|o)\b|follow up|followup|commitment|promis/.test(q))return null;
 const rows=state.crm.follow_ups.filter(t=>t.status!=='completed'&&(!account||t.account_id===account.id));
 const date=d=>new Date(day(d)+'T12:00:00Z').toLocaleDateString('en-US',{month:'long',day:'numeric',timeZone:'America/New_York'});
 const text=rows.length?(account?'Here’s what you owe '+account.name+':\n':'Here are your open commitments:\n')+rows.map(t=>{const a=accounts.find(a=>a.id===t.account_id);return (account?'':a.name+': ')+t.action+'. Due '+date(t.due)+'.'+(t.context?' '+t.context:'');}).join('\n'):'You have no open commitments'+(account?' for '+account.name:'')+'.';
 return result('followups',text);
};
