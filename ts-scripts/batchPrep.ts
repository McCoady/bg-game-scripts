import { createWalletClient, createPublicClient, getAddress, http, parseEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { gnosis } from "viem/chains";
import { generateBurner } from "./generateBurnerAccount";
import { assetTokenAbi } from "../abis/assetTokenAbi";
//import { basicDexAbi } from "./abis/basicDexAbi";
import tokensConfig from "../tokens.config";
import { TDexInfo } from "../types/wallet";
import contracts from "../deployedContracts";
import * as fs from "fs";
import dotenv from "dotenv";
dotenv.config();

// array of all token names
const tokenNames = tokensConfig.map((token) => token.name);
console.log(tokenNames);

const creditTokenName = "SaltToken";

// array the token name, address objects will be stored
let addressInfo: TDexInfo[] = [];

// private key of address that will disperse the tokenNames
const deployerPk = process.env.DEPLOYER_PRIVATE_KEY;
const account = privateKeyToAccount(`0x${deployerPk}`);

async function main() {
  const publicClient = createPublicClient({
    chain: gnosis,
    transport: http(),
  });
  // rpc and wallet
  const walletClient = createWalletClient({
    account,
    chain: gnosis,
    transport: http(process.env.GNOSIS_RPC),
  });

  const [address] = await walletClient.getAddresses();
  let currentNonce = await publicClient.getTransactionCount({
    address
  });

  console.log(address);

  // // address of credit token and contract instance
  //@ts-ignore
  const creditAddress = contracts[100][0]["contracts"][creditTokenName]["address"];


  // loop over tokenNames in array
  // create burner wallet, store private key in .env & return wallet info
  for (let i = 0; i < tokenNames.length; i++) {
    // generate burner address
    const burner = await generateBurner(tokenNames[i].toUpperCase());

    // push the address, name object to the array
    addressInfo.push({
      address: getAddress(burner.address),
      name: tokenNames[i],
    });

    // get token/dex addresses
    const tokenName = tokenNames[i] + "Token" as string;
    //@ts-ignore
    const tokenAddress = contracts[100][0]["contracts"][tokenName]["address"];
    //const tokenAddress = getAddress("0x");
    const dexName = "BasicDex" + tokenNames[i];
    //@ts-ignore
    const dexAddress = contracts[100][0]["contracts"][dexName]["address"];

    const { request: creditRequest } = await publicClient.simulateContract({
      address: getAddress(creditAddress),
      abi: assetTokenAbi,
      functionName: "transfer",
      args: [burner.address, parseEther("200")],
      account: address,
      nonce: currentNonce++,
    });

    console.log(creditRequest);

    const creditHash = await walletClient.writeContract(creditRequest);

    console.log("Credit token transfer hash", creditHash);

    const {request: assetRequest} = await publicClient.simulateContract({
      address: getAddress(tokenAddress),
      abi: assetTokenAbi,
      functionName: "transfer",
      account: address,
      args: [burner.address, parseEther("200")],
      nonce: currentNonce++,
    });

    const assetHash = await walletClient.writeContract(assetRequest);

    console.log("Asset token transfer hash", assetHash);
    // Send xDAI
    walletClient.sendTransaction({
      to: getAddress(burner.address),
      value: parseEther("2"),
      nonce: currentNonce++,
    });
    // approve Dexes
  
  }

  // write addresses to wallets.json file
  const addresses = { addresses: addressInfo };
  const jsonAddressInfo = JSON.stringify(addresses);

  fs.writeFile("./wallets.json", jsonAddressInfo, "utf8", function (err) {
    if (err) {
     return console.log(err);
    }

    console.log("The file was saved!");
  });
}

main();
