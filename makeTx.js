import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();

import { basicDexAbi } from "./abis/basicDexAbi.js";

if (process.argv.length != 6) {
  process.exitCode = 1;
  process.exit();
}

const assetDexAddress = process.argv[2];
let tradeWeight = process.argv[3];
const newWeight = process.argv[4];
const blocksBeforeSwitch = process.argv[5];

const txSizes = ["1", "2", "4", "8", "10"];

const randSize = Math.floor(Math.random() * txSizes.length);
const privateKey = process.env.PRIVATE_KEY;
if (!privateKey) {
  console.log("Private Key not found");
  process.exit();
}

const provider = new ethers.WebSocketProvider(process.env.GNOSIS);
if (!provider) {
  console.log("Provider not set up");
  process.exit();
}

console.log(provider);

const wallet = new ethers.Wallet(privateKey, provider);

const startBlock = await provider.getBlockNumber();
console.log(startBlock);
process.exit();

async function makeTx() {
  const currentBlock = await provider.getBlockNumber();
  const switchCountdown =  blocksBeforeSwitch - (currentBlock - startBlock);
  if (switchCountdown == 0) console.log("Changing trade strategy");
  if (switchCountdown < 1) {
    tradeWeight = newWeight;
  }

  console.log("Blocks til strat change: ", switchCountdown);

  const assetDexContract = new ethers.Contract(
    assetDexAddress,
    basicDexAbi,
    wallet
  );

  if (Math.random() >= tradeWeight) {
    // buy credit
    const tx = await assetDexContract.assetToCredit(
      ethers.parseEther(txSizes[randSize]),
      BigInt(0)
    );
    tx.wait();
    console.log("Credit purchase complete");
  } else {
    // buy asset
    const tx = await assetDexContract.creditToAsset(
      ethers.parseEther(txSizes[randSize]),
      BigInt(0)
    );
    tx.wait();
    console.log("Asset purchase complete");
  }
}

setInterval(makeTx, 8000);