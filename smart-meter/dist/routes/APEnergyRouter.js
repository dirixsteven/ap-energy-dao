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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const APEnergyContractService_1 = require("../services/APEnergyContractService");
class APEnergyRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.init();
    }
    init() {
        this.router.get('/getPublicKey', this.getPublicKey);
        this.router.get('/startTest', this.startTest);
        // ADD INITIALIZE SMART-METER
        // ADD LOG POWER CONSUMPTION HERE
    }
    getPublicKey(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            (yield APEnergyContractService_1.APEnergyContractService.getInstance()).createAccount().then(account => {
                res.json(account.address);
            });
        });
    }
    ;
    startTest(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const contractService = yield APEnergyContractService_1.APEnergyContractService.getInstance();
            const participantAccount = yield contractService.createAccount();
            yield contractService.addParticipant(participantAccount);
            const resourceAccount = yield contractService.createAccount();
            yield contractService.addResource(participantAccount, resourceAccount.address);
            yield contractService.getResources(participantAccount.address);
            const timestamp = new Date().toISOString().replace(/[-T:.]/g, "").slice(2, -4); //+ "W"
            yield contractService.logPowerConsumption(resourceAccount, Number(timestamp), "212", "123");
            res.json(yield contractService.getResourcePowerConsumption(resourceAccount.address));
        });
    }
    ;
}
exports.default = new APEnergyRouter().router;
//# sourceMappingURL=APEnergyRouter.js.map