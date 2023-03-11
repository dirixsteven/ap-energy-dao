import { ethers } from 'hardhat';

async function main() {
    const EnergyOnlineMonitoring = await ethers.getContractFactory("APEnergyOnlineMonitoring");

    const energyOnlineMonitoring = await EnergyOnlineMonitoring.deploy();
    
    await energyOnlineMonitoring.deployed();
    
    console.log(
        `EnergyOnlineMonitoring deployed to ${energyOnlineMonitoring.address}`
    );
}
    
    // We recommend this pattern to be able to use async/await everywhere
    // and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});