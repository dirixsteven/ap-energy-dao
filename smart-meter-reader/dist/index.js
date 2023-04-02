"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SmartMeterReader_1 = require("./SmartMeterReader");
const serialport = '/dev/ttyUSB0';
const initializeSmartMeter = async () => {
    await SmartMeterReader_1.SmartMeterReader.getInstance().initializePort(serialport, false, false);
    SmartMeterReader_1.SmartMeterReader.getInstance().read();
    return true;
};
initializeSmartMeter().then((open) => {
    console.log('Smart meter ready to read');
});
