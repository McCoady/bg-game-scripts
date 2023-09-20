import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();

const avocado = process.env.AVOCADO_TRADER;
const banana = process.env.BANANA_TRADER;
const tomato = process.env.TOMATO_TRADER;

const provider = new ethers.JsonRpcProvider(process.env.ETHEREUM_RPC);
const aWallet = new ethers.Wallet(avocado, provider);
const bWallet = new ethers.Wallet(banana, provider);
const tWallet = new ethers.Wallet(tomato, provider);

async function getAddress(wallet) {
    console.log("Wallet Addr", wallet.address);
}

getAddress(aWallet);
getAddress(bWallet);
getAddress(tWallet);
