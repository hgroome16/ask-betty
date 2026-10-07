'use strict';
const fs=require('node:fs/promises'),os=require('node:os'),path=require('node:path'),{execFile}=require('node:child_process'),{promisify}=require('node:util');
const run=promisify(execFile);
module.exports=async(body)=>{
 if(body?.mime!=='audio/wav'||typeof body.audio!=='string'||body.audio.length>2700000||!/^[A-Za-z0-9+/]+={0,2}$/.test(body.audio))throw Error('Please retry the microphone to capture WAV audio.');
 const audio=Buffer.from(body.audio,'base64');if(audio.length<44||audio.toString('ascii',0,4)!=='RIFF'||audio.toString('ascii',8,12)!=='WAVE')throw Error('Invalid audio recording.');
 let directory;
 try{directory=await fs.mkdtemp(path.join(os.tmpdir(),'betty-voice-'));const wav=path.join(directory,'question.wav');await fs.writeFile(wav,audio);
 const script=await fs.readFile(path.join(__dirname,'recognize-wav.ps1'),'utf8');
 const {stdout}=await run('powershell.exe',['-NoProfile','-NonInteractive','-Command',script],{env:{...process.env,BETTY_AUDIO_PATH:wav},timeout:45000,windowsHide:true,maxBuffer:65536});
 const result=JSON.parse(stdout.replace(/^\uFEFF/,'').trim());return {text:String(result.text||'').slice(0,2000)};
 }catch(e){console.error('BETTY_LOCAL_SPEECH',e.code||e.name,String(e.stderr||e.message).slice(0,1500));throw Error('Local speech recognition could not finish. Your question is preserved; you can type it below.');}
 finally{if(directory&&path.dirname(directory)===os.tmpdir()&&path.basename(directory).startsWith('betty-voice-'))await fs.rm(directory,{recursive:true,force:true});}
};
