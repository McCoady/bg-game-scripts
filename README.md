# Buidl Guidl Trader Scripts

## Setup

```
    ts-node ts-scripts/batchPrep.ts
    ts-node ts-scripts/tradeDex.ts {ASSET_NAME}
```
## batchPrep.ts
Script for:
- Generating a burner wallet for each asset.
- Saves {ASSET_NAME: PRIVATE_KEY} in `wallets.json`
- Sends 200 $CREDIT, 200 $ASSET, and 2XDAI to the burner
- Max approves $CREDIT & $ASSET for trading in the asset dex

## tradeDex.ts
Script for:
- Trading an asset based on target price set in `data.json`
