import { ethers } from "ethers";
import { EventEmitter } from "events";

export default class BlockMonitor extends EventEmitter {
  private provider: ethers.providers.Provider;
  private accounts: string[];
  private lastProcessedBlockNumber: number;
  private interest_tokens: string[];

  constructor(
    provider: ethers.providers.Provider,
    accounts: string[],
    interest_tokens: string[]
  ) {
    super();
    this.provider = provider;
    this.accounts = accounts;
    this.lastProcessedBlockNumber = -1;
    this.interest_tokens = interest_tokens;
  }

  public start() {
    this.monitor();
  }

  async processBlock(blockNumber: number): Promise<void> {
    let accounts = this.accounts;

    let block = await this.provider.getBlockWithTransactions(blockNumber);

    const relevantTransactions = (
      await Promise.all(
        block.transactions
          .filter(
            (transaction) =>
              transaction.to && this.interest_tokens.includes(transaction.to)
          )
          .map((transaction) => this.decodeTransaction(transaction.hash))
      )
    ).filter((dT) => dT && accounts.includes(dT.toAddress));

    relevantTransactions.forEach((rT) => this.emit("transaction_decoded", rT));

    this.emit("block_processed", {
      blockNumber,
      transactions: relevantTransactions,
    });
  }

  async decodeTransaction(transactionHash: string) {
    const decoder = new ethers.utils.AbiCoder();

    try {
      const receipt = await this.provider.getTransactionReceipt(
        transactionHash
      );

      for (let log of receipt.logs) {
        if (
          log.topics[0] ===
          "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"
        ) {
          let [fromAddress] = decoder.decode(["address"], log.topics[1]);
          let [toAddress] = decoder.decode(["address"], log.topics[2]);
          let [amount] = decoder.decode(["uint256"], log.data);

          return { fromAddress, toAddress, amount };
        }
      }
    } catch (error) {
      this.emit("transaction_error", { error });
    }

    return null;
  }

  public updateAccounts(callback: (current_accounts: string[]) => string[]) {
    this.accounts = callback(this.accounts);
  }

  private async monitor() {
    let currentBlockNumber = await this.provider.getBlockNumber();
    let processingBlock = currentBlockNumber;

    while (true) {
      if (processingBlock > currentBlockNumber) {
        this.emit("updating block target");
        currentBlockNumber = await this.provider.getBlockNumber();
        this.emit("new block target", currentBlockNumber);
        // await sleep(200);
        continue;
      }

      await this.processBlock(processingBlock).catch((error) =>
        this.emit("block_error", { blockNumber: processingBlock, error })
      );

      this.lastProcessedBlockNumber = processingBlock;
      processingBlock++;
    }
  }
}
