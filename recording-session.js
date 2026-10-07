// PCM recording works with both the local Windows recognizer and the hosted transcription API.
(function(root){
function encodeWav(chunks,rate,target=16000){
 const length=chunks.reduce((n,c)=>n+c.length,0),input=new Float32Array(length);let offset=0;for(const c of chunks){input.set(c,offset);offset+=c.length;}
 const count=Math.floor(length*target/rate),buffer=new ArrayBuffer(44+count*2),view=new DataView(buffer);
 const text=(at,s)=>{for(let i=0;i<s.length;i++)view.setUint8(at+i,s.charCodeAt(i));};text(0,'RIFF');view.setUint32(4,36+count*2,true);text(8,'WAVE');text(12,'fmt ');view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,1,true);view.setUint32(24,target,true);view.setUint32(28,target*2,true);view.setUint16(32,2,true);view.setUint16(34,16,true);text(36,'data');view.setUint32(40,count*2,true);
 for(let i=0;i<count;i++){const pos=i*rate/target,index=Math.floor(pos),fraction=pos-index;const sample=Math.max(-1,Math.min(1,(input[index]||0)*(1-fraction)+(input[index+1]||0)*fraction));view.setInt16(44+i*2,sample<0?sample*32768:sample*32767,true);}return buffer;
}
class QuickHitsRecorder{
 constructor(options){Object.assign(this,options);this.active=false;this.controller=new AbortController();}
 release(){clearTimeout(this.limit);this.processor?.disconnect();this.source?.disconnect();this.stream?.getTracks().forEach(t=>t.stop());this.context?.close().catch(()=>{});}
 abort(){this.active=false;this.controller.abort();this.release();this.state('idle');}
 fail(message){this.abort();this.state('error',message);}
 async start(){this.active=true;this.base=this.read().trim();this.state('starting','Connecting to your microphone…');try{
 const stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true},video:false});if(!this.active){stream.getTracks().forEach(t=>t.stop());return;}this.stream=stream;
 const Context=window.AudioContext||window.webkitAudioContext;this.context=new Context();await this.context.resume();if(!this.active){this.release();return;}
 this.chunks=[];this.rate=this.context.sampleRate;this.source=this.context.createMediaStreamSource(stream);this.processor=this.context.createScriptProcessor(4096,1,1);this.source.connect(this.processor);this.processor.connect(this.context.destination);this.recording=true;
 this.endDetector=new SpeechEndDetector();this.processor.onaudioprocess=e=>{if(!this.active||!this.recording)return;const samples=e.inputBuffer.getChannelData(0);this.chunks.push(new Float32Array(samples));let energy=0;for(const n of samples)energy+=n*n;if(this.endDetector.update(Math.sqrt(energy/samples.length),samples.length/this.rate*1000))this.stop();};
 this.state('listening','Speak now. I’ll send your question automatically when you finish.');this.limit=setTimeout(()=>this.endDetector.heard?this.stop():this.fail('I didn’t hear any speech. Tap the microphone and try again.'),30000);
 }catch(e){if(this.active)this.fail(e.name==='NotAllowedError'?'Microphone access is blocked. Allow microphone access for this page, then try again.':e.name==='NotFoundError'?'No microphone was found. Connect one and try again.':e.message||'Could not open the microphone.');}}
 stop(){if(!this.active)return;if(!this.recording){this.abort();return;}this.recording=false;this.release();this.state('thinking','Turning your question into text…');this.transcribe();}
 async transcribe(){try{const pcm=encodeWav(this.chunks,this.rate);if(pcm.byteLength<3244)throw Error('No speech captured. Please try again.');const blob=new Blob([pcm],{type:'audio/wav'});const audio=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result.split(',')[1]);r.onerror=reject;r.readAsDataURL(blob);});if(!this.active)return;
 const response=await fetch('/api/transcribe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({audio,mime:'audio/wav'}),signal:AbortSignal.any([this.controller.signal,AbortSignal.timeout(55000)])});const result=await response.json();if(!this.active)return;if(!response.ok)throw Error(result.error||'Speech recognition is unavailable.');const text=String(result.text||'').trim();if(!text)throw Error('I didn’t catch any words. Speak closer to your microphone and try again.');this.write((this.base+' '+text).trim());this.active=false;this.state('idle');this.complete(text);
 }catch(e){if(this.active)this.fail(e.message||'Could not transcribe your question.');}}
}
// Measure the room's noise floor, then end the turn after speech followed by a quiet pause.
class SpeechEndDetector{
 constructor({pauseMs=1600}={}){this.pauseMs=pauseMs;this.calibrationMs=0;this.noise=.004;this.voicedMs=0;this.quietMs=0;this.heard=false;}
 update(rms,frameMs){
  if(this.calibrationMs<250){this.noise=this.calibrationMs===0?rms:Math.min(this.noise,rms);this.calibrationMs+=frameMs;return false;}
  const threshold=Math.max(.008,this.noise*2.5);
  if(rms>threshold){this.voicedMs+=frameMs;this.quietMs=0;if(this.voicedMs>=180)this.heard=true;}
  else {this.noise=this.noise*.98+rms*.02;this.quietMs+=frameMs;if(!this.heard)this.voicedMs=0;}
  return this.heard&&this.quietMs>=this.pauseMs;
 }
}
if(typeof module!=='undefined')module.exports={QuickHitsRecorder,encodeWav,SpeechEndDetector};else {root.QuickHitsRecorder=QuickHitsRecorder;root.JBS_AUDIO={encodeWav};}
})(typeof window==='undefined'?{}:window);
