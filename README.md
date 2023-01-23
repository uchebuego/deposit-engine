# deposit-engine

This project monitors any EVM blockchain for incoming ERC-20 transfers of tokens of interest to wallet addresses of interest

## Setup

Feel free to fork this project. It requires node.js (16+ recommended) and a node package manager.

## Usage

Edit any variables of interest and run `yarn start` (or `npm start` if you don't have yarn enabled).

The index.ts file imports, configures and bootstraps the BlockMonitor. The BlockMonitor's constructor accepts three arguments:

- An instance of an ethers.js provider
- An array of wallet addresses you would like to monitor
- An array of addresses to ERC-20 smart contracts you're interested in

You can change these as you like

The BlockMonitor Object emits various events which can be listened to and consumed accordingly.

The most useful event is the `block_processed` event which carries the block number, and an array of decoded transactions for that block in the payload.
The decoded transaction information includes the sender address, receiver address, and the amount of tokens transferred (as a BigNumber).


