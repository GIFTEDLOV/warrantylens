/** Actual onchain GenLayer multi-actor qualification, guarded and no blind write retries. */
import { createClient, createAccount } from 'genlayer-js';
import { studionet } from 'genlayer-js/chains';
import { TransactionStatus } from 'genlayer-js/types';
import fs from 'node:fs';
import crypto from 'node:crypto';

const root='live-proof';fs.mkdirSync(root,{recursive:true});
const A=createAccount(),B=createAccount(),I=createAccount();
const clients=[A,B,I].map(account=>createClient({chain:studionet,account}));
const reader=createClient({chain:studionet});
const decode=x=>typeof x==='string'?JSON.parse(x):x;
const digest=s=>crypto.createHash('sha256').update(s).digest('hex');
const configs={
  warrantylens:{addr:process.env.WARRANTYLENS_ADDRESS, rule:'Warranty covers defects in factory-sealed battery components during the agreed coverage window. Damage caused by external impact is excluded only when supported by evidence.',evidence:'Synthetic third-party warranty service voucher: a hardware tester observed premature battery cell failure; test record says no impact or liquid damage and contains matching serial number.',kind:'warranty'},
  milestoneproof:{addr:process.env.MILESTONEPROOF_ADDRESS,rule:'Milestone 2 accepts a functioning user dashboard with specified authentication flow, passing agreed integration tests and documented deployment. Material broken core flows prevent acceptance.',evidence:'Synthetic delivery evidence: versioned source archive and independent test results for dashboard, authentication and integration acceptance criteria. Not a real paid work contract.',kind:'milestone'}
};
const pick=x=>({status:x.status,round:x.round,result:x.result,consented:x.consented,attested:x.attested,attestor:x.attestor,challenge_count:x.challenges?.length,history_hash:x.history_hash,finalized_at:x.finalized_at,payable_minor:x.payable_minor,provisional_payable_minor:x.provisional_payable_minor});
for(const [slug,cfg] of Object.entries(configs)){
  if(!/^0x[a-f0-9]{40}$/i.test(cfg.addr||''))throw Error('Missing VERIFIED deployed address for '+slug);
  const id=`GNEW-${slug}-${process.env.GITHUB_RUN_ID||Date.now()}`;
  const r={slug,contract:cfg.addr,id,chainId:61999,sourceKind:'SYNTHETIC_TEST_ONLY',status:'STARTED',txs:[]};
  const file=`${root}/${slug}-live.json`;
  const save=()=>fs.writeFileSync(file,JSON.stringify(r,null,2)+'\n');
  const get=()=>reader.readContract({address:cfg.addr,functionName:'get_case',args:[id]}).then(decode);
  save();
  try{
    const exists=await reader.readContract({address:cfg.addr,functionName:'case_exists',args:[id]});
    if(exists!==false)throw Error('New case ID not proven absent. ABORT: '+JSON.stringify(exists));
    const now=Math.floor(Date.now()/1000);
    const args=[id,B.address,cfg.rule,now+86400];
    if(slug==='warrantylens')args.push(now-86400*7,now+86400*60);
    else args.push(250001,1,2);
    args.push(I.address);
    async function write(client,method,parameters,assertState){
      const hash=await client.writeContract({address:cfg.addr,functionName:method,args:parameters});
      const item={method,hash,phase:'BROADCAST_PENDING_FINALITY'};r.txs.push(item);save();
      const receipt=await reader.waitForTransactionReceipt({hash,status:TransactionStatus.FINALIZED,fullTransaction:false,interval:4000,retries:100});
      const leaders=(receipt.consensus_data?.leader_receipt||[]).map(x=>({result:x.execution_result,stderr:String(x.genvm_result?.stderr||'').slice(-450)}));
      const material=leaders.filter(x=>!(x.result==='ERROR'&&/validator execution cancelled after quorum/i.test(x.stderr)));
      item.phase=receipt.status_name??receipt.statusName;item.consensus=receipt.result_name;item.leaders=leaders;save();
      if(item.phase!=='FINALIZED'||!material.some(x=>x.result==='SUCCESS')||material.some(x=>x.result!=='SUCCESS'))throw Error(method+' GenVM execution failed: '+JSON.stringify({phase:item.phase,leaders}).slice(0,850));
      const state=await get();if(!assertState(state))throw Error(method+' canonical state mismatch '+JSON.stringify(pick(state)));
      item.verified=pick(state);save();return state;
    }
    await write(clients[0],'create_case',args,s=>s.status==='DRAFT'&&s.recipient.toLowerCase()===B.address.toLowerCase()&&s.attestor.toLowerCase()===I.address.toLowerCase());
    await write(clients[1],'consent',[id],s=>s.status==='DRAFT'&&s.consented===true);
    await write(clients[0],'freeze',[id],s=>s.status==='FROZEN'&&!!s.rule_hash);
    await write(clients[0],'submit_evidence',[id,cfg.evidence],s=>s.status==='EVIDENCE_LOCKED'&&s.evidence_hash===digest(cfg.evidence));
    const snapshot=await get();
    await write(clients[2],'attest_evidence',[id,snapshot.evidence_hash,`synthetic-evidence-record:${slug}:${id}`],s=>s.status==='ATTESTED'&&s.attested===true&&!!s.attestation_hash);
    await write(clients[0],'adjudicate',[id],s=>s.status==='ASSESSED'&&s.round===1);
    await write(clients[0],'challenge',[id,'Review the independent attestor identity and the described source record.'],s=>s.status==='CHALLENGED'&&s.challenges?.length===1);
    await write(clients[1],'challenge',[id,'The witness may not prove document origin; reconsider under the frozen criteria.'],s=>s.status==='CHALLENGED'&&s.challenges?.length===2);
    await new Promise(resolve=>setTimeout(resolve,11000));
    await write(clients[0],'adjudicate',[id],s=>s.status==='ASSESSED'&&s.round===2);
    await write(clients[2],'finalize_case',[id],s=>s.status==='FINALIZED'&&s.round===2&&s.finalized_at>0);
    const history=decode(await reader.readContract({address:cfg.addr,functionName:'get_history',args:[id]}));
    if(!Array.isArray(history)||history.length!==2||history[1].prev!==history[0].entry_hash)throw Error('Audit history hash-chain integrity mismatch');
    const final=await get();
    if(slug==='milestoneproof'){
      if(final.payable_minor!==final.provisional_payable_minor||final.payable_minor>final.gross_minor)throw Error('Noncustodial final milestone budget mismatch');
    }else if(final.claim_opened_at>final.warranty_end)throw Error('Warranty timing integrity mismatch');
    r.status='PASS';r.verdict=final.result;r.final=pick(final);r.historyLength=history.length;save();console.log('LIVE_QUALIFICATION_PASS='+slug+':'+final.result);
  }catch(e){r.status='BLOCKED';r.error=String(e).slice(0,1200);save();console.error('LIVE_QUALIFICATION_BLOCKED='+slug+':'+r.error);process.exitCode=1;}
}
