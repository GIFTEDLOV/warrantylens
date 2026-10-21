# WarrantyLens — GenLayer Portal Submission Information

**Project name:** WarrantyLens

**One line:** Independent, challengeable warranty coverage adjudication from frozen purchase terms and evidence attested by an agreed wallet.

## Project description

Independent, challengeable warranty coverage adjudication from frozen purchase terms and evidence attested by an agreed wallet. The trust problem is: Warranty disputes hinge on interpreting product coverage, alleged defects and exclusions against a written warranty; unilateral rejection can lack a reviewable audit trail.

**Why GenLayer:** Leader and validators independently classify defect_matches_coverage, excluded_cause_proven and evidence_sufficient as strict booleans. Frozen contract logic derives COVERED, NOT_COVERED or REVIEW_REQUIRED; disputes enter a second round. A deterministic state machine enforces immutable terms, actor separation, evidence digests, bounded data and deadlines. Both parties can challenge once; the second consensus round incorporates the challenges. No unbounded natural-language output changes on-chain powers or funds.

## Technical links

- GitHub: https://github.com/GIFTEDLOV/warrantylens
- Deployment: https://explorer-studio.genlayer.com/address/0xebe45565311A00A148e4469dF38aC6aB73eFdb89
- App: Standalone Intelligent Contract (no frontend required).
- Network: 61999 Studionet
- Source SHA-256: `229570fe0e8f1dda49fd30611853d19909adb03a41164646d47a4a1cfb6c308e`
- Demonstration case: `GNEW-warrantylens-39240970537`, FINALIZED / REVIEW_REQUIRED; two party challenges; historical GenVM receipts in `evidence/live-lifecycle.json`.
- Live E2E Audit: Verified and reproducible via `node tests/test_live_e2e.mjs`.

## Reviewer steps

1. Open deployed contract on the Studionet explorer and inspect source.
2. Compare installed source to `contracts/warrantylens.py` using `scripts/verify-live.mjs` or `node tests/test_live_e2e.mjs`.
3. Read canonical case `GNEW-warrantylens-39240970537`, inspect round 2, two challenges and terminal REVIEW_REQUIRED.
4. Compare every transaction in `evidence/live-lifecycle.json` to its GenVM receipt and canonical state.
5. This is a standalone contract; on-chain interaction and E2E verification are automated via the test suite.

**Limits:** An agreed attestor-wallet signature confirms wallet control, not actual manufacturer identity, defect authenticity or physical examination. No automatic replacement, refund, escrow or payment. Synthetic qualification evidence is not a real claim.

**Portal submission status:** PREPARED_READY_FOR_PORTAL. Verified against Studionet chain 61999.
