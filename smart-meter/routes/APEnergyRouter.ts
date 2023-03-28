import { Request, Response, Router } from 'express';
import { APEnergyContractService } from '../services/APEnergyContractService';

class APEnergyRouter {
    public router: Router;

    constructor() {
        this.router = Router();
        this.init();
    }

    private init() {
        this.router.get('/getPublicKey', this.getPublicKey);
        this.router.get('/startTest', this.startTest);
        // ADD INITIALIZE SMART-METER
        // ADD LOG POWER CONSUMPTION HERE
    }

    private async getPublicKey(req: Request, res: Response) {
        (await APEnergyContractService.getInstance()).createAccount().then(account => {
            res.json(account.address);
        })
    };

    private async startTest(req: Request, res: Response) {
        const contractService = await APEnergyContractService.getInstance();
        const participantAccount = await contractService.createAccount();
        await contractService.addParticipant(participantAccount);
        const resourceAccount = await contractService.createAccount();
        await contractService.addResource(participantAccount, resourceAccount.address);
        await contractService.getResources(participantAccount.address)
        const timestamp = new Date().toISOString().replace(/[-T:.]/g, "").slice(2, -4) //+ "W"
        await contractService.logPowerConsumption(resourceAccount, Number(timestamp) , "212", "123");
        res.json(await contractService.getResourcePowerConsumption(resourceAccount.address))
    };
}

export default new APEnergyRouter().router;