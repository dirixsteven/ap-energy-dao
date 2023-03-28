"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Server = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const body_parser_1 = __importDefault(require("body-parser"));
const APEnergyRouter_1 = __importDefault(require("./routes/APEnergyRouter"));
class Server {
    constructor(port) {
        this.app = (0, express_1.default)();
        this.port = port;
        this.config();
        this.middleware();
        this.routes();
    }
    config() {
        this.app.use((0, morgan_1.default)('dev'));
    }
    middleware() {
        this.app.use((0, cors_1.default)());
        this.app.use(body_parser_1.default.json());
        this.app.use(body_parser_1.default.urlencoded({ extended: false }));
    }
    routes() {
        this.app.get('/', (res, req) => {
            console.log('this is the smartmeter server');
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
//# sourceMappingURL=Server.js.map