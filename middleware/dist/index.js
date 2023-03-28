"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Server_1 = require("./Server");
require('dotenv').config();
const port = process.env.PORT || '3001';
const server = new Server_1.Server(Number(port));
server.start();
