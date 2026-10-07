'use strict';
module.exports=(req,res)=>{res.setHeader('Cache-Control','no-store');return res.status(200).json({connected:false,transcriptionConnected:!!process.env.OPENAI_API_KEY});};
