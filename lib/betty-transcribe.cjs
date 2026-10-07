'use strict';
const bursts=new Map();
module.exports=async(req,res)=>{
 res.setHeader('Cache-Control','no-store');
 if(req.method!=='POST')return res.status(405).json({error:'Use POST.'});
 if(!req.headers.origin||!require('./betty-origin.cjs')(req.headers.origin))return res.status(403).json({error:'Open the microphone from Ask Betty.'});
 if(Number(req.headers['content-length']||0)>2800000)return res.status(413).json({error:'Recording is too long. Try a shorter question.'});
 const client=req.headers['x-real-ip']||req.socket?.remoteAddress||'unknown',now=Date.now();
 for(const [k,v] of bursts)if(v.until<now)bursts.delete(k);
 const entry=bursts.get(client)||{count:0,until:now+60000};bursts.set(client,entry);
 if(++entry.count>8){res.setHeader('Retry-After','60');return res.status(429).json({error:'Please wait a minute before recording again.'});}
 let b;try{b=typeof req.body==='string'?JSON.parse(req.body):req.body;}catch{return res.status(400).json({error:'Invalid recording.'});}
 const formats={'audio/webm':'webm','audio/mp4':'mp4','audio/ogg':'ogg','audio/wav':'wav'};
 if(!formats[b?.mime]||typeof b.audio!=='string'||b.audio.length>2700000||!b.audio.length||! /^[A-Za-z0-9+/]*={0,2}$/.test(b.audio))return res.status(400).json({error:'Invalid recording format.'});
 if(!process.env.OPENAI_API_KEY)return res.status(503).json({error:'Voice transcription is unavailable. Please type your question.'});
 try{
  const file=Buffer.from(b.audio,'base64');if(file.length<100)return res.status(400).json({error:'No audio captured. Please try again.'});
  const form=new FormData();form.append('file',new Blob([file],{type:b.mime}),'question.'+formats[b.mime]);form.append('model','gpt-4o-mini-transcribe');form.append('language','en');
  const r=await fetch('https://api.openai.com/v1/audio/transcriptions',{method:'POST',headers:{Authorization:'Bearer '+process.env.OPENAI_API_KEY},body:form,signal:AbortSignal.timeout(25000)});
  if(!r.ok)return res.status(502).json({error:'Could not transcribe your recording. Please try again.'});
  const result=await r.json();return res.status(200).json({text:String(result.text||'').trim().slice(0,2000)});
 }catch{return res.status(502).json({error:'Voice connection timed out. Please try again.'});}
};
