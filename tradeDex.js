import { MaxUint256, ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();
import contracts from "./deployedContracts.js";
import { basicDexAbi } from "./abis/basicDexAbi.js";
import { assetTokenAbi } from "./abis/assetTokenAbi.js";

if (process.argv.length != 3) {
  process.exitCode = 1;
  process.exit();
}

// name should be fruit choice with capitalised first letter
const name = process.argv[2];

let privateKey;

if (name == "Apple") {
  // APPLE
  privateKey = process.env.APPLE;
} else if (name == "Avocado") {
  // AVOCADO
  privateKey = process.env.AVOCADO;
} else if (name == "Banana") {
  // BANANA
  privateKey = process.env.BANANA;
} else if (name == "Lemon") {
  // LEMON
  privateKey = process.env.LEMON;
} else if (name == "Strawberry") {
  // STRAWBERRY
  privateKey = process.env.STRAWBERRY;
} else if (name == "Tomato") {
  // TOMATO
  privateKey = process.env.TOMATO;
} else {
  console.log("Invalid input. Example: node tradeDex.js Apple");
  process.exit();
}

// exit if private key setup failed
if (!privateKey) {
  console.log("Private Key not found");
  process.exit();
}

const provider = new ethers.WebSocketProvider(process.env.GNOSIS_WSS);
//const provider = new ethers.AlchemyProvider("goerli", process.env.ETHEREUM_RPC);
if (!provider) {
  console.log("Provider not set up");
  process.exit();
}

const wallet = new ethers.Wallet(privateKey, provider);
console.log("Trading from:", wallet.address);

// get the dex address of target asset
const dexAddress = contracts[100][0]["contracts"]["BasicDex" + name]["address"];

// how often to make trades (in milliseconds)
const tradeFrequency = 15_000;

// Set possible trade weights & # blocks before tradeWeight changes
const tradeWeights = [0.1, 0.25, 0.5, 0.75, 0.9];
let tradeWeight = tradeWeights[Math.floor(Math.random() * tradeWeights.length)];

const tradesBeforeSwitch = 6;

// size choices of transactions
const txSizes = ["0.5", "1", "2", "4", "6"];

let count = 0;

console.log("Beginning trades");
console.log("Initial trade weight:", tradeWeight);

const assetDexContract = new ethers.Contract(dexAddress, basicDexAbi, wallet);

async function makeTx() {
  const txSize = Math.floor(Math.random() * txSizes.length);

  count++;
  console.log("Current count", count);
  if (count % tradesBeforeSwitch == 0) {
    tradeWeight = tradeWeights[Math.floor(Math.random() * tradeWeights.length)];

    count = 0;
    console.log("Changing trade strategy");
    console.log("New trade weight:", tradeWeight);
  }

  // if random is greater than the tradeWeight decimal, then buy credit tokens, else buy asset tokens
  if (Math.random() >= tradeWeight) {
    // buy credit
    try {
      await assetDexContract.assetToCredit(
        ethers.parseEther(txSizes[txSize]),
        BigInt(0)
      );
    } catch {
      console.log("Purchase Failed");
    }
  } else {
    // buy asset
    try {
      await assetDexContract.creditToAsset(
        ethers.parseEther(txSizes[txSize]),
        BigInt(0)
      );
    } catch {
      console.log("Purchase Failed");
    }
  }
}

setInterval(makeTx, tradeFrequency);
