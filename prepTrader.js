import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();

import { assetTokenAbi } from "./abis/assetTokenAbi.js";

// avocado wallet: 0x8dd2Ed4B1dfEfB7ec22E1b1364cB177968701885
// banance wallet: 0x71F3f9aF53EFF113c3d3601e7E44f5A1E3c23Ba0
// tomato wallet: 0xa9240957dea34357b9CD73f1cffc7329eFee92C9

const traderPrivateKey = process.argv[2];
const tokenAddress = process.argv[3];
const dexAddress = process.argv[4];
const saltAddress = "0x2A1367AC5F5391C02eca422aFECfCcEC1967371D";

const provider = new ethers.WebSocketProvider(process.env.GNOSIS);
//const provider = new ethers.AlchemyProvider("goerli", process.env.ETHEREUM_RPC);
if (!provider) {
  console.log("Provider not set up");
  process.exit();
}

const wallet = new ethers.Wallet(traderPrivateKey, provider);

const tokenContract = new ethers.Contract(
    tokenAddress,
    assetTokenAbi,
    wallet
);

const saltContract = new ethers.Contract(
    saltAddress,
    assetTokenAbi,
    wallet
);

const assetTx = await tokenContract.approve(dexAddress, ethers.MaxUint256);
assetTx.wait();
console.log("Asset token approved");
const saltTx = await saltContract.approve(dexAddress, ethers.MaxUint256);
saltTx.wait();
console.log("Salt token approved");
