import { MaxUint256, ethers } from "ethers";
import { generateBurner } from "./generateBurnerAccount.js";
import { assetTokenAbi } from "./abis/assetTokenAbi.js";
import { basicDexAbi } from "./abis/basicDexAbi.js";
import contracts from "./deployedContracts.js";
import * as fs from "fs";
import dotenv from "dotenv";
dotenv.config();

// array of all token names
const fruits = ["Apple", "Avocado", "Banana", "Lemon", "Strawberry", "Tomato"];

// array the token name, address objects will be stored
let addressInfo = [];

// private key of address that will disperse the tokens
const privateKey = process.env.DEPLOYER_PRIVATE_KEY;

// rpc and wallet
const provider = new ethers.JsonRpcProvider(process.env.GNOSIS_RPC);
const funderWallet = new ethers.Wallet(privateKey, provider);

// address of credit token and contract instance
const creditAddress = contracts[100][0]["contracts"]["SaltToken"]["address"];
const creditContract = new ethers.Contract(
  creditAddress,
  assetTokenAbi,
  funderWallet
);

// loop over fruits in array
// create burner wallet, store private key in .env & return wallet info 
for (let i = 0; i < fruits.length; i++) {
  // generate burner address
  const burner = await generateBurner(fruits[i].toUpperCase());

  // push the address, name object to the array
  addressInfo.push({ address: burner.address, name: fruits[i] });

  // get token/dex addresses
  const tokenName = fruits[i] + "Token";
  const tokenAddress = contracts[100][0]["contracts"][tokenName]["address"];
  const dexName = "BasicDex" + fruits[i];
  const dexAddress = contracts[100][0]["contracts"][dexName]["address"];

  const tokenContract = new ethers.Contract(
    tokenAddress,
    assetTokenAbi,
    funderWallet
  );

  // send burner CREDIT + ASSET tokens
  const transferCred = await creditContract.transfer(burner.address, ethers.parseEther("200"));
  transferCred.wait();
  const transferAsset = await tokenContract.transfer(burner.address, ethers.parseEther("200"));
  transferAsset.wait();
  // send burner xDAI
  const transferXDai = await funderWallet.sendTransaction({
    to: burner.address,
    value: ethers.parseEther("0.01"),
    type: 2,
    nonce: await funderWallet.getNonce(),
  });
  transferXDai.wait();

  const burnerWallet = new ethers.Wallet(burner.privateKey, provider);
  const burnerCreditContract = new ethers.Contract(
    creditAddress,
    assetTokenAbi,
    burnerWallet
  );

  const burnerTokenContract = new ethers.Contract(
    tokenAddress,
    assetTokenAbi,
    burnerWallet
  );

  const approveCred = await burnerCreditContract.approve(dexAddress, MaxUint256);
  approveCred.wait();
  const approveAsset = await burnerTokenContract.approve(dexAddress, MaxUint256);
  approveAsset.wait();
}


const addresses = { addresses: addressInfo };
const jsonAddressInfo = JSON.stringify(addresses);

fs.writeFile("./wallets.json", jsonAddressInfo, "utf8", function (err) {
  if (err) {
    return console.log(err);
  }

  console.log("The file was saved!");
});
