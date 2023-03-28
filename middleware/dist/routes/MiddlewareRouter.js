"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const fs_1 = __importDefault(require("fs"));
class MiddlewareRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.init();
    }
    init() {
        this.router.get('/getContractAddress', this.getContractAddress);
    }
    async getContractAddress(req, res) {
        const address = fs_1.default.readFileSync('./address.txt', 'utf-8');
        res.json(address);
    }
}
exports.default = new MiddlewareRouter().router;
