import { createWalletClient, createPublicClient, getContract, http, encodeAbiParameters, parseEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { gnosis } from "viem/chains";
import { generateBurner } from "./generateBurnerAccount";
import { batchPrepAbi} from "../batchPrepAbi";
import tokensConfig from "../tokens.config";
import { TDexInfo } from "../types/wallet";
import contracts from "../deployedContracts";
import * as fs from "fs";
import dotenv from "dotenv";
import { getAddress } from "viem";
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
  
  console.log(address);
  // // address of credit token and contract instance
  //@ts-ignore
  const creditAddress = contracts[100][0]["contracts"][creditTokenName]["address"];
  console.log("Cred Addr", creditAddress);

  const assetsInfo: `0x${string}`[][] = [];

  // loop over tokenNames in array
  // create burner wallet, store private key in .env & return wallet info
  for (let i = 0; i < tokenNames.length; i++) {
    
    // TODO: get around rate limiting/nonce reuse
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
    console.log("Token Addr", tokenAddress);
    const dexName = "BasicDex" + tokenNames[i];
    //@ts-ignore
    const dexAddress = contracts[100][0]["contracts"][dexName]["address"]; 
    console.log("Dex Addr", dexAddress);
//    const assetInfo = encodeAbiParameters(
//      [
//        { name: "asset", type: "address" },
//        { name: "assetDex", type: "address" },
//        { name: "burner", type: "address" }
//      ],
//      [getAddress(tokenAddress), getAddress(dexAddress), getAddress(burner.address)],
//    )
    const assetInfo = [getAddress(tokenAddress), getAddress(dexAddress), getAddress(burner.address)];

    assetsInfo.push(assetInfo); 
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
  //@ts-ignore
  //const prepAddress = contracts[100][0]["contracts"]["BatchSetupBurners"]["address"];
  const prepAddress = "0x2464F9F6A1756eF5C0694D80c8c7dA690CA8FAA8";
  const prepContract = getContract({
    address: getAddress(prepAddress),
    abi: batchPrepAbi,
    client: {
      public: publicClient,
      wallet: walletClient,
    }
  });
  console.log(assetsInfo);

  const hash = await prepContract.write.batchSetup([getAddress(creditAddress), assetsInfo, parseEther("10"), parseEther("0.01")]);
  
}

main();

