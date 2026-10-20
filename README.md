# WarrantyLens

**GenLayer Studionet (chain 61999) — intelligent contract live and qualified; dedicated repo release pending.**

Independent, challengeable warranty coverage adjudication from frozen purchase terms and evidence attested by an agreed wallet.

## Contract

- Deployed address: `0xebe45565311A00A148e4469dF38aC6aB73eFdb89`
- [Studionet explorer](https://explorer-studio.genlayer.com/address/0xebe45565311A00A148e4469dF38aC6aB73eFdb89)
- Deployed Python source SHA-256: `229570fe0e8f1dda49fd30611853d19909adb03a41164646d47a4a1cfb6c308e`
- Deployment transaction: `0xdec81ac6002f203d10cfd407ef10bba6fef98582e4e3c293bdc65dab93fff718`
- Historical live qualification: [GitHub Actions run 39240970537](https://github.com/GIFTEDLOV/driftproof/actions/runs/39240970537)
- Canonical case: `GNEW-warrantylens-39240970537`; **FINALIZED**, round 2, **REVIEW_REQUIRED**; two independent party challenges; verified GenVM execution and hash-linked history. All test source records are synthetic.

## Purpose and native GenLayer justification

Warranty disputes hinge on interpreting product coverage, alleged defects and exclusions against a written warranty; unilateral rejection can lack a reviewable audit trail.

Leader and validators independently classify defect_matches_coverage, excluded_cause_proven and evidence_sufficient as strict booleans. Frozen contract logic derives COVERED, NOT_COVERED or REVIEW_REQUIRED; disputes enter a second round. Model outputs cannot set policy, deadlines, actors, rates, or access permissions. The contract uses a separate nominated attestor wallet, canonical SHA-256 evidence binding, strict typed model responses, challenge rights and terminal finalization.

## Tests and reproducibility

Run `python -m pytest -q --import-mode=importlib tests` and `genvm-lint check contracts/warrantylens.py` with Python 3.12 and `genvm-linter` installed. `genvm-lint schema` verifies the public ABI. Live byte parity, chain identity and state readback are checked using `scripts/verify-live.mjs`. All 45 aggregate local regression tests and GitHub cloud GenVM/ABI checks have passed.

## Application

Standalone Intelligent Contract; no production web application required.

## Explicit trust limits

An agreed attestor-wallet signature confirms wallet control, not actual manufacturer identity, defect authenticity or physical examination. No automatic replacement, refund, escrow or payment. Synthetic qualification evidence is not a real claim. Stored records are public and append-only; errors and non-positive adjudications are surfaced without invented approvals.

- [Deployment provenance](docs/DEPLOYMENT.md)
- [Security review](docs/SECURITY.md)
- [Reviewer demonstration](docs/SUBMISSION.md)
- [Release gates](docs/RELEASE_GATES.md)

**Portal status:** prepared, not submitted. GitHub-independent release repository and version tag are not yet published.
