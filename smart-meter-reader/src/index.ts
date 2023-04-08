import { SmartMeterReader } from "./SmartMeterReader";

const serialport = '/dev/ttyUSB0';
const mock = true
const debug = false;
const interval = 15;

const initializeSmartMeter = async () => {
    await SmartMeterReader.getInstance().initializePort(serialport, mock, debug, interval);
    SmartMeterReader.getInstance().read();
    return true;
}

initializeSmartMeter().then((open) => {
    console.log('Smart meter ready to read');
})
