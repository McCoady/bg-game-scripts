import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();

import { basicDexAbi } from "../abis/basicDexAbi.js";

// avocado Dex Address 0x507c3dDCE464a82CE778d2DDC2F9e0d0CDe593dd
// banana Dex Address 0x95b2D174597Ab53d523b87F8E612e462495099EA
// tomato Dex Address 0x592c38071e9206FBcb56358690b28e598467f5C1

//   salt Address 0x1A778F645439b4DA23C6b0463EF160b16171A36B
//   avocado Address 0xF93c664aD1f264A9A1fc65750ecCA19EF0EbB943
//   banana Address 0x5daAF5F0b5363E2d199F2A7842253412046a21c8
//   tomato Address 0xFc7072b9d8c8941014f2047B42A9662ecaefA357

// make more wallets for signing

if (process.argv.length != 3) {
  process.exitCode = 1;
  process.exit();
}
// get address of dex to trade from args
const assetDexAddress = process.argv[2];

// how often to make trades (in milliseconds)
const tradeFrequency = 10_000;

const privateKey = process.env.PRIVATE_KEY;
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

const assetDexContract = new ethers.Contract(
  assetDexAddress,
  basicDexAbi,
  wallet
);

async function makeTx() {
  const currentPrice = ethers.formatEther(await assetDexContract.assetInPrice(ethers.parseEther("1")));
  console.log("Current Price:", currentPrice);
  //process.exit();

  if (currentPrice > 1) {
    // buy credit
    const tx = await assetDexContract.assetToCredit(
      ethers.parseEther("2"),
      BigInt(0)
    );
    tx.wait();
    console.log("Credit purchase complete");
  } else {
    // buy asset
    const tx = await assetDexContract.creditToAsset(
      ethers.parseEther("2"),
      BigInt(0)
    );
    tx.wait();
    console.log("Asset purchase complete");
  }
}

setInterval(makeTx, tradeFrequency);
