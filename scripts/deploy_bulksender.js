const { ethers, upgrades, run} = require("hardhat");

async function main() {
    const contractName = "ERC20BulkSender";
    const ERC20BulkSender = await ethers.getContractFactory("ERC20BulkSender");
    const bulkSender = await ERC20BulkSender.deploy();

    await bulkSender.deployed();

    const contractAddress = bulkSender.address

    console.log("ERC20BulkSender deployed to:", contractAddress);

    await run("verify:verify", {
        address: contractAddress,
        contract: `contracts/bulksend/${contractName}.sol:${contractName}`,
    });

    console.log(contractName, "deployed Address === ", contractAddress);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
