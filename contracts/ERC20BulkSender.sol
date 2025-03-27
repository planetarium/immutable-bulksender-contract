// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable2Step.sol";

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
}

contract ERC20BulkSender is Ownable2Step {
    struct BulkSendData {
        address to;
        uint256 amount;
    }

    function bulkSend(
        address tokenAddress,
        BulkSendData[] calldata recipients
    ) external {
        IERC20 token = IERC20(tokenAddress);

        uint256 totalAmount = 0;
        for (uint256 i = 0; i < recipients.length; i++) {
            totalAmount += recipients[i].amount;
        }

        require(token.allowance(msg.sender, address(this)) >= totalAmount, "Not enough allowance");

        for (uint256 i = 0; i < recipients.length; i++) {
            require(token.transferFrom(msg.sender, recipients[i].to, recipients[i].amount), "Transfer failed");
        }
    }
}
