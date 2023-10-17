import {ethers} from "ethers";

const fruits = ["Avocado", "Apple", "Banana", "Lemon", "Strawberry", "Tomato"];

for (let i = 0; i < fruits.length; i++) {
    const newWallet = ethers.Wallet.createRandom();
    console.log(fruits[i]);
    console.log("Wallet address", newWallet.address);
    console.log("Wallet pk", newWallet.privateKey);
    console.log("----");
}