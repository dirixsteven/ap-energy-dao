// 6ZvydZVgLf25UmN

import { Chance } from 'chance';
import { crc16modbus } from 'crc';
import { SmartMeterReader } from './SmartMeterReader';

export class SmartMeterSimulator {
    private reader: SmartMeterReader
    private chance = new Chance();
    private rate1Consumption: number = 0;
    private rate1Production: number = 0;
    private rate2Consumption: number = 0;
    private rate2Production: number = 0;

    public constructor(reader: SmartMeterReader) {
        this.reader = reader;
        this.chance = new Chance();
    };

    public startSimulation = (interval: number = 2000, limit: number = 10) => {
        // should set start consumption & production here
        this.rate1Consumption = this.chance.floating({ min: 0, max: 1000, fixed: 3 })
        this.rate2Consumption = this.chance.floating({ min: 0, max: 1000, fixed: 3 })
        this.rate1Production = this.chance.floating({ min: 0, max: 1000, fixed: 3 })
        this.rate2Production = this.chance.floating({ min: 0, max: 1000, fixed: 3 })

        console.log(this.rate1Consumption);
        console.log(this.rate2Consumption);
        console.log(this.rate1Production);
        console.log(this.rate2Production);

        this.reader.emitTestData(this.generateTelegram, interval, limit);
    }

    public generateTelegram = () => {
        // Generate random values for each field
        const modelSpecification = "FLU5\\253xxxxxx_A";
        const phaseConsumption = this.generateRandomFloat(0, 100, 3, 2);
        const phaseProduction = this.generateRandomFloat(0, 100, 3, 2);
        const newRate1Consumption = this.generateRandomFloat(this.rate1Consumption, this.rate1Consumption + 5, 3, 6)
        this.rate1Consumption = Number(newRate1Consumption);
        const newRate2Consumption = this.generateRandomFloat(this.rate2Consumption, this.rate2Consumption + 5, 3, 6)
        this.rate2Consumption = Number(newRate2Consumption);
        const newRate1Production = this.generateRandomFloat(this.rate1Production, this.rate1Production + 5, 3, 6)
        this.rate1Production = Number(newRate1Production);
        const newRate2Production = this.generateRandomFloat(this.rate2Production, this.rate2Production + 5, 3, 6)
        this.rate2Production = Number(newRate2Production);

        // Build the P1 telegram string
        let p1telegramData = [
          `/${modelSpecification}`,
          `0-0:96.1.4(${this.generateRandomNumber(5)})`,
          `0-0:96.1.1(3153414731313030303736363136)`,
          `0-0:1.0.0(${this.generateTimestamp()})`,
          `1-0:1.8.1(${newRate1Consumption}*kWh)`,
          `1-0:1.8.2(${newRate2Consumption}*kWh)`,
          `1-0:2.8.1(${newRate1Production}*kWh)`,
          `1-0:2.8.2(${newRate2Production}*kWh)`,
          `0-0:96.14.0(${this.generateRandomDayNight()})`,
          `1-0:1.7.0(${phaseConsumption}*kW)`,
          `1-0:2.7.0(${phaseProduction}*kW)`,
          `1-0:21.7.0(${phaseConsumption}*kW)`,
          `1-0:22.7.0(${phaseProduction}*kW)`,
          `1-0:32.7.0(${this.generateRandomFloat(0, 1000, 2, 3)}*V)`,
          `1-0:31.7.0(${this.generateRandomFloat(0, 1000, 2, 3)}*A)`,
          `0-0:96.3.10(1)`,
          `0-0:17.0.0(999.9*kW)`,
          `1-0:31.4.0(999*A)`,
          `0-0:96.13.0()`,
          `0-1:24.1.0(003)`,
          `0-1:96.1.1(37464C4F32313139303331393634)`,
          `0-1:24.4.0(1)`,
          `0-1:24.2.3(${this.generateRandomFloat(0, 100000, 3, 5)}*m3)`
        ];

        let p1telegramChecksum = [
            `!${this.generateChecksum(p1telegramData.join("\r\n"))}\r\n`
        ];

        let p1telegram = p1telegramData.join("\r\n") + p1telegramChecksum;

        return p1telegram
    }

    private generateRandomNumber = (length: number): string => {
        const charset = '012345678';
        return this.chance.string({ length, pool: charset })
    };

    private generateTimestamp = () => {
        return new Date().toISOString().replace(/[-T:.]/g, "").slice(2, -4) + "W";
    }

    private generateRandomFloat = (min: number, max: number, fixed: number, integerLength: number) => {
        const num = this.chance.floating({ min, max, fixed });
        const integerPart = parseInt(num.toString());
        const fractionalPart = (num % 1).toFixed(fixed).substring(2);
        // add "*kWh" at the end
        return integerPart.toString().padStart(integerLength, '0') + '.' + fractionalPart;
    }

    private generateRandomDayNight = () => {
        return this.chance.pickone(['0001', '0002'])
    }

    private generateChecksum(p1telegramData: string) {
        return crc16modbus(p1telegramData).toString(16).toUpperCase();
    }
}

    // public emitTestData(telegram: string) {
    //     if (this.reader.serialPort instanceof SerialPortStream<MockBindingInterface>)
    //       this.serialPort.on('open', () => {
    //         // ...then test by simulating incoming data
    //         //(this.serialPort.port as MockPortBinding).emitData('/FLU5\u00ABxxxxxx_A\r\n0-0:96.1.4(xxxxx)\r\n0-0:96.1.1(xxxxxxxxxxxxxxxxxxxxxxxxxxxx)\r\n0-0:1.0.0(210204163628W)\r\n1-0:1.8.1(000439.094kWh)\r\n1-0:1.8.2(000435.292kWh)\r\n1-0:2.8.1(000035.805kWh)\r\n1-0:2.8.2(000012.156kWh)\r\n0-0:96.14.0(0001)\r\n1-0:1.7.0(00.233kW)\r\n1-0:2.7.0(00.000kW)\r\n1-0:21.7.0(00.233kW)\r\n1-0:22.7.0(00.000kW)\r\n1-0:32.7.0(236.2V)\r\n1-0:31.7.0(002.04A)\r\n0-0:96.3.10(1)\r\n0-0:17.0.0(999.9kW)\r\n1-0:31.4.0(999A)\r\n0-0:96.13.0()\r\n0-1:24.1.0(003)\r\n0-1:96.1.1(xxxxxxxxxxxxxxxxxxxxxxxxxxxx)\r\n0-1:24.4.0(1)\r\n0-1:24.2.3(210204163500W)(00343.925*m3)\r\n!4133\r\n');
    //         (this.serialPort.port as MockPortBinding).emitData(telegram);
    //       })
    //     else {
    //       throw new Error("SerialPort is not an instance of SerialPortStream")
    //     }
    //   }