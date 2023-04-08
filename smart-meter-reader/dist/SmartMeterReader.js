"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmartMeterReader = void 0;
const serialport_1 = require("serialport");
const fs_1 = __importDefault(require("fs"));
const readline_1 = __importDefault(require("readline"));
const stream_1 = require("@serialport/stream");
const binding_mock_1 = require("@serialport/binding-mock");
const obiscodes_1 = require("./util/obiscodes");
const p1_smart_meter_crc16_1 = require("./util/p1-smart-meter-crc16");
class SmartMeterReader {
    constructor() {
        this.serialPort = null;
        this.p1telegram = '';
        this.mock = false;
        this.debug = false;
        this.interval = 0;
    }
    ;
    static getInstance() {
        if (!SmartMeterReader.instance) {
            SmartMeterReader.instance = new SmartMeterReader();
        }
        return SmartMeterReader.instance;
    }
    async initializePort(path, mock, debug = false, interval = 15) {
        this.mock = mock;
        this.debug = debug;
        this.interval = interval;
        if (!mock) {
            this.serialPort = new serialport_1.SerialPort({ path, baudRate: 115200 });
        }
        else {
            // Create a port and enable the echo and recording.
            binding_mock_1.MockBinding.createPort(path, { echo: true, record: true });
            this.serialPort = new stream_1.SerialPortStream({ binding: binding_mock_1.MockBinding, path, baudRate: 115200 });
        }
    }
    async read() {
        if (this.mock) {
            // const parser = new ReadlineParser({delimiter: '\r\n', includeDelimiter: true, encoding: 'ascii'});
            // // read input from serial port
            // this.serialPort?.pipe(parser).on('data', async (p1line) => {
            //   await this.readLine(p1line);
            // })
            const rl = readline_1.default.createInterface({
                input: fs_1.default.createReadStream('./p1telegram.txt'),
                crlfDelay: Infinity,
            });
            rl.on('line', (line) => {
                this.readLine(line + "\r\n");
            });
        }
        else {
            this.serialPort && this.serialPort.on('data', (data) => {
                (data) && this.readLine(data.toString());
            });
        }
    }
    emitTestData(generateTelegram, interval, limit) {
        if (this.serialPort instanceof (stream_1.SerialPortStream))
            this.serialPort.on('open', () => {
                // ...then test by simulating incoming data
                let counter = 0;
                const intervalId = setInterval(() => {
                    var _a;
                    if (counter >= limit) {
                        clearInterval(intervalId);
                    }
                    else {
                        try {
                            ((_a = this.serialPort) === null || _a === void 0 ? void 0 : _a.port).emitData(generateTelegram());
                            counter++;
                        }
                        catch (error) {
                            console.log(error);
                        }
                    }
                }, interval);
            });
        else {
            throw new Error("SerialPort is not an instance of SerialPortStream");
        }
    }
    close() {
        var _a;
        console.log('Stopping...');
        (_a = this.serialPort) === null || _a === void 0 ? void 0 : _a.close();
    }
    async readLine(p1line) {
        var _a, _b, _c;
        if (p1line.toString().includes('/')) {
            // code to handle lines starting with '/'
            if (this.debug)
                console.log('Found beginning of P1 telegram');
            //p1telegram = Buffer.alloc(0);
            this.p1telegram = '';
            if (this.debug)
                console.log('*'.repeat(60) + '\n');
        }
        // add line to complete telegram
        //p1telegram = Buffer.concat([p1telegram, Buffer.from(p1line)]);
        this.p1telegram += p1line;
        // P1 telegram ends with ! + CRC16 checksum
        if (p1line.toString().includes('!')) {
            if (this.debug) {
                console.log('Found end, printing full telegram');
                console.log('*'.repeat(40));
                console.log(this.p1telegram.toString().trim());
                console.log('*'.repeat(40));
            }
            if (this.checkcrc(this.p1telegram)) {
                // Write telegram to file
                if (!this.mock)
                    fs_1.default.appendFileSync('./p1telegram.txt', this.p1telegram);
                // parse telegram contents, line by line
                const output = [];
                for (const line of this.p1telegram.toString().split('\r\n')) {
                    const r = this.parseTelegramLine(line);
                    if (r) {
                        output.push(r);
                        if (this.debug) {
                            console.log(`desc:${r.obiscode}, val:${r.value}, u:${r.unit}`);
                        }
                    }
                }
                let timestamp, dayConsumption, dayProduction;
                for (let i = 0; i < output.length; i++) {
                    if (output[i].obiscode === "0-0:1.0.0") {
                        timestamp = (_a = output[i].value) === null || _a === void 0 ? void 0 : _a.toString();
                    }
                    if (output[i].obiscode === "1-0:1.8.1") {
                        dayConsumption = (_b = output[i].value) === null || _b === void 0 ? void 0 : _b.toString();
                    }
                    if (output[i].obiscode === "1-0:2.8.1") {
                        dayProduction = (_c = output[i].value) === null || _c === void 0 ? void 0 : _c.toString();
                    }
                }
                const date = timestamp && new Date(parseInt(timestamp.substring(0, 2)) + 2000, parseInt(timestamp.substring(2, 4)) - 1, parseInt(timestamp.substring(4, 6)), parseInt(timestamp.substring(6, 8)), parseInt(timestamp.substring(8, 10)), parseInt(timestamp.substring(10, 12)));
                const totalSeconds = date && this.getTotalSeconds(date.getHours(), date.getMinutes(), date.getSeconds());
                if (totalSeconds && totalSeconds % this.interval == 0)
                    console.table(output);
                // if (this.account && timestamp && dayConsumption && dayProduction) {
                //   const transactionConfig = {
                //     from: this.account.address,
                //     to: contractAddress,
                //     // value: 0,
                //     gasPrice: await web3.eth.getGasPrice(),
                //     gasLimit: 30000000,
                //     nonce: await web3.eth.getTransactionCount(this.account.address),
                //     data: contract.methods.logPowerConsumption(timestamp, dayConsumption, dayProduction).encodeABI()
                //   }
                //   const signedTransaction = await web3.eth.accounts.signTransaction(transactionConfig, this.account.privateKey);
                //   const transactionReceipt = await web3.eth.sendSignedTransaction(signedTransaction.rawTransaction);
                //   const events = await contract.getPastEvents('allEvents', {
                //     fromBlock: transactionReceipt && transactionReceipt.blockNumber,
                //     toBlock: transactionReceipt && transactionReceipt.blockNumber
                //   })
                //   console.log({
                //     event: events[0].event, 
                //     resource: events[0].returnValues["resource"],
                //     timestamp: events[0].returnValues["timestamp"],
                //     dayConsumption: events[0].returnValues["dayConsumption"],
                //     dayProduction: events[0].returnValues["dayProduction"]
                //   });
                // }
            }
        }
    }
    checkcrc(p1telegram) {
        // check CRC16 checksum of telegram and return False if not matching
        // split telegram in contents and CRC16 checksum (format:contents!crc)
        return (0, p1_smart_meter_crc16_1.calcCRC16)(p1telegram, true);
        /*
         *
        for (const match of p1telegram.toString().matchAll(/\r\n(?=!)/g)) {
          const p1contents = p1telegram.slice(0, match.index! + match[0].length);
          const givencrc = parseInt(p1telegram.slice(match.index! + 1 + match[0].length).trim(), 16).toString(16);
          
          // calculate checksum of the contents
          const calccrc = crc.crc16modbus(p1contents);
          //console.log(p1contents);
          //console.log(`Given checksum: ${givencrc}, Calculated checksum: ${calccrc.toString(16)}`);
          // check if given and calculated match
          if (this.debug) {
            console.log(`Given checksum: ${givencrc}, Calculated checksum: ${calccrc.toString(16)}`);
          }
          if (givencrc !== calccrc.toString(16)) {
            if (this.debug) {
              console.log("Checksum incorrect, skipping...");
            }
            return false;
          }
        }
        return true;
        */
    }
    parseTelegramLine(p1line) {
        // parse a single line of the telegram and try to get relevant data from it
        let unit = "";
        let timestamp = "";
        if (this.debug) {
            console.log(`Parsing:${p1line}`);
        }
        // get OBIS code from line (format:OBIS(value)
        const obis = p1line.split("(")[0];
        if (this.debug) {
            console.log(`OBIS:${obis}`);
        }
        // check if OBIS code is something we know and parse it
        if (obiscodes_1.obiscodes.hasOwnProperty(obis)) {
            // get values from line.
            // format:OBIS(value), gas: OBIS(timestamp)(value)
            const values = p1line.match(/\(.*?\)/g);
            if (values) {
                let value = values[0].slice(1, -1);
                // timestamp requires removal of last char
                if (obis === "0-0:1.0.0" || values.length > 1) {
                    value.slice(0, -1);
                }
                // report of connected gas-meter...
                if (values.length > 1) {
                    timestamp = value;
                    value = values[1].slice(1, -1);
                }
                // serial numbers need different parsing: (hex to ascii)
                if (obis.includes("96.1.1")) {
                    value = Buffer.from(value, 'hex').toString('ascii');
                }
                else {
                    // separate value and unit (format:value*unit)
                    // const lvalue: string[] = value.split("*");
                    // value = parseFloat(lvalue[0]);
                    // if (lvalue.length > 1) {
                    //   unit = lvalue[1];
                    // }
                    [value, unit] = this.extractUnit(value);
                }
                // return result in tuple: description,value,unit,timestamp
                if (this.debug) {
                    console.log(`description:${obiscodes_1.obiscodes[obis]}, value:${value}, unit:${unit}`);
                }
                //return { obiscode: obiscodes[obis], value: value, unit: unit };
                return { obiscode: obis, value: value, unit: unit };
            }
        }
        return {};
    }
    extractUnit(str) {
        const units = ['W', 'kWh', 'V', 'A', 'm3'];
        for (const unit of units) {
            if (str.endsWith(unit)) {
                return [parseFloat(str.slice(0, -unit.length).trim()), unit];
            }
        }
        return [parseFloat(str.trim()), ''];
    }
    getTotalSeconds(hour, minute, second) {
        return hour * 3600 + minute * 60 + second;
    }
}
exports.SmartMeterReader = SmartMeterReader;
