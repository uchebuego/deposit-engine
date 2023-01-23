import { ethers } from "ethers";

import BlockMonitor from "./blockMonitor";

const provider = new ethers.providers.JsonRpcProvider(
  "https://bsc-dataseed.binance.org"
);

const bm = new BlockMonitor(
  provider,
  [],
  ["0x55d398326f99059fF775485246999027B3197955"]
);

bm.start();

// bm.on("transaction_decoded", console.log);
bm.on("block_processed", function ({ blockNumber, transactions }): void {
  console.log(`Finished processing block ${blockNumber}`);
  console.table(transactions);
});

bm.on("block_error", ({ blockNumber, error }) =>
  console.log(`Error processing block: ${blockNumber} \n`, error)
);

// bm.on("block_error", console.log);
