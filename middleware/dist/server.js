"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
require('dotenv').config();
// import web3middleware, { Web3Middleware } from './contract';
// export interface Web3Request extends Request {
//   web3: Web3Middleware;
// }
const app = (0, express_1.default)();
app.use(express_1.default.json());
// app.use( async (req: Web3Request, res, next) => {
//   req.web3 = await web3middleware();
//   next();
// });
app.get('/', (req, res) => {
    res.send('middleware server');
});
const port = process.env.PORT || '3001';
app.listen(port, () => {
    console.log(`middleware server is listening on port ${port}`);
});
