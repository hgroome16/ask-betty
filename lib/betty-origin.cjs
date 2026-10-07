'use strict';
module.exports=origin=>!origin||[
 'https://ask-betty-pearl.vercel.app',
 'https://ask-betty-quickhits.vercel.app',
 'http://127.0.0.1:4175',
 'http://localhost:4175',
 ...(process.env.VERCEL_URL?['https://'+process.env.VERCEL_URL]:[])
].includes(origin);
