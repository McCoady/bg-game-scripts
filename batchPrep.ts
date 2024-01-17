import { MaxUint256, ethers } from "ethers";
import { createWalletClient, createPublicClient, http, parseEther } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { gnosis } from 'viem/chains'
import { generateBurner } from "./generateBurnerAccount";
import { assetTokenAbi } from "./abis/assetTokenAbi";
//import { basicDexAbi } from "./abis/basicDexAbi";
import tokensConfig from "./tokens.config";
import { TDexInfo } from "./types/wallet";
import contracts from "./deployedContracts";
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

const publicClient = createPublicClient({
  chain: gnosis,
  transport: http()
})
// rpc and wallet
const walletClient = createWalletClient({
  account,
  chain: gnosis,
  transport: http(process.env.GNOSIS_RPC)
})

const [address] = await walletClient.getAddresses()
 
console.log(address);

// // address of credit token and contract instance
//const creditAddress = contracts[100][0]["contracts"][creditTokenName]["address"];
const creditAddress = getAddress("0x2a1367ac5f5391c02eca422afecfccec1967371d");
//const creditContract = new ethers.Contract(
//   creditAddress,
//   assetTokenAbi,
//   funderWallet
// );

// loop over tokenNames in array
// create burner wallet, store private key in .env & return wallet info 
for (let i = 0; i < tokenNames.length; i++) {
  
  // generate burner address
  const burner = await generateBurner(tokenNames[i].toUpperCase());

  // push the address, name object to the array
  addressInfo.push({ address: getAddress(burner.address), name: tokenNames[i] });

  // get token/dex addresses
  const tokenName = tokenNames[i] + "Token";
  //const tokenAddress = contracts[100][0]["contracts"][tokenName]["address"];
  const dexName = "BasicDex" + tokenNames[i];
  //const dexAddress = contracts[100][0]["contracts"][dexName]["address"];

//   const tokenContract = new ethers.Contract(
//     tokenAddress,
//     assetTokenAbi,
//     funderWallet
//   );
  const { request: creditRequest } = await publicClient.simulateContract({
    address: `0x${creditAddress}`,
    abi: assetTokenAbi,
    functionName: "transfer",
    account: address,
  });

  console.log(creditRequest);
}
  // const creditHash = await walletClient.writeContract(creditRequest);

  // const {request: assetRequest} = await publicClient.simulateContract({
  //   address: `0x${tokenAddress}`,
  //   abi: assetTokenAbi,
  //   functionName: "transfer",
  //   account: address,
  //   args: [burner.address, parseEther("200")]
  // });

  // const assetHash = await walletClient.writeContract(assetRequest);

//   // send burner CREDIT + ASSET tokenNames
//   const transferCred = await creditContract.transfer(burner.address, ethers.parseEther("200"));
//   transferCred.wait();
//   const transferAsset = await tokenContract.transfer(burner.address, ethers.parseEther("200"));
//   transferAsset.wait();
//   // send burner xDAI
//   const transferXDai = await funderWallet.sendTransaction({
//     to: burner.address,
//     value: ethers.parseEther("0.01"),
//     type: 2,
//     nonce: await funderWallet.getNonce(),
//   });
//   transferXDai.wait();

//   const burnerWallet = new ethers.Wallet(burner.privateKey, provider);
//   const burnerCreditContract = new ethers.Contract(
//     creditAddress,
//     assetTokenAbi,
//     burnerWallet
//   );

//   const burnerTokenContract = new ethers.Contract(
//     tokenAddress,
//     assetTokenAbi,
//     burnerWallet
//   );

//   const approveCred = await burnerCreditContract.approve(dexAddress, MaxUint256);
//   approveCred.wait();
//   const approveAsset = await burnerTokenContract.approve(dexAddress, MaxUint256);
//   approveAsset.wait();
// }


// const addresses = { addresses: addressInfo };
// const jsonAddressInfo = JSON.stringify(addresses);

// fs.writeFile("./wallets.json", jsonAddressInfo, "utf8", function (err) {
//   if (err) {
//     return console.log(err);
//   }

//   console.log("The file was saved!");
// });
