import { SmartMeterReader } from "./SmartMeterReader";

const serialport = '/dev/ttyUSB0';

const initializeSmartMeter = async () => {
    await SmartMeterReader.getInstance().initializePort(serialport, false, false);
    SmartMeterReader.getInstance().read();
    return true;
}

initializeSmartMeter().then((open) => {
    console.log('Smart meter ready to read');
})
