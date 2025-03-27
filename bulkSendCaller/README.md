# Bulk Token Sender

This project is a script for sending ERC20 tokens to multiple addresses in a single transaction.

## Prerequisites

- Node.js v18 or higher
- npm (comes with Node.js)
- ERC20 token contract address
- Deployed BulkSender contract address
- Private key of a wallet with token transfer permissions
- Check Enough balance for gas fees at the wallet
- RPC URL ( API Key ) (e.g., from Infura, Alchemy, or other node providers)

## Installation

1. Navigate to the project directory:
```bash
cd bulkSendCaller
```

2. Install required packages:
```bash
npm install
```

## Environment Setup

1. Create and configure the `.env` file:
```bash
cp .env.example .env    # or create .env file manually
```

2. Open the `.env` file and set the following values:
```
PRIVATE_KEY=your_private_key_here
RPC_URL=your_rpc_url_here
TOKEN_ADDRESS=your_token_contract_address
BULK_SENDER_ADDRESS=your_bulk_sender_contract_address
```

- `PRIVATE_KEY`: Private key of the sending wallet (without 0x prefix)
- `RPC_URL`: RPC URL for the network you're using
- `TOKEN_ADDRESS`: Contract address of the ERC20 token
- `BULK_SENDER_ADDRESS`: Address of the deployed BulkSender contract

## CSV File Preparation

1. Prepare your addresses and amounts following the format in `example.csv`.
2. CSV file format:
```csv
address,amount
0x1234...5678,100
0x8765...4321,200
```

- `address`: Ethereum address to receive tokens
- `amount`: Token amount to send (actual amount without considering decimals)

## Running the Script

1. Execute the script:
```bash
node bulkSend.js
```

2. Execution results:
- Status updates for each chunk (50 addresses per chunk) will be displayed (you might need to reduce the chunk size if hitting gas limits)
- Estimated gas and transaction hashes will be shown
- Detailed error messages will be displayed if any errors occur

## Important Notes

1. Pre-execution checklist:
   - Ensure the sending wallet has sufficient tokens
   - Ensure the sending wallet has sufficient gas (native tokens)
   - Verify that the BulkSender contract has been approved to spend your tokens

2. Gas settings:
   - The script automatically calculates appropriate gas prices
   - Minimum gas tip is set to 10 gwei
   - Gas limit includes a 20% buffer

3. Testing recommendations:
   - Test on testnet before running on mainnet
   - Start with a small test batch before processing large amounts

## Troubleshooting

1. If you get "transaction underpriced" error:
   - Gas prices might have spiked on the network
   - Wait briefly and try again

2. If you get "insufficient funds" error:
   - Check if the wallet has enough gas funds
   - Verify if the wallet has enough tokens to send

3. If you get "execution reverted" error:
   - Check if the BulkSender contract has token approval
   - Verify if the approved amount is greater than the total amount being sent
