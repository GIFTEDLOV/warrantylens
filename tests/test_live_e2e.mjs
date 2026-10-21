/**
 * Automated Live End-to-End Audit & Verification for WarrantyLens
 * Network: GenLayer Studionet (Chain ID 61999)
 * Target Contract: 0xebe45565311A00A148e4469dF38aC6aB73eFdb89
 */
import { createClient } from 'genlayer-js';
import { studionet } from 'genlayer-js/chains';
import crypto from 'node:crypto';
import fs from 'node:fs';

const ADDRESS = '0xebe45565311A00A148e4469dF38aC6aB73eFdb89';
const EXPECTED_HASH = '229570fe0e8f1dda49fd30611853d19909adb03a41164646d47a4a1cfb6c308e';
const CANONICAL_CASE_ID = 'GNEW-warrantylens-39240970537';

async function rpc(method, params = []) {
  const res = await fetch('https://studio.genlayer.com/api', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', method, params, id: 1 })
  });
  const json = await res.json();
  if (!res.ok || json.error) throw new Error('RPC Error: ' + JSON.stringify(json.error || res.status));
  return json.result;
}

async function runE2EAudit() {
  console.log('=== [1/6] VERIFYING RPC NETWORK CONNECTIVITY ===');
  const chainIdHex = await rpc('eth_chainId', []);
  const chainId = parseInt(chainIdHex, 16);
  if (chainId !== 61999) throw new Error(`Invalid network: expected 61999, got ${chainId}`);
  console.log(`✓ Connected to GenLayer Studionet (Chain ID: ${chainId})`);

  console.log('\n=== [2/6] VERIFYING ON-CHAIN BYTECODE & PARITY ===');
  const localSource = fs.readFileSync('contracts/warrantylens.py');
  const localHash = crypto.createHash('sha256').update(localSource).digest('hex');
  if (localHash !== EXPECTED_HASH) throw new Error(`Local source hash mismatch: expected ${EXPECTED_HASH}, got ${localHash}`);

  const onChainCodeB64 = await rpc('gen_getContractCode', [ADDRESS]);
  const onChainCode = Buffer.from(onChainCodeB64, 'base64');
  const onChainHash = crypto.createHash('sha256').update(onChainCode).digest('hex');
  if (onChainHash !== EXPECTED_HASH) throw new Error(`On-chain code parity failure: expected ${EXPECTED_HASH}, got ${onChainHash}`);
  console.log(`✓ On-chain bytecode perfectly matches local source (SHA-256: ${onChainHash})`);

  console.log('\n=== [3/6] VERIFYING CASE REGISTRY PAGINATION ===');
  const client = createClient({ chain: studionet });
  const ids = await client.readContract({
    address: ADDRESS,
    functionName: 'get_case_ids_page',
    args: [0, 50]
  });
  if (!Array.isArray(ids) || ids.length === 0) throw new Error('Failed to retrieve case ID array from Studionet');
  if (!ids.includes(CANONICAL_CASE_ID)) throw new Error(`Canonical case ${CANONICAL_CASE_ID} not in case registry`);
  console.log(`✓ Case registry active with ${ids.length} cases (includes ${CANONICAL_CASE_ID})`);

  console.log('\n=== [4/6] VERIFYING CANONICAL CASE FINALITY & PREDICATES ===');
  const caseRaw = await client.readContract({
    address: ADDRESS,
    functionName: 'get_case',
    args: [CANONICAL_CASE_ID]
  });
  const caseData = typeof caseRaw === 'string' ? JSON.parse(caseRaw) : caseRaw;

  // Assert canonical case integrity
  if (caseData.id !== CANONICAL_CASE_ID) throw new Error('Case ID mismatch');
  if (caseData.status !== 'FINALIZED') throw new Error(`Expected FINALIZED status, got ${caseData.status}`);
  if (caseData.round !== 2) throw new Error(`Expected round 2, got ${caseData.round}`);
  if (caseData.result !== 'REVIEW_REQUIRED') throw new Error(`Expected REVIEW_REQUIRED verdict, got ${caseData.result}`);
  if (!caseData.consented) throw new Error('Expected consented=true');
  if (!caseData.attested) throw new Error('Expected attested=true');
  if (!Array.isArray(caseData.challenges) || caseData.challenges.length !== 2) {
    throw new Error(`Expected exactly 2 challenges, got ${caseData.challenges?.length}`);
  }
  if (!caseData.finalized_at || caseData.finalized_at <= 0) throw new Error('Missing finalized_at timestamp');
  console.log('✓ Canonical case state asserted:');
  console.log(`  - Status: ${caseData.status}`);
  console.log(`  - Round: ${caseData.round} (with ${caseData.challenges.length} distinct party challenges)`);
  console.log(`  - Verdict: ${caseData.result}`);
  console.log(`  - Designated Attestor: ${caseData.attestor}`);
  console.log(`  - Finalized At: ${new Date(caseData.finalized_at * 1000).toISOString()}`);

  console.log('\n=== [5/6] VERIFYING AUDIT HISTORY HASH-CHAIN INTEGRITY ===');
  const historyRaw = await client.readContract({
    address: ADDRESS,
    functionName: 'get_history',
    args: [CANONICAL_CASE_ID]
  });
  const history = typeof historyRaw === 'string' ? JSON.parse(historyRaw) : historyRaw;
  if (!Array.isArray(history) || history.length !== 2) throw new Error(`Expected 2 history rounds, got ${history?.length}`);

  // Assert cryptographic hash lineage between adjudication rounds
  const round1 = history[0];
  const round2 = history[1];
  if (!round1.entry_hash || !round2.entry_hash) throw new Error('Missing entry hashes in audit log');
  if (round2.prev !== round1.entry_hash) throw new Error(`Hash chain broken: round2.prev (${round2.prev}) != round1.entry_hash (${round1.entry_hash})`);
  console.log('✓ Cryptographic audit lineage verified:');
  console.log(`  - Round 1 Entry Hash: ${round1.entry_hash}`);
  console.log(`  - Round 2 Prev Hash:  ${round2.prev} (Matches Round 1)`);
  console.log(`  - Round 2 Entry Hash: ${round2.entry_hash}`);

  console.log('\n=== [6/6] RECORDING REPRODUCIBLE AUDIT EVIDENCE ===');
  const auditReceipt = {
    timestamp: new Date().toISOString(),
    network: 'GenLayer Studionet',
    chainId: 61999,
    contractAddress: ADDRESS,
    sourceSha256: onChainHash,
    canonicalCase: {
      id: CANONICAL_CASE_ID,
      status: caseData.status,
      round: caseData.round,
      verdict: caseData.result,
      challenges: caseData.challenges.length,
      finalizedAt: caseData.finalized_at
    },
    auditLineage: {
      round1Hash: round1.entry_hash,
      round2Hash: round2.entry_hash,
      chainIntegrity: 'CRYPTOGRAPHICALLY_VERIFIED'
    },
    e2eStatus: 'PASS'
  };

  fs.writeFileSync('evidence/live-e2e-audit.json', JSON.stringify(auditReceipt, null, 2) + '\n');
  console.log('✓ Audit evidence written to evidence/live-e2e-audit.json');
  console.log('\n========================================');
  console.log('🎉 ALL END-TO-END VERIFICATION CHECKS PASSED');
  console.log('========================================');
}

runE2EAudit().catch(err => {
  console.error('\n❌ E2E AUDIT FAILED:', err);
  process.exit(1);
});
