const batchPrepAbi = [{"type":"function","name":"batchSetup","inputs":[{"name":"credit","type":"address","internalType":"address"},{"name":"assets","type":"tuple[]","internalType":"struct AssetInfo[]","components":[{"name":"asset","type":"address","internalType":"address"},{"name":"assetDex","type":"address","internalType":"address"},{"name":"burner","type":"address","internalType":"address"}]},{"name":"tokensToSend","type":"uint256","internalType":"uint256"},{"name":"nativeTokenToSend","type":"uint256","internalType":"uint256"}],"outputs":[],"stateMutability":"nonpayable"},{"type":"error","name":"UnequalArrayLengths","inputs":[]}];


export { batchPrepAbi };
