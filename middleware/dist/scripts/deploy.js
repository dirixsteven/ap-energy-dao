"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const hardhat_1 = require("hardhat");
require('dotenv').config();
const fs_1 = __importDefault(require("fs"));
async function main() {
    const APEnergyContractFactory = await hardhat_1.ethers.getContractFactory("APEnergy");
    const APEnergyContract = await APEnergyContractFactory.deploy();
    await APEnergyContract.deployed();
    console.log(`EnergyOnlineMonitoring deployed to ${APEnergyContract.address}`);
    fs_1.default.writeFileSync('./address.txt', APEnergyContract.address);
}
// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
