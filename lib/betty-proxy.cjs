'use strict';
// Keep Betty requests in this project; no dependency on the separate C&C deployment.
module.exports=op=>async(req,res)=>{
 res.setHeader('Cache-Control','no-store');
 if(req.method!==(op==='data'?'GET':'POST'))return res.status(405).json({error:'Method not allowed.'});
 if(!require('./betty-origin.cjs')(req.headers.origin))return res.status(403).json({error:'Open this from Ask Betty.'});
 if(Number(req.headers['content-length']||0)>(op==='transcribe'?2800000:40000))return res.status(413).json({error:'Request too large.'});
 let payload;try{payload=op==='data'?{disabledSources:String(req.query?.exclude||'').split(',').slice(0,10)}:typeof req.body==='string'?JSON.parse(req.body):req.body;}catch{return res.status(400).json({error:'Invalid request.'});}
 req.method='POST';req.body={op,payload};return require('../api/betty-service.js')(req,res);
};
