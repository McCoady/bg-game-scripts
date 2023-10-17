import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();

const tokenAbi = [
    {
      "name": "balanceOf", "type": "function", "stateMutability": "view", "inputs": [{ "internalType": "address", "name": "user", "type": "address" }],
      "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }]
    },
]

const provider = new ethers.WebSocketProvider(process.env.GNOSIS);

const targetAddr = "0xD26536C559B10C5f7261F3FfaFf728Fe1b3b0dEE";

const avocadoToken = new ethers.Contract(
  " ",
  tokenAbi,
  provider
);

const bananaToken = new ethers.Contract(
  "0x5daAF5F0b5363E2d199F2A7842253412046a21c8",
  tokenAbi,
  provider
);

const tomatoToken = new ethers.Contract(
  "0xFc7072b9d8c8941014f2047B42A9662ecaefA357",
  tokenAbi,
  provider
);

const multicallContract = new ethers.Contract(
  "0xcA11bde05977b3631167028862bE2a173976CA11",
  [
    {
      name: "aggregate3",
      type: "function",
      stateMutability: "payable",
      inputs: [
        {
          internalType: "struct Multicall3.Call3[]",
          name: "calls",
          type: "tuple[]",
          components: [
            { internalType: "address", name: "target", type: "address" },
            { internalType: "bool", name: "allowFailure", type: "bool" },
            { internalType: "bytes", name: "callData", type: "bytes" },
          ],
        },
      ],
      outputs: [
        {
          internalType: "struct Multicall3.Result[]",
          name: "returnData",
          type: "tuple[]",
          components: [
            { internalType: "bool", name: "success", type: "bool" },
            { internalType: "bytes", name: "returnData", type: "bytes" },
          ],
        },
      ],
    },
  ],
  provider
);

const calls = [
  {
    contract: avocadoToken,
    functionSignature: 'balanceOf',
    arguments: [targetAddr],
  },
  {
    contract: bananaToken,
    functionSignature: 'balanceOf',
    arguments: [targetAddr],
  },
  {
    contract: tomatoToken,
    functionSignature: 'balanceOf',
    arguments: [targetAddr],
  },
];

async function getAllBalances(calls) {
  console.log(calls[0].contract);
  const calldata = calls.map((call) => ({
    target: call.contract.target,
    allowFailure: true,
    callData: call.contract.interface.encodeFunctionData(
      call.contract.interface.fragments[0],
      call.arguments
    ),
  }));

  return multicallContract.aggregate3.staticCall(calldata).then((result) =>
    result.map((a, i) => ({
      success: a.success,
      value: a.success
        ? calls[i].contract.interface.decodeFunctionResult(
            calls[i].functionSignature,
            a.returnData
          )[0]
        : undefined,
    }))
  );
}

console.log(await getAllBalances(calls));
