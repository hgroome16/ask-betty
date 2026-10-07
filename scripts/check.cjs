'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');let count=0;
function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){if(['node_modules','.local','.git','.vercel'].includes(entry.name))continue;const file=path.join(dir,entry.name);if(entry.isDirectory())walk(file);else if(/\.(?:js|cjs)$/.test(file)){new vm.Script(fs.readFileSync(file,'utf8'),{filename:file});count++;}}}
walk(root);
const seed=require('../lib/betty-seed.json');if(seed.crm.accounts.length!==10||seed.crm.accounts.some(a=>a.state!=='MA'))throw Error('Expected ten Massachusetts accounts.');
const intent=require('../lib/betty-demo-intent.cjs');const data={...seed,current_local_date:'2026-10-06'};
for(const [question,route] of [['What is my day like today?','brief'],['Give me account updates','brief'],['What do I owe Valley Green?','followups'],['What are the news items?','news'],['Give me todays trends','market'],['Do I have meeting notes? Read them','visits'],['Who are my prospects?','prospects'],['What are my accounts?','accounts'],['What products do we have?','catalog'],['Show me brand materials','brand'],['What merch is available?','merch'],['Do I have field reports?','report'],['What are my more tools?','more']]){if(intent(data,{question})?.route!==route)throw Error('Wrong section for: '+question);}
if(!intent(data,{question:'What is my day like today?'}).text.includes('3 meetings'))throw Error('Expected three meetings on the demo day.');
const roi=require('../roi-model.js').calculate({});if(Math.abs(roi.scenarios[2].incrementalProfit-142)>1e-8)throw Error('ROI discount contribution mismatch.');
console.log('PASS: '+count+' JavaScript files; ten Massachusetts accounts; section questions; demo-day meetings.');
