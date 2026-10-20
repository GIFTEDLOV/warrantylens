import {createClient} from 'genlayer-js';
import {studionet} from 'genlayer-js/chains';
import crypto from 'node:crypto';
import fs from 'node:fs';
const address='0xebe45565311A00A148e4469dF38aC6aB73eFdb89', id='GNEW-warrantylens-39240970537';
const expected='229570fe0e8f1dda49fd30611853d19909adb03a41164646d47a4a1cfb6c308e';
const source=fs.readFileSync('contracts/warrantylens.py');
if(crypto.createHash('sha256').update(source).digest('hex')!==expected)throw Error('Source modified');
async function rpc(method,params){const r=await fetch('https://studio.genlayer.com/api',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',method,params,id:1})});const j=await r.json();if(!r.ok||j.error)throw Error('RPC '+JSON.stringify(j.error||r.status));return j.result}
if(parseInt(await rpc('eth_chainId',[]),16)!==61999)throw Error('Incorrect Studionet chain');
const actual=crypto.createHash('sha256').update(Buffer.from(await rpc('gen_getContractCode',[address]),'base64')).digest('hex');
if(actual!==expected)throw Error('Installed byte parity failure');
const r=createClient({chain:studionet});const payload=await r.readContract({address,functionName:'get_case',args:[id]});const c=typeof payload==='string'?JSON.parse(payload):payload;
if(c.status!=='FINALIZED'||c.round!==2||c.result!=='REVIEW_REQUIRED'||c.challenges?.length!==2)throw Error('Canonical case qualification mismatch');
console.log(JSON.stringify({name:'WarrantyLens',status:'PASS',address,sourceSha256:actual,case:id,terminalStatus:c.status,verdict:c.result,round:c.round,challenges:c.challenges.length}));
