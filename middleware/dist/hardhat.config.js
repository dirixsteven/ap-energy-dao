"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();
const config = {
    solidity: "0.8.18",
    typechain: {
        target: "web3-v1"
    }
};
exports.default = config;
