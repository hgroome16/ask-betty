'use strict';
module.exports=(req,res)=>{
 res.setHeader('Cache-Control','no-store');
 if(req.method!=='POST')return res.status(405).json({error:'Use POST.'});
 if(!['http://127.0.0.1:4175','http://localhost:4175','https://ask-betty-quickhits.vercel.app'].includes(req.headers.origin))return res.status(403).json({error:'Open exports from Ask Betty.'});
 let body=req.body;if(typeof body==='string')body=Object.fromEntries(new URLSearchParams(body));
 if(typeof body?.text!=='string'||body.text.length>150000)return res.status(400).json({error:'Export content is unavailable or too long.'});
 const title=String(body.title||'Information').replace(/[^a-z0-9]+/gi,'-').slice(0,80);
 res.setHeader('Content-Type','text/plain; charset=utf-8');
 res.setHeader('Content-Disposition','attachment; filename="Bettys-Eddies-'+title+'.txt"');
 res.status(200).send(body.text);
};
