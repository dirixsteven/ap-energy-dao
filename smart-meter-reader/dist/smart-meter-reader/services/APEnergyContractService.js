"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.APEnergyContractService = void 0;
const web3_1 = __importDefault(require("web3"));
const APEnergy_json_1 = __importDefault(require("../../middleware/artifacts/contracts/APEnergy.sol/APEnergy.json"));
class APEnergyContractService {
    constructor(address) {
        // Add more contract method calls here
        this.createAccount = async () => {
            const account = this.web3.eth.accounts.create();
            await this.fundAccount(account);
            return account;
        };
        this.fundAccount = async (account) => {
            let result;
            try {
                const defaultAccount = await this.web3.eth.getAccounts().then((accounts) => accounts[0]);
                const value = this.web3.utils.toWei('1', 'ether');
                const transactionConfig = { from: defaultAccount, to: account.address, value: value };
                await this.web3.eth.sendTransaction(transactionConfig);
            }
            catch (error) {
                result = error;
            }
            return {
                message: result || `wallet funded: Wallet ${account.address} funded for ${await this.web3.eth.getBalance(account.address)}`,
                account: account.address
            };
        };
        // Connect to the Ethereum network and create a contract instance
        this.web3 = new web3_1.default(new web3_1.default.providers.HttpProvider('http://192.168.1.13:8545'));
        this.address = address;
        const contractAbi = APEnergy_json_1.default.abi;
        this.contract = new this.web3.eth.Contract(contractAbi, this.address);
    }
    async addParticipant(account) {
        const transactionConfig = {
            from: account.address,
            to: this.address,
            // value: 0,
            // gasPrice: await this.web3.eth.getGasPrice(),
            gas: 30000000,
            nonce: await this.web3.eth.getTransactionCount(account.address),
            data: this.contract.methods.addParticipant().encodeABI()
        };
        let result;
        const transactionReceipt = await this.web3.eth.accounts.signTransaction(transactionConfig, account.privateKey).then(async (signedTransaction) => {
            return (signedTransaction && signedTransaction.rawTransaction) && await this.web3.eth.sendSignedTransaction(signedTransaction.rawTransaction).then((transactionReceipt) => {
                return transactionReceipt;
            }).catch(error => result = error);
        }).catch(error => result = error);
        return {
            message: result || `added participant: ${account.address}`,
            account: account.address
        };
    }
    async addResource(participant, resource) {
        const transactionConfig = {
            from: participant.address,
            to: this.address,
            //gasPrice: await this.web3.eth.getGasPrice(),
            gas: 30000000,
            nonce: await this.web3.eth.getTransactionCount(participant.address),
            data: this.contract.methods.addResource(resource, "Smart Meter").encodeABI()
        };
        let result;
        const transactionReceipt = await this.web3.eth.accounts.signTransaction(transactionConfig, participant.privateKey).then(async (signedTransaction) => {
            return (signedTransaction && signedTransaction.rawTransaction) && await this.web3.eth.sendSignedTransaction(signedTransaction.rawTransaction).then((transactionReceipt) => {
                return transactionReceipt;
            }).catch(error => result = error);
        }).catch(error => result = error);
        return {
            message: result || `added resource: ${resource}`,
            account: participant.address
        };
    }
    async logPowerConsumption(resource, timestamp, dayConsumption, dayProduction) {
        const transactionConfig = {
            from: resource.address,
            to: this.address,
            gas: 30000000,
            nonce: await this.web3.eth.getTransactionCount(resource.address),
            data: this.contract.methods.logPowerConsumption(timestamp, dayConsumption, dayProduction).encodeABI()
        };
        let result;
        const transactionReceipt = await this.web3.eth.accounts.signTransaction(transactionConfig, resource.privateKey).then(async (signedTransaction) => {
            return (signedTransaction && signedTransaction.rawTransaction) && await this.web3.eth.sendSignedTransaction(signedTransaction.rawTransaction).then((transactionReceipt) => {
                return transactionReceipt;
            }).catch(error => result = error);
        }).catch(error => result = error);
        return {
            message: result || `log power consumption: ${resource}`,
            account: resource.address,
            transactionReceipt: transactionReceipt
        };
    }
    async getResourcePowerConsumption(resource) {
        return await this.contract.methods.getResourcePowerConsumption(resource).call();
    }
    async getParticipants() {
        return await this.contract.methods.getParticipants().call();
    }
    async getResources(participantAddress) {
        return await this.contract.methods.getParticipantResources(participantAddress).call();
    }
}
_a = APEnergyContractService;
APEnergyContractService.getInstance = async () => {
    if (!APEnergyContractService.instance) {
        const address = await fetch('http://192.168.1.13:3001/getContractAddress').then(async (response) => {
            return await response.json();
        }).catch(reason => { console.log(reason); });
        APEnergyContractService.instance = new APEnergyContractService(address);
    }
    return APEnergyContractService.instance;
};
exports.APEnergyContractService = APEnergyContractService;
