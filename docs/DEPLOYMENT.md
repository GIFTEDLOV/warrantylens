# WarrantyLens — verified deployment

- Network: Studionet, chain 61999; RPC `https://studio.genlayer.com/api`.
- Address: [0xebe45565311A00A148e4469dF38aC6aB73eFdb89](https://explorer-studio.genlayer.com/address/0xebe45565311A00A148e4469dF38aC6aB73eFdb89)
- Deployment transaction: `0xdec81ac6002f203d10cfd407ef10bba6fef98582e4e3c293bdc65dab93fff718`.
- Deployed source SHA-256: `229570fe0e8f1dda49fd30611853d19909adb03a41164646d47a4a1cfb6c308e`. Source file: `contracts/warrantylens.py`.
- CLI deployment and installed-source parity both passed [run 39238219709](https://github.com/GIFTEDLOV/driftproof/actions/runs/39238219709).
- Complete successful live qualification: [run 39240970537](https://github.com/GIFTEDLOV/driftproof/actions/runs/39240970537) with case `GNEW-warrantylens-39240970537`. Every write included GenVM execution success and matching canonical state, not just FINALIZED status.
- No redeployment or source mutation is authorized or needed for documentation.
