import { createWalletClient, createPublicClient, getContract, http, encodeAbiParameters, parseEther, formatEther, getAddress } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { gnosis } from "viem/chains";
import dotenv from "dotenv";
dotenv.config();
import contracts from "../deployedContracts";
import { basicDexAbi } from "../abis/basicDexAbi.js";
import fs from "fs";
import tokensConfig from "./tokens.config.js";

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
  *   "apple" : "10",
  *   "avocado" : "4",
  *   "banana" : "8",
  *   "lemon": "15",
  *   "strawberry": "25",
  *   "tomato": "15"
  * }
  * 
  */


async function main() {
  const publicClient = createPublicClient({
    chain: gnosis,
    transport: http(),
  });

  const account = privateKeyToAccount(`0x${privateKey}`);
  
  const walletClient = createWalletClient({
    account,
    chain: gnosis,
    transport: http(process.env.GNOSIS_RPC),
  });

  const [address] = await walletClient.getAddresses();

  console.log("Trading from:", address);

  // get the dex address of target asset
  //@ts-ignore 
  const dexAddress = contracts[100][0]["contracts"]["BasicDex" + name]["address"];

  // how often to make trades (in milliseconds)
  const tradeFrequency = 15_000;

  console.log("Beginning trades");
  
  //@ts-ignore
  //const assetDexContract = new ethers.Contract(dexAddress, basicDexAbi, wallet);
  const assetDexContract = getContract({
    address: getAddress(dexAddress),
    abi: basicDexAbi,
    client: {
      public: publicClient,
      wallet: walletClient,
    }
  });

  async function makeTx() {
  // returns bigint
  const targetPrice = getTargetPrice(name.toLowerCase());
  // returns bigint
  let currentPrice: bigint;
  try {
    currentPrice = assetDexContract.read.creditInPrice([parseEther("1")]);
  } catch(e) {
    console.log("Something went wrong", e);
    return;
  }
  console.log("targetPrice", formatEther(targetPrice));
  console.log("currentPrice", formatEther(currentPrice));

  if (targetPrice < currentPrice) {
    console.log("Trading Credit to Asset");
    let priceDifference = calcPercentageDifference(targetPrice, currentPrice);
    let tradeSize = parseEther("1") * priceDifference /100n;   
    // calc slippage (allow 1%)
    let maxSlippage = await calcSlippage(tradeSize, true);
    // buy fruit
    try {
      await assetDexContract.write.creditToAsset([tradeSize, maxSlippage]);
    } catch(e) {
      console.log("Something went wrong", e);
    }

  } else {
    console.log("Trading Asset to Credit");
    let priceDifference = calcPercentageDifference(currentPrice, targetPrice);

    let tradeSize = parseEther("1") * priceDifference / 100n;
    // calc slippage
    let maxSlippage = await calcSlippage(tradeSize, false);
    // sell fruit
    try {
      await assetDexContract.write.assetToCredit([tradeSize, maxSlippage]);
    } catch(e) {
      console.log("Something went wrong", e);
    }
  }
}

// helper function to calculate maximum acceptable slippage for a trade
async function calcSlippage(amountIn: bigint, isAsset: boolean) {
  let amountOut: bigint;

  if (isAsset) {
    try {
      amountOut = await assetDexContract.read.creditInPrice(amountIn);
    } catch {
      console.log("calcSlippage Error");
    }
  } else {
    try {
      amountOut = await assetDexContract.read.assetInPrice(amountIn);
    } catch {
      console.log("calcSlippage Error");
    }
  }

  return amountOut * 99n / 100n;  
}

// helper function to parse json file and return target price for given asset
function getTargetPrice(assetName: string) {
  const data = fs.readFileSync(jsonFilepath, 'utf8');

  const jsonData = JSON.parse(data);
  console.log(jsonData);
  return parseEther(jsonData[assetName]);
}

function calcPercentageDifference(a: bigint, b: bigint) {
  // if difference > 100 { a > b }
  // if difference < 100 { a < b }
  // if difference == 100 { a == b }
  let difference = a * 100n / b;
  // Calculate the multiplier
  return 100n + difference;

}

setInterval(makeTx, tradeFrequency);
}
