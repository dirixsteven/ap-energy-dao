"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Server = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const APEnergyRouter_1 = __importDefault(require("./routes/APEnergyRouter"));
class Server {
    constructor(port) {
        this.app = (0, express_1.default)();
        this.port = port;
        this.middleware();
        this.routes();
    }
    middleware() {
        this.app.use((0, cors_1.default)());
        this.app.use(body_parser_1.default.json());
        this.app.use(body_parser_1.default.urlencoded({ extended: false }));
    }
    routes() {
        this.app.get('/', (req, res) => {
            res.json('this is the smartmeter server');
        });
        this.app.use('/', APEnergyRouter_1.default);
    }
    start() {
        this.app.listen(this.port, () => {
            console.log(`SmartMeter Server listening on port ${this.port}`);
        });
    }
}
exports.Server = Server;
