// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "forge-std/Script.sol";
import "../PredikUSD.sol";

/**
 * @title Deploy PredikUSD
 * @notice Deployment script for PredikUSD token on BNB Smart Chain Mainnet
 *
 * @dev Usage:
 * 1. Set PRIVATE_KEY in .env file
 * 2. Run: forge script script/DeployPredikUSD.s.sol:DeployPredikUSD --rpc-url bsc --broadcast --verify
 */
contract DeployPredikUSD is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);

        PredikUSD token = new PredikUSD();

        vm.stopBroadcast();

        console.log("PredikUSD deployed at:", address(token));
        console.log("Name:", token.name());
        console.log("Symbol:", token.symbol());
        console.log("Decimals:", token.decimals());
        console.log("Initial Supply:", token.totalSupply() / 10**6, "pUSD");
        console.log("Faucet Amount:", token.FAUCET_AMOUNT() / 10**6, "pUSD");
        console.log("Faucet Cooldown:", token.FAUCET_COOLDOWN() / 1 hours, "hours");
        console.log("Owner:", token.owner());
    }
}
