require('dotenv').config();
const { ethers } = require('ethers');
const fs = require('fs');
const { parse } = require('csv-parse/sync');

// Contract ABI (only the functions we need)
const bulkSenderABI = [
    "function bulkSend(address tokenAddress, tuple(address to, uint256 amount)[] recipients) external"
];

async function main() {
    // Read and parse the CSV file
    const fileContent = fs.readFileSync('./example.csv', 'utf-8');
    const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true
    });

    // Connect to the network
    const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const bulkSender = new ethers.Contract(process.env.BULK_SENDER_ADDRESS, bulkSenderABI, wallet);

    // Prepare the data
    const recipients = records.map(record => ({
        to: record.address,
        amount: ethers.utils.parseUnits(record.amount, 18) // Assuming 18 decimals, adjust if different
    }));


    // Configuration
    const CHUNK_SIZE = 50;

    // Split into chunks based on CHUNK_SIZE
    const chunks = [];
    for (let i = 0; i < recipients.length; i += CHUNK_SIZE) {
        chunks.push(recipients.slice(i, i + CHUNK_SIZE));
    }

    // Process each chunk
    console.log(`Total chunks to process: ${chunks.length}`);
    for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        console.log(`Processing chunk ${i + 1}/${chunks.length} (${chunk.length} recipients)`);

        try {
            // Get current gas price and set minimum values
            const feeData = await provider.getFeeData();

            // Calculate optimal gas price based on network conditions
            const currentGasPrice = await provider.getGasPrice();
            const baseFee = feeData.lastBaseFeePerGas || currentGasPrice;

            // Set priority fee (tip) to be 10% higher than current network tip
            const currentTip = feeData.maxPriorityFeePerGas || ethers.utils.parseUnits("1", "gwei");
            const maxPriorityFeePerGas = currentTip.mul(110).div(100); // 10% higher than current tip

            // Set max fee to be 20% higher than current base fee plus priority fee
            const maxFeePerGas = baseFee.mul(120).div(100).add(maxPriorityFeePerGas);

            // Estimate gas limit with a smaller buffer
            const gasLimit = await bulkSender.estimateGas.bulkSend(
                process.env.TOKEN_ADDRESS,
                chunk
            );

            // Add 20% buffer to estimated gas limit (reduced from 50%)
            const gasLimitWithBuffer = gasLimit.mul(120).div(100);

            console.log(`Estimated gas limit: ${gasLimit.toString()}`);
            console.log(`Base fee: ${ethers.utils.formatUnits(baseFee, 'gwei')} gwei`);
            console.log(`Max fee per gas: ${ethers.utils.formatUnits(maxFeePerGas, 'gwei')} gwei`);
            console.log(`Max priority fee per gas: ${ethers.utils.formatUnits(maxPriorityFeePerGas, 'gwei')} gwei`);
            console.log(`Total estimated gas cost: ${ethers.utils.formatEther(maxFeePerGas.mul(gasLimitWithBuffer))} ETH`);

            const tx = await bulkSender.bulkSend(
                process.env.TOKEN_ADDRESS,
                chunk,
                {
                    maxFeePerGas,
                    maxPriorityFeePerGas,
                    gasLimit: gasLimitWithBuffer
                }
            );
            console.log(`Transaction sent: ${tx.hash}`);
            await tx.wait();
            console.log(`Transaction confirmed: ${tx.hash}`);
        } catch (error) {
            console.error(`Error processing chunk ${i + 1}:`, error);
            if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
                console.error('Failed to estimate gas. The transaction might fail or the contract might be reverting');
            }
            // You might want to implement retry logic here
        }

        // Add a small delay between chunks to prevent rate limiting
        if (i < chunks.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    console.log('Bulk send completed');
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
