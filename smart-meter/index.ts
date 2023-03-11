import { SmartMeterReader } from "./SmartMeterReader";

// Change your serial port here:
const serialport = '/dev/ttyS1';

const initializeSmartMeter = async () => {
    await SmartMeterReader.getInstance().initializePort(serialport, true);
    SmartMeterReader.getInstance().read();
    return true;
}

initializeSmartMeter().then((open) => {
    console.log('Smart smeter ready to read');
});