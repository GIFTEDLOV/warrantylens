# WarrantyLens

[![exact-source-quality](https://github.com/GIFTEDLOV/warrantylens/actions/workflows/ci.yml/badge.svg)](https://github.com/GIFTEDLOV/warrantylens/actions/workflows/ci.yml)
[![exact-release-qualification](https://github.com/GIFTEDLOV/warrantylens/actions/workflows/release.yml/badge.svg)](https://github.com/GIFTEDLOV/warrantylens/actions/workflows/release.yml)

**GenLayer Studionet (Chain ID 61999) — Standalone Intelligent Contract for Objective Retail Warranty & Coverage Adjudication.**

Independent, challengeable consumer warranty and product defect coverage adjudication from frozen purchase terms and evidence attested by an agreed independent wallet.

---

## 1. On-Chain Deployment & Bytecode Parity

- **Network**: GenLayer Studionet (Chain ID `61999`, RPC `https://studio.genlayer.com/api`)
- **Deployed Address**: [`0xebe45565311A00A148e4469dF38aC6aB73eFdb89`](https://explorer-studio.genlayer.com/address/0xebe45565311A00A148e4469dF38aC6aB73eFdb89)
- **Deployed Python Source SHA-256**: `229570fe0e8f1dda49fd30611853d19909adb03a41164646d47a4a1cfb6c308e`
- **Deployment Transaction**: `0xdec81ac6002f203d10cfd407ef10bba6fef98582e4e3c293bdc65dab93fff718`
- **Canonical Demonstration Case**: `GNEW-warrantylens-39240970537`
  - Status: `FINALIZED`
  - Rounds: `2`
  - Verdict: `REVIEW_REQUIRED`
  - Challenges: `2` (both creator and counterparty appeal slots exercised)
  - GenVM Consensus: `MAJORITY_AGREE` (9 finalized transactions in `evidence/live-lifecycle.json`)

---

## 2. Core Architecture & Native GenLayer Justification

Warranty disputes inherently hinge on interpreting product coverage, alleged defects, and written exclusion clauses against submitted repair receipts or diagnostic logs. Unilateral vendor decisions lack reviewable transparency, while deterministic smart contracts cannot comprehend natural-language policy terms.

### 4-Phase Lifecycle:
1. **Terms Sealed (`create_case` & `consent`)**: Creator records agreed warranty clauses, purchase date, coverage window, and deadline. Recipient explicitly consents before terms can be frozen.
2. **Independent Attestation (`submit_evidence` & `attest_evidence`)**: Claim documentation is locked with a SHA-256 digest. An independent third-party attestor vouches for the source record digest.
3. **Semantic Consensus (`adjudicate`)**: GenLayer leader and validators independently evaluate three strict boolean predicates via `gl.vm.run_nondet_unsafe`:
   - `defect_matches_coverage`: Does the defect fall under covered product components?
   - `excluded_cause_proven`: Is there affirmative proof of excluded misuse or external impact?
   - `evidence_sufficient`: Is the documentation complete and authentic?
4. **Challenge & Finality (`challenge` & `finalize_case`)**: Both parties hold distinct challenge slots. If challenged, a second round re-evaluates all evidence before deterministic finalization.

---

## 3. Automated Verification & Testing

### A. Run All Unit & Adversarial Tests
```bash
python -m pytest -v
```
*37/37 tests pass: includes mock GenLayer regression, adversarial red-team prompt injections, Unicode attacks, attestor spoofing, time-lock boundaries, and repository isolation.*

### B. Live End-to-End On-Chain Audit
```bash
node tests/test_live_e2e.mjs
```
*Directly connects to GenLayer Studionet RPC (61999), verifies exact source byte parity via `gen_getContractCode`, queries case pagination, asserts canonical case state (`GNEW-warrantylens-39240970537`), and validates cryptographic audit history hash links.*

### C. Secret Leak Audit
```bash
node scripts/secret_scan.mjs
```
*Scans all repository files to guarantee zero leaked private keys, API tokens, or secrets.*

---

## 4. Documentation & Portal Links

- [Portal Submission Dossier](docs/SUBMISSION.md)
- [Submission Fields (JSON)](docs/SUBMISSION_FIELDS.json)
- [Deployment Provenance](docs/DEPLOYMENT.md)
- [Security Review](docs/SECURITY.md)
- [Release Gates](docs/RELEASE_GATES.md)

---

## 5. Explicit Trust Boundaries

- **No Escrow / Custody**: WarrantyLens performs objective semantic adjudication; it does not custody tokens or trigger automated payments.
- **Attestor Attribution**: An attestor signature confirms wallet attribution, not physical hardware inspection or real-world merchant identity.
- **Append-Only State**: All case transitions and historical verdicts are permanently hash-linked on GenLayer Studionet.
