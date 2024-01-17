import { Address } from "viem";
export type TTokenInfo = {
    contractName: string;
    name: string;
    emoji: string;
  };

export type TDexInfo = {
  name: string;
  address: Address;
}
  
  export type TTokenBalance = {
    balance?: bigint;
    price?: bigint;
    priceIn?: bigint;
    value?: bigint;
  };