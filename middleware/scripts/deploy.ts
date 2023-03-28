import { ethers } from 'hardhat';
require('dotenv').config();
import fs from 'fs';

async function main() {
    const APEnergyContractFactory = await ethers.getContractFactory("APEnergy");

    const APEnergyContract = await APEnergyContractFactory.deploy();
    
    await APEnergyContract.deployed();
    
    console.log(
        `EnergyOnlineMonitoring deployed to ${APEnergyContract.address}`
    );

    fs.writeFileSync('./address.txt', APEnergyContract.address);
}
    
    // We recommend this pattern to be able to use async/await everywhere
    // and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});