import { MaxUint256, ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();
import contracts from "./deployedContracts.js";
import { assetTokenAbi } from "./abis/assetTokenAbi.js";

if (process.argv.length != 3) {
  process.exitCode = 1;
  process.exit();
}

const dexChoice = process.argv[2];
let name;
let privateKey;

if (dexChoice == 0) {
  // avocado trader pk
  name = "Avocado";
  privateKey = process.env.AVOCADO;
} else if (dexChoice == 1) {
  // apple trader pk
  name = "Apple";
  privateKey = process.env.APPLE;
} else if (dexChoice == 2) {
  // lemon trader pk
  name = "Lemon";
  privateKey = process.env.LEMON;
} else if (dexChoice == 3) {
  // strawberry trader pk
  name = "Strawberry";
  privateKey = process.env.STRAWBERRY;
} else if (dexChoice == 4) {
  // banana trader pk
  name = "Banana";
  privateKey = process.env.BANANA;
} else {
  // tomato trader pk
  name = "Tomato";
  privateKey = process.env.TOMATO;
}

const dexAddress = contracts[100][0]["contracts"]["BasicDex" + name]["address"];
const assetAddress = contracts[100][0]["contracts"][name + "Token"]["address"];
const creditAddress = contracts[100][0]["contracts"]["SaltToken"]["address"];

const provider = new ethers.WebSocketProvider(process.env.GNOSIS_WSS);
const wallet = new ethers.Wallet(privateKey, provider);

const assetContract = new ethers.Contract(assetAddress, assetTokenAbi, wallet);

const creditContract = new ethers.Contract(
  creditAddress,
  assetTokenAbi,
  wallet
);


approveToken(assetContract, dexAddress);


setTimeout(() => {
  approveToken(creditContract, dexAddress);
}, 5000);

async function approveToken(contract, address) {
  const approve = await contract.approve(address, MaxUint256);

  approve.wait();
  console.log("Approved");
}

