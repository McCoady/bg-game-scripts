import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();

import { assetTokenAbi } from "./abis/assetTokenAbi.js";

const tokenAddr = process.argv[2];
const burnerAddr = process.argv[3];

const privateKey = process.env.PRIVATE_KEY;
const provider = new ethers.WebSocketProvider(process.env.GNOSIS_RPC);
const wallet = new ethers.Wallet(privateKey, provider);

async function sendTokens() {
    const currentBlock = await provider.getBlockNumber();
    const walletAddr = wallet.address;

    console.log("Current Block:", currentBlock);
    console.log("Wallet Address:", walletAddr);
}

sendTokens();

