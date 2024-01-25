import {
  createWalletClient,
  createPublicClient,
  getAddress,
  maxUint256,
  getContract,
  http,
  parseEther,
} from "viem";
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

// array of all asset names
const assetNames = tokensConfig.map((token) => token.name);
console.log(assetNames);

// TODO: pull this from config
const creditTokenName = "SaltToken";
const tokensToSend = parseEther("1");
const xDaiToSend = parseEther("0.001");

// array the token name, address objects will be stored
let addressInfo: TDexInfo[] = [];

// private key of address that will disperse the assetNames
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
  const creditAddress =
    contracts[100][0]["contracts"][creditTokenName]["address"];

  // loop over assetNames in array
  // create burner wallet, store private key in .env & return wallet info
  for (let i = 0; i < assetNames.length; i++) {
    // generate burner address
    const burner = await generateBurner(assetNames[i].toUpperCase());

    // push the address, name object to the array
    addressInfo.push({
      address: getAddress(burner.address),
      name: assetNames[i],
    });

    // get token/dex addresses
    const assetName = (assetNames[i] + "Token") as string;
    //@ts-ignore
    const assetAddress = contracts[100][0]["contracts"][assetName]["address"];
    //const assetAddress = getAddress("0x");
    const dexName = "BasicDex" + assetNames[i];
    //@ts-ignore
    const dexAddress = contracts[100][0]["contracts"][dexName]["address"];

    const creditContract = getContract({
      address: getAddress(creditAddress),
      abi: assetTokenAbi,
      client: {
        public: publicClient,
        wallet: walletClient,
      },
    });

    const creditHash = await creditContract.write.transfer([
      burner.address,
      tokensToSend,
    ]);
    const creditTransaction = await publicClient.waitForTransactionReceipt({
      confirmations: 3,
      hash: creditHash,
    });
    console.log("Credit Transfer TX Confirmed", creditTransaction.blockNumber);

    const tokenContract = getContract({
      address: getAddress(assetAddress),
      abi: assetTokenAbi,
      client: {
        public: publicClient,
        wallet: walletClient,
      },
    });

    const tokenHash = await tokenContract.write.transfer([
      burner.address,
      tokensToSend,
    ]);
    const tokenTransaction = await publicClient.waitForTransactionReceipt({
      confirmations: 3,
      hash: tokenHash,
    });
    console.log("Token Transfer TX Confirmed", tokenTransaction.blockNumber);

    // Send xDAI
    const xDaiHash = await walletClient.sendTransaction({
      to: getAddress(burner.address),
      value: xDaiToSend,
    });

    const daiTransaction = await publicClient.waitForTransactionReceipt({
      confirmations: 3,
      hash: xDaiHash,
    });

    console.log("xDai Transfer TX Confirmed", daiTransaction.blockNumber);

    // approve Dexes

    const burnerClient = createWalletClient({
      account: burner,
      chain: gnosis,
      transport: http(process.env.GNOSIS_RPC),
    });

    const creditContractBurner = getContract({
      address: getAddress(creditAddress),
      abi: assetTokenAbi,
      client: {
        public: publicClient,
        wallet: burnerClient,
      },
    });

    const creditApproveHash = await creditContractBurner.write.approve([
      dexAddress,
      maxUint256,
    ]);

    const creditApproveTx = await publicClient.waitForTransactionReceipt({
      confirmations: 3,
      hash: creditApproveHash,
    });

    console.log("Credit Approve Tx Confirmed", creditApproveTx.blockNumber);

    const tokenContractBurner = getContract({
      address: getAddress(assetAddress),
      abi: assetTokenAbi,
      client: {
        public: publicClient,
        wallet: burnerClient,
      },
    });

    const tokenApproveHash = await tokenContractBurner.write.approve([
      dexAddress,
      maxUint256,
    ]);

    const tokenApproveTx = await publicClient.waitForTransactionReceipt({
      confirmations: 3,
      hash: tokenApproveHash,
    });

    console.log("Token Approve Tx Confirmed", tokenApproveTx.blockNumber);
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
