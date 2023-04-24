"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
        this.createAccount = () => __awaiter(this, void 0, void 0, function* () {
            const account = this.web3.eth.accounts.create();
            yield this.fundAccount(account);
            return account;
        });
        this.fundAccount = (account) => __awaiter(this, void 0, void 0, function* () {
            let result;
            try {
                const defaultAccount = yield this.web3.eth.getAccounts().then((accounts) => accounts[0]);
                const value = this.web3.utils.toWei('1', 'ether');
                const transactionConfig = { from: defaultAccount, to: account.address, value: value };
                yield this.web3.eth.sendTransaction(transactionConfig);
            }
            catch (error) {
                result = error;
            }
            return {
                message: result || `wallet funded: Wallet ${account.address} funded for ${yield this.web3.eth.getBalance(account.address)}`,
                account: account.address
            };
        });
        // Connect to the Ethereum network and create a contract instance
        this.web3 = new web3_1.default(new web3_1.default.providers.HttpProvider('http://192.168.1.13:8545'));
        this.address = address;
        const contractAbi = APEnergy_json_1.default.abi;
        this.contract = new this.web3.eth.Contract(contractAbi, this.address);
    }
    addParticipant(account) {
        return __awaiter(this, void 0, void 0, function* () {
            const transactionConfig = {
                from: account.address,
                to: this.address,
                // value: 0,
                // gasPrice: await this.web3.eth.getGasPrice(),
                gas: 30000000,
                nonce: yield this.web3.eth.getTransactionCount(account.address),
                data: this.contract.methods.addParticipant().encodeABI()
            };
            let result;
            const transactionReceipt = yield this.web3.eth.accounts.signTransaction(transactionConfig, account.privateKey).then((signedTransaction) => __awaiter(this, void 0, void 0, function* () {
                return (signedTransaction && signedTransaction.rawTransaction) && (yield this.web3.eth.sendSignedTransaction(signedTransaction.rawTransaction).then((transactionReceipt) => {
                    return transactionReceipt;
                }).catch(error => result = error));
            })).catch(error => result = error);
            return {
                message: result || `added participant: ${account.address}`,
                account: account.address
            };
        });
    }
    addResource(participant, resource) {
        return __awaiter(this, void 0, void 0, function* () {
            const transactionConfig = {
                from: participant.address,
                to: this.address,
                //gasPrice: await this.web3.eth.getGasPrice(),
                gas: 30000000,
                nonce: yield this.web3.eth.getTransactionCount(participant.address),
                data: this.contract.methods.addResource(resource, "Smart Meter").encodeABI()
            };
            let result;
            const transactionReceipt = yield this.web3.eth.accounts.signTransaction(transactionConfig, participant.privateKey).then((signedTransaction) => __awaiter(this, void 0, void 0, function* () {
                return (signedTransaction && signedTransaction.rawTransaction) && (yield this.web3.eth.sendSignedTransaction(signedTransaction.rawTransaction).then((transactionReceipt) => {
                    return transactionReceipt;
                }).catch(error => result = error));
            })).catch(error => result = error);
            return {
                message: result || `added resource: ${resource}`,
                account: participant.address
            };
        });
    }
    logPowerConsumption(resource, timestamp, dayConsumption, dayProduction) {
        return __awaiter(this, void 0, void 0, function* () {
            const transactionConfig = {
                from: resource.address,
                to: this.address,
                gas: 30000000,
                nonce: yield this.web3.eth.getTransactionCount(resource.address),
                data: this.contract.methods.logPowerConsumption(timestamp, dayConsumption, dayProduction).encodeABI()
            };
            let result;
            const transactionReceipt = yield this.web3.eth.accounts.signTransaction(transactionConfig, resource.privateKey).then((signedTransaction) => __awaiter(this, void 0, void 0, function* () {
                return (signedTransaction && signedTransaction.rawTransaction) && (yield this.web3.eth.sendSignedTransaction(signedTransaction.rawTransaction).then((transactionReceipt) => {
                    return transactionReceipt;
                }).catch(error => result = error));
            })).catch(error => result = error);
            return {
                message: result || `log power consumtion: ${resource}`,
                account: resource.address
            };
        });
    }
    getResourcePowerConsumption(resource) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.contract.methods.getResourcePowerConsumption(resource).call();
        });
    }
    getParticipants() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.contract.methods.getParticipants().call();
        });
    }
    getResources(participantAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.contract.methods.getParticipantResources(participantAddress).call();
        });
    }
}
exports.APEnergyContractService = APEnergyContractService;
_a = APEnergyContractService;
APEnergyContractService.getInstance = () => __awaiter(void 0, void 0, void 0, function* () {
    if (!APEnergyContractService.instance) {
        const address = yield fetch('http://192.168.1.13:3001/getContractAddress').then((response) => __awaiter(void 0, void 0, void 0, function* () {
            return yield response.json();
        })).catch(reason => { console.log(reason); });
        APEnergyContractService.instance = new APEnergyContractService(address);
    }
    return APEnergyContractService.instance;
});
//# sourceMappingURL=APEnergyContractService.js.map