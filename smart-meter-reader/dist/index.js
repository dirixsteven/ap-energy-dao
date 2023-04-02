"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SmartMeterReader_1 = require("./SmartMeterReader");
const serialport = '/dev/ttyUSB0';
const mock = true;
const debug = false;
const initializeSmartMeter = async () => {
    await SmartMeterReader_1.SmartMeterReader.getInstance().initializePort(serialport, mock, debug);
    SmartMeterReader_1.SmartMeterReader.getInstance().read();
    return true;
};
initializeSmartMeter().then((open) => {
    console.log('Smart meter ready to read');
});
