"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();
const config = {
    solidity: "0.8.18",
    typechain: {
        target: "web3-v1"
    },
    networks: {
        public: {
            url: "http://192.168.44.132:8545"
        }
    }
};
exports.default = config;
