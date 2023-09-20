import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();

import { basicDexAbi } from "./abis/basicDexAbi.js";

// avocado Dex Address 0x507c3dDCE464a82CE778d2DDC2F9e0d0CDe593dd
// banana Dex Address 0x95b2D174597Ab53d523b87F8E612e462495099EA
// tomato Dex Address 0x592c38071e9206FBcb56358690b28e598467f5C1

//   salt Address 0x1A778F645439b4DA23C6b0463EF160b16171A36B
//   avocado Address 0xF93c664aD1f264A9A1fc65750ecCA19EF0EbB943
//   banana Address 0x5daAF5F0b5363E2d199F2A7842253412046a21c8
//   tomato Address 0xFc7072b9d8c8941014f2047B42A9662ecaefA357

// avocado wallet: 0x8dd2Ed4B1dfEfB7ec22E1b1364cB177968701885
// banance wallet: 0x71F3f9aF53EFF113c3d3601e7E44f5A1E3c23Ba0
// tomato wallet: 0xa9240957dea34357b9CD73f1cffc7329eFee92C9

if (process.argv.length != 3) {
  process.exitCode = 1;
  process.exit();
}

const dexChoice = process.argv[2];
let assetDexAddress;
let privateKey;

if (dexChoice == 0) {
  // avocado dex
  assetDexAddress = "0x507c3dDCE464a82CE778d2DDC2F9e0d0CDe593dd";
  // avocado trader pk
  privateKey = process.env.AVOCADO_TRADER;
} else if (dexChoice == 1) {
  // banana dex
  assetDexAddress = "0x95b2D174597Ab53d523b87F8E612e462495099EA";
  // banana trader pk
  privateKey = process.env.BANANA_TRADER;
} else {
  // tomato dex
  assetDexAddress = "0x592c38071e9206FBcb56358690b28e598467f5C1";
  // tomato trader pk
  privateKey = process.env.TOMATO_TRADER;
}

// how often to make trades (in milliseconds)
const tradeFrequency = 10_000;

// Set possible trade weights & blocks before tradeWeight changes
const tradeWeights = [0.1, 0.25, 0.5, 0.75, 0.9];
const blocksBeforeSwitch = [5, 10];
let tradeWeight = tradeWeights[Math.floor(Math.random() * tradeWeights.length)];
let switchTimer =
  blocksBeforeSwitch[Math.floor(Math.random() * blocksBeforeSwitch.length)];
const txSizes = ["0.5", "1", "2", "5", "8"];

//const privateKey = process.env.PRIVATE_KEY;
if (!privateKey) {
  console.log("Private Key not found");
  process.exit();
}
const provider = new ethers.WebSocketProvider(process.env.GNOSIS);
//const provider = new ethers.AlchemyProvider("goerli", process.env.ETHEREUM_RPC);
if (!provider) {
  console.log("Provider not set up");
  process.exit();
}

const wallet = new ethers.Wallet(privateKey, provider);

// const startBlock = await provider.getBlockNumber();
let count = 0;

console.log("Starting trades");
console.log("Initial trade weight:", tradeWeight);
console.log("Blocks til next switch:", switchTimer);
const assetDexContract = new ethers.Contract(
  assetDexAddress,
  basicDexAbi,
  wallet
);

async function makeTx() {
  const randSize = Math.floor(Math.random() * txSizes.length);
  // const currentBlock = await provider.getBlockNumber();
  count++;
  console.log("Current count", count);
  if (count % switchTimer == 0) {
    tradeWeight = tradeWeights[Math.floor(Math.random() * tradeWeights.length)];
    switchTimer =
      blocksBeforeSwitch[Math.floor(Math.random() * blocksBeforeSwitch.length)];
    count = 0;
    console.log("Changing trade strategy");
    console.log("New trade weight:", tradeWeight);
    console.log("Blocks til next switch:", switchTimer);
  }
  if (Math.random() >= tradeWeight) {
    // buy credit
    try {

      const tx = await assetDexContract.assetToCredit(
        ethers.parseEther(txSizes[randSize]),
        BigInt(0)
        );
        tx.wait();
        console.log("Credit purchase complete");
      } catch {
        console.log("Purchase Failed");
      }
  } else {
    // buy asset
    try {

      const tx = await assetDexContract.creditToAsset(
        ethers.parseEther(txSizes[randSize]),
        BigInt(0)
        );
        tx.wait();
        console.log("Asset purchase complete");
      } catch {
        console.log("Purcahse Failed");
      }
  }
}

setInterval(makeTx, tradeFrequency);
