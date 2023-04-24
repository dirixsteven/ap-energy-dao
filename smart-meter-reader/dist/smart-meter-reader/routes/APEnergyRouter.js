"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const APEnergyContractService_1 = require("../services/APEnergyContractService");
const SmartMeterService_1 = require("../services/SmartMeterService");
class APEnergyRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.init();
    }
    init() {
        this.router.get('/initializeMeter', this.initializeMeter);
        this.router.get('/startReader', this.startReader);
        this.router.get('/startTest', this.startTest);
        // ADD INITIALIZE SMART-METER
        // ADD LOG POWER CONSUMPTION HERE
    }
    async initializeMeter(req, res) {
        const account = await (await APEnergyContractService_1.APEnergyContractService.getInstance()).createAccount();
        const serialport = '/dev/ttyUSB0';
        const mock = true;
        const debug = false;
        const interval = 15;
        await SmartMeterService_1.SmartMeterReader.getInstance().initializeReader(serialport, mock, debug, interval, account);
        res.json(account.address);
    }
    ;
    async startReader(req, res) {
        SmartMeterService_1.SmartMeterReader.getInstance().read();
        return true;
    }
    async startTest(req, res) {
        const contractService = await APEnergyContractService_1.APEnergyContractService.getInstance();
        const participantAccount = await contractService.createAccount();
        await contractService.addParticipant(participantAccount);
        const resourceAccount = await contractService.createAccount();
        await contractService.addResource(participantAccount, resourceAccount.address);
        await contractService.getResources(participantAccount.address);
        const timestamp = new Date().toISOString().replace(/[-T:.]/g, "").slice(2, -4); //+ "W"
        await contractService.logPowerConsumption(resourceAccount, Number(timestamp), "212", "123");
        res.json(await contractService.getResourcePowerConsumption(resourceAccount.address));
    }
    ;
}
exports.default = new APEnergyRouter().router;
const initializeSmartMeter = async () => {
};
