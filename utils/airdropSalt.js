import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();

import { assetTokenAbi } from "../abis/assetTokenAbi.js";

if (process.argv.length != 3) {
    process.exitCode = 1;
    process.exit();
  }

const saltTokenAddress = "0x1A778F645439b4DA23C6b0463EF160b16171A36B";
const receiverAddress = process.argv[2];

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

const saltTokenContract = new ethers.Contract(
    saltTokenAddress,
    assetTokenAbi,
    wallet
  );
const ownerAddress = await saltTokenContract.owner();
console.log(ownerAddress);

const tx = await saltTokenContract.airdropToWallet(receiverAddress);
tx.wait();

console.log(`Salt dropped to ${receiverAddress}`);
console.log(await saltTokenContract.balanceOf(receiverAddress));