import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import { Account, TransactionConfig, TransactionReceipt } from 'web3-core';
import APEnergyArtifact from '../../middleware/artifacts/contracts/APEnergy.sol/APEnergy.json';
import { APEnergy } from '../../middleware/typechain-types/contracts/APEnergy';


export class APEnergyContractService {
  private static instance: APEnergyContractService;

  private contract: APEnergy;
  private web3: Web3;
  private address: string;

  private constructor(address: string) {
    // Connect to the Ethereum network and create a contract instance
    this.web3 = new Web3(new Web3.providers.HttpProvider('http://192.168.44.132:8545'));
    this.address = address;
    const contractAbi = APEnergyArtifact.abi;

    this.contract = new this.web3.eth.Contract(contractAbi as AbiItem[], this.address) as unknown as APEnergy;
  }

  public static getInstance = async(): Promise<APEnergyContractService> => {
    if (!APEnergyContractService.instance) {
      const address = await fetch('http://192.168.44.132:3001/getContractAddress').then(async (response) => {
        return await response.json();
      }).catch(reason => {console.log(reason)});
      APEnergyContractService.instance = new APEnergyContractService(address);
    }
    return APEnergyContractService.instance;
  }

  // Add more contract method calls here
  public createAccount = async () => {
    const account: Account = this.web3.eth.accounts.create();

    await this.fundAccount(account);

    return account
  };

  private fundAccount = async (account: Account) => {
    let result;
    try {
      const defaultAccount = await this.web3.eth.getAccounts().then((accounts: any[]) => accounts[0]);
      const value = this.web3.utils.toWei('1', 'ether');      
      const transactionConfig = { from: defaultAccount, to: account.address, value: value }
      await this.web3.eth.sendTransaction(transactionConfig);
    } catch (error) {
      result = error
    }

    return {
      message: result || `wallet funded: Wallet ${account.address} funded for ${await this.web3.eth.getBalance(account.address)}`,
      account: account.address
    }
  };

  public async addParticipant(account: Account) {
    const transactionConfig: TransactionConfig = {
      from: account.address,
      to: this.address,
      // value: 0,
      // gasPrice: await this.web3.eth.getGasPrice(),
      gas: 30000000,
      nonce: await this.web3.eth.getTransactionCount(account.address),
      data: this.contract.methods.addParticipant().encodeABI()
    }
  
    let result;

    const transactionReceipt: TransactionReceipt | void | undefined | string = await this.web3.eth.accounts.signTransaction(transactionConfig, account.privateKey).then(async signedTransaction => {
      return (signedTransaction && signedTransaction.rawTransaction) && await this.web3.eth.sendSignedTransaction(signedTransaction.rawTransaction).then((transactionReceipt) => {
        return transactionReceipt;
      }).catch(error => result = error);
    }).catch(error => result = error)

    return {
      message: result ||`added participant: ${account.address}`,
      account: account.address
    }
  }

  public async addResource(participant: Account, resource: string) {
    const transactionConfig: TransactionConfig = {
      from: participant.address,
      to: this.address,
      //gasPrice: await this.web3.eth.getGasPrice(),
      gas: 30000000,
      nonce: await this.web3.eth.getTransactionCount(participant.address),
      data: this.contract.methods.addResource(resource, "Smart Meter").encodeABI()
    }

    let result;

    const transactionReceipt: TransactionReceipt | void | undefined | string = await this.web3.eth.accounts.signTransaction(transactionConfig, participant.privateKey).then(async signedTransaction => {
      return (signedTransaction && signedTransaction.rawTransaction) && await this.web3.eth.sendSignedTransaction(signedTransaction.rawTransaction).then((transactionReceipt) => {
        return transactionReceipt;
      }).catch(error => result = error);
    }).catch(error => result = error)

    return {
      message: result ||`added resource: ${resource}`,
      account: participant.address
    }
  }

  public async logPowerConsumption(resource: Account, timestamp: number, dayConsumption: string, dayProduction: string) {
    const transactionConfig: TransactionConfig = {
      from: resource.address,
      to: this.address,
      gas: 30000000,
      nonce: await this.web3.eth.getTransactionCount(resource.address),
      data: this.contract.methods.logPowerConsumption(timestamp, dayConsumption, dayProduction).encodeABI()
    }

    let result;

    const transactionReceipt: TransactionReceipt | void | undefined | string = await this.web3.eth.accounts.signTransaction(transactionConfig, resource.privateKey).then(async signedTransaction => {
      return (signedTransaction && signedTransaction.rawTransaction) && await this.web3.eth.sendSignedTransaction(signedTransaction.rawTransaction).then((transactionReceipt) => {
        return transactionReceipt;
      }).catch(error => result = error);
    }).catch(error => result = error)

    return {
      message: result ||`log power consumtion: ${resource}`,
      account: resource.address
    }
  }

  public async getResourcePowerConsumption(resource: string) {
    return await this.contract.methods.getResourcePowerConsumption(resource).call()
  }

  public async getParticipants() {
    return await this.contract.methods.getParticipants().call();
  }

  public async getResources(participantAddress: string) {
    return await this.contract.methods.getParticipantResources(participantAddress).call();
  }
}
