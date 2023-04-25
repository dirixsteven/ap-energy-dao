import { ReadlineParser, SerialPort } from 'serialport';
import * as crc from 'crc';
import fs from 'fs';
import readline from 'readline';
import { SerialPortStream } from "@serialport/stream";
import { MockBinding, MockBindingInterface, MockPortBinding } from '@serialport/binding-mock';
import { obiscodes } from '../util/obiscodes';
import { calcCRC16 } from '../util/p1-smart-meter-crc16';
import { APEnergyContractService } from './APEnergyContractService';
import { Account } from 'web3-core';

interface P1TelegramLine {
  obiscode?: string;
  value?: string | number;
  unit?: string;
}

export class SmartMeterReader {
  private static instance: SmartMeterReader;
  public serialPort: SerialPort | SerialPortStream<MockBindingInterface> | null = null;
  private p1telegram: string = '';
  private mock: boolean = false;
  private debug: boolean = false;
  private interval: number = 0;
  private account: Account | undefined;

  private constructor() {
  };

  static getInstance(): SmartMeterReader {
    if (!SmartMeterReader.instance) {
      SmartMeterReader.instance = new SmartMeterReader();
    }
    return SmartMeterReader.instance;
  }

  public async initializeReader(path: string, mock: boolean, debug: boolean = false, interval: number = 15) {
    this.mock = mock;
    this.debug = debug;
    this.interval = interval;
    if (!mock) {
      this.serialPort = new SerialPort({ path, baudRate: 115200 });
    } else {
      // Create a port and enable the echo and recording.
      MockBinding.createPort(path, { echo: true, record: true });
      this.serialPort = new SerialPortStream({ binding: MockBinding, path, baudRate: 115200 });
    }
    if (!this.account) {
      this.account = await (await APEnergyContractService.getInstance()).createAccount();
    }
  }

  public async read() {
    if (this.mock) {
      // const parser = new ReadlineParser({delimiter: '\r\n', includeDelimiter: true, encoding: 'ascii'});

      // // read input from serial port
      // this.serialPort?.pipe(parser).on('data', async (p1line) => {
      //   await this.readLine(p1line);
      // })
      const rl = readline.createInterface({
        input: fs.createReadStream('./p1telegram.txt'),
        crlfDelay: Infinity,
      });
      rl.on('line', (line) => {
        this.readLine(line + "\r\n");
      })

    } else {
      this.serialPort && this.serialPort.on('data', (data: Buffer) => {
        (data) && this.readLine(data.toString());
      });
    }
  }

  public emitTestData(generateTelegram: Function, interval: number, limit: number) {
    
    if (this.serialPort instanceof SerialPortStream<MockBindingInterface>)

      this.serialPort.on('open', () => {
        // ...then test by simulating incoming data
        let counter = 0;
        const intervalId = setInterval(() => {
          if (counter >= limit) {
              clearInterval(intervalId);
          } else {
              try {
                (this.serialPort?.port as MockPortBinding).emitData(generateTelegram());
                  counter++;
              } catch (error) {
                  console.log(error);
              }
          }
        }, interval)
      })
    else {
      throw new Error("SerialPort is not an instance of SerialPortStream")
    }
  }

  public close() {
    console.log('Stopping...');
    this.serialPort?.close();
  }

  public getAccount() {
    return this.account;
  }

  private async readLine(p1line: string) {
    if (p1line.toString().includes('/')) {
      // code to handle lines starting with '/'
      if (this.debug) console.log('Found beginning of P1 telegram');
      //p1telegram = Buffer.alloc(0);
      this.p1telegram = '';
      if (this.debug) console.log('*'.repeat(60) + '\n');
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
        if (!this.mock) fs.appendFileSync('./p1telegram.txt', this.p1telegram);

        // parse telegram contents, line by line
        const output: P1TelegramLine[] = [];
        for (const line of this.p1telegram.toString().split('\r\n')) {
          const r: P1TelegramLine = this.parseTelegramLine(line);
          if (r) {
            output.push(r);
            if (this.debug) {
              console.log(`desc:${r.obiscode}, val:${r.value}, u:${r.unit}`);
            }
          }
        }



        let timestamp, dayConsumption, dayProduction;

        for (let i = 0; i < output.length; i++) {
          if (output[i].obiscode === "0-0:1.0.0") { timestamp = output[i].value?.toString(); }
          if (output[i].obiscode === "1-0:1.8.1") { dayConsumption = output[i].value?.toString(); }
          if (output[i].obiscode === "1-0:2.8.1") { dayProduction = output[i].value?.toString(); }
        }
        
        const date = timestamp && new Date(
          parseInt(timestamp.substring(0, 2)) + 2000, 
          parseInt(timestamp.substring(2, 4)) - 1,
          parseInt(timestamp.substring(4, 6)), 
          parseInt(timestamp.substring(6, 8)), 
          parseInt(timestamp.substring(8, 10)),
          parseInt(timestamp.substring(10, 12))
        );        
        
        const totalSeconds = date && this.getTotalSeconds(date.getHours(), date.getMinutes(), date.getSeconds())
        
        if (this.account && timestamp && dayConsumption && dayProduction && totalSeconds && totalSeconds % this.interval == 0) {
          const result = await (await APEnergyContractService.getInstance()).logPowerConsumption(this.account, Number(timestamp), dayConsumption, dayProduction);
          console.log(result);
          
        }
          //console.table(output);
      }
    }
  }

  private checkcrc(p1telegram: string): boolean {
    // check CRC16 checksum of telegram and return False if not matching
    // split telegram in contents and CRC16 checksum (format:contents!crc)
    
    return calcCRC16(p1telegram, true);
    
    
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

  private parseTelegramLine(p1line: string)/*: [string, number | string, string, string] | [] */{
    // parse a single line of the telegram and try to get relevant data from it
    let unit: string = "";
    let timestamp: string = "";
    if (this.debug) {
      console.log(`Parsing:${p1line}`);
    }
    // get OBIS code from line (format:OBIS(value)
    const obis: string = p1line.split("(")[0];
    if (this.debug) {
      console.log(`OBIS:${obis}`);
    }
    // check if OBIS code is something we know and parse it
    if (obiscodes.hasOwnProperty(obis)) {
      // get values from line.
      // format:OBIS(value), gas: OBIS(timestamp)(value)
      const values: RegExpMatchArray | null = p1line.match(/\(.*?\)/g);
      if (values) {
        let value: string | number = values[0].slice(1, -1);
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
        } else {
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
          console.log(`description:${obiscodes[obis]}, value:${value}, unit:${unit}`);
        }

        //return { obiscode: obiscodes[obis], value: value, unit: unit };
        return { obiscode: obis, value: value, unit: unit };
      }
    }
    return {};
  }

  private extractUnit(str: string): [number, string] {
    const units = ['W', 'kWh', 'V', 'A', 'm3'];
    for (const unit of units) {
      if (str.endsWith(unit)) {
        return [parseFloat(str.slice(0, -unit.length).trim()), unit];
      }
    }
    return [parseFloat(str.trim()), ''];
  }

  private getTotalSeconds(hour: number, minute: number, second: number): number {
    return hour * 3600 + minute * 60 + second;
  }
}
