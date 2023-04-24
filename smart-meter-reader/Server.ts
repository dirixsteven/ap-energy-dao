import express, { Application, Request } from "express";
import cors from 'cors';
import bodyParser from "body-parser";
import router from "./routes/APEnergyRouter";

export class Server {
    private app: Application;
    private port: number;

    constructor(port: number) {
        this.app = express();
        this.port = port;

        this.middleware();
        this.routes();
    }

    private middleware(): void {
        this.app.use(cors());
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: false }));
    }

    private routes(): void {
        this.app.get('/', (req, res) => {
            res.json('this is the smartmeter server');
        })
        this.app.use('/', router);
    }

    public start(): void {
        this.app.listen(this.port, () => {
            console.log(`SmartMeter Server listening on port ${this.port}`);
        })
    }
}