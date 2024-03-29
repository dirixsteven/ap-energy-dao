import { Request, Response, Router } from 'express';
import { APEnergyContractService } from '../services/APEnergyContractService';
import { SmartMeterReader } from '../services/SmartMeterService';

class APEnergyRouter {
    public router: Router;

    constructor() {
        this.router = Router();
        this.init();
    }

    private init() {
        this.router.get('/initializeMeter', this.initializeMeter);
        this.router.get('/startReader', this.startReader);
        this.router.get('/closeReader', this.closeReader);
        this.router.get('/startTest', this.startTest);
        // ADD INITIALIZE SMART-METER
        // ADD LOG POWER CONSUMPTION HERE
    }

    private async initializeMeter(req: Request, res: Response) {
        const serialport = '/dev/ttyUSB0';
        const mock = req.query.mock === "0" ? false : true;
        const debug = req.query.debug === "0" ? false : true;
        const interval = Number(req.query.interval);
        console.log(interval);
        
        await SmartMeterReader.getInstance().initializeReader(serialport, mock, debug, interval);

        res.json(SmartMeterReader.getInstance().getAccount());
    };

    private async startReader(req: Request, res: Response) {
        SmartMeterReader.getInstance().read();
    
        return true;
    }

    private async closeReader() {
        SmartMeterReader.getInstance().close();

        return true;
    }

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



const initializeSmartMeter = async () => {
    

    
}

