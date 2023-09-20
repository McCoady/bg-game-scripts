import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();

const privateKey = process.env.PRIVATE_KEY;
const provider = new ethers.JsonRpcProvider(process.env.ETHEREUM_RPC);
const wallet = new ethers.Wallet(privateKey, provider);

async function testSetup() {
    const currentBlock = await provider.getBlockNumber();
    const walletAddr = wallet.address;

    console.log("Current Block:", currentBlock);
    console.log("Wallet Address:", walletAddr);
}

testSetup();

