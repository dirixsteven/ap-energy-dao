import { Request, Response, Router } from 'express';
import fs from 'fs';

class MiddlewareRouter {
    public router: Router;

    constructor() {
        this.router = Router();
        this.init();
    }

    private init() {
        this.router.get('/getContractAddress', this.getContractAddress);
    }

    private async getContractAddress(req: Request, res: Response) {
        const address = fs.readFileSync('./address.txt', 'utf-8');
        res.json(address);
    }
}

export default new MiddlewareRouter().router;