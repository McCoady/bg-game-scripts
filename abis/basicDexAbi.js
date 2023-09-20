const basicDexAbi = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_creditToken",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_assetToken",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "InitError",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_liquidityAvailable",
        "type": "uint256"
      }
    ],
    "name": "InsufficientLiquidityError",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "SlippageError",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_token",
        "type": "address"
      }
    ],
    "name": "TokenTransferError",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "ZeroQuantityError",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "_user",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "_liquidityMinted",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "_creditTokenAdded",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "_assetTokenAdded",
        "type": "uint256"
      }
    ],
    "name": "LiquidityProvided",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "_user",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "_liquidityAmount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "_creditTokenAmount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "_assetTokenAmount",
        "type": "uint256"
      }
    ],
    "name": "LiquidityRemoved",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "_user",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "_tradeDirection",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "_tokensSwapped",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "_tokensReceived",
        "type": "uint256"
      }
    ],
    "name": "TokenSwap",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "assetIn",
        "type": "uint256"
      }
    ],
    "name": "assetInPrice",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "creditOut",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "assetOut",
        "type": "uint256"
      }
    ],
    "name": "assetOutPrice",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "creditIn",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokensIn",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "minTokensBack",
        "type": "uint256"
      }
    ],
    "name": "assetToCredit",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "tokenOutput",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "assetToken",
    "outputs": [
      {
        "internalType": "contract IERC20",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "creditIn",
        "type": "uint256"
      }
    ],
    "name": "creditInPrice",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "assetOut",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "creditOut",
        "type": "uint256"
      }
    ],
    "name": "creditOutPrice",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "assetIn",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokensIn",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "minTokensBack",
        "type": "uint256"
      }
    ],
    "name": "creditToAsset",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "tokenOutput",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "creditToken",
    "outputs": [
      {
        "internalType": "contract IERC20",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "creditTokenDeposited",
        "type": "uint256"
      }
    ],
    "name": "deposit",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "liquidityMinted",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAssetAddr",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getCreditAddr",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_user",
        "type": "address"
      }
    ],
    "name": "getLiquidity",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokens",
        "type": "uint256"
      }
    ],
    "name": "init",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "liquidity",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "xInput",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "xReserves",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "yReserves",
        "type": "uint256"
      }
    ],
    "name": "price",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "yOutput",
        "type": "uint256"
      }
    ],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalLiquidity",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "withdraw",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "creditTokenAmount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "assetTokenAmount",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

export {basicDexAbi};