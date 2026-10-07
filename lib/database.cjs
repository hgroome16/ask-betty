'use strict';
const {Client}=require('pg'),fs=require('fs'),path=require('path');
async function connection(){const url=new URL(process.env.POSTGRES_URL_NON_POOLING||process.env.POSTGRES_URL);for(const key of ['sslmode','sslcert','sslkey','sslrootcert'])url.searchParams.delete(key);const db=new Client({connectionString:url.href,ssl:{rejectUnauthorized:true,ca:fs.readFileSync(path.join(__dirname,'supabase-ca.crt'),'utf8')},connectionTimeoutMillis:10000});await db.connect();return db;}
module.exports={connection};
