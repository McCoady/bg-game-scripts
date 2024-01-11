import { MaxUint256, ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();
import contracts from "./deployedContracts.js";
import { basicDexAbi } from "./abis/basicDexAbi.js";
import fs from "fs";
import { assetTokenAbi } from "./abis/assetTokenAbi.js";

if (process.argv.length != 3) {
  process.exitCode = 1;
  process.exit();
}

// name should be fruit choice with capitalised first letter
const name = process.argv[2];

const privateKey = process.env[name.toUpperCase()];

// exit if private key setup failed
if (!privateKey) {
  console.log("Private Key not found");
  process.exit();
}

const jsonFilepath = "./data.json";

// read json file and get corresponding price target
//
/**
  * json file format 
  * {
  *   "apple" : 10,
  *   "avocado" : 4,
  *   "banana" : 8,
  *   "lemon": 15,
  *   "strawberry": 25,
  *   "tomato": 15
  * }
  * 
  */


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

console.log("Beginning trades");

const assetDexContract = new ethers.Contract(dexAddress, basicDexAbi, wallet);

async function makeTx() {
  const targetPrice = getTargetPrice(name.toLowerCase());
  const currentPrice = await assetDexContract.creditInPrice(ethers.parseEther("1"));

  // TODO: make size vary
  // let tradeSize = txSizes[1];

  if (targetPrice > currentPrice) {
    let priceDifference = calcPercentageDifference(targetPrice, currentPrice);
    let tradeSize = ethers.parseEther("1") * priceDifference /100n;   
    // calc slippage (allow 1%)
    let maxSlippage = await calcSlippage(tradeSize, true);
    // buy fruit
    await assetDexContract.creditToAsset(tradeSize, maxSlippage);

  } else {
    let priceDifference = calcPercentageDifference(currentPrice, targetPrice);

    let tradeSize = ethers.parseEther("1") * priceDifference / 100;
    // calc slippage
    let maxSlippage = await calcSlippage(tradeSize, false);
    // sell fruit
    await assetDexContract.assetToCredit(tradeSize, maxSlippage);
  }
  // 2.2 compare prices as percentage difference?
  // 3. choose trade size based on this difference
  // 4. make trade
}

// helper function to calculate maximum acceptable slippage for a trade
async function calcSlippage(amountIn, isAsset) {
  let amountOut;

  if (isAsset) {
    amountOut = await assetDexContract.creditInPrice(amountIn);
  } else {
    amountOut = await assetDexContract.assetInPrice(amountIn);
  }

  return amountOut * 99n / 100n;  
}

// helper function to parse json file and return target price for given asset
function getTargetPrice(assetName) {
  const data = fs.readFileSync(jsonFilepath, 'utf8');

  const jsonData = JSON.parse(data);
  console.log(jsonData);
  return ethers.parseEther(jsonData[assetName]);
}

function calcPercentageDifference(a, b) {
  // if difference > 100 { a > b }
  // if difference < 100 { a < b }
  // if difference == 100 { a == b }
  let difference = a * 100n / b;
  // Calculate the multiplier
  return 100n + difference;

}

setInterval(makeTx, tradeFrequency);
