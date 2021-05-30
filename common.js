"use strict"
const is_close = require("is-close");

module.exports = () => {
    return {
        hex2bin(hextstr) {
            let splitted = hextstr.split('');
            let hex2binstr = String("");
            for (let pos = 0; pos < splitted.length; pos += 2) {
                let binary = parseInt((splitted[pos] + splitted[pos + 1]), 16).toString(2).padStart(8, 0);
                hex2binstr += binary;
            }
            return hex2binstr;
        },
        hex2int(hexstr) {
            return parseInt(hexstr, 16).toFixed(0);
        },
        bin2int(binstr) {
            return parseInt(binstr, 2).toFixed(0);
        },
        bin2hex(binstr) {
            let splitted = binstr.split('');
            let bin2hexstr = String("");
            for (let pos = 0; pos < binstr.length; pos += 8) {
                let hex = parseInt(splitted[pos] + splitted[pos + 1] + splitted[pos + 2] + splitted[pos + 3] + splitted[pos + 4] + splitted[pos + 5] + splitted[pos + 6] + splitted[pos + 7], 2).toString(16).toUpperCase();
                bin2hexstr += hex;
            }
            return bin2hexstr;
        },
        df(msg) {
            let dfbin = this.hex2bin(msg.toString().slice(0, 2));
            return Math.min(this.bin2int(dfbin.slice(0, 5)), 24);
        },
        wrap(msgbin, width) {
            let wlist = [];
            let splitted = msgbin.split('');
            for (let pos = 0; pos < msgbin.length; pos += width) {
                let digit = this.bin2int(splitted[pos] + splitted[pos + 1] + splitted[pos + 2] + splitted[pos + 3] + splitted[pos + 4] + splitted[pos + 5] + splitted[pos + 6] + splitted[pos + 7]);
                wlist.push(digit);
            }
            return wlist;
        },
        crc(msg, encode) {

            const G_1 = parseInt("11111111", 2);
            const G_2 = parseInt("11111010", 2);
            const G_3 = parseInt("00000100", 2);
            const G_4 = parseInt("10000000", 2);

            const G = [G_1, G_2, G_3, G_4];

            if (!encode) {
                encode = false;
            }

            if (encode === true) {
                msg = msg.toString().slice(0, -6) + "000000";
            }

            let msgbin = this.hex2bin(msg);
            let mbytes = this.wrap(msgbin, 8);

            for (let ibyte = 0; ibyte < mbytes.length - 3; ibyte++) {
                for (let ibit = 0; ibit < 8; ibit++) {
                    let mask = 0x80 >> ibit;
                    let bits = mbytes[ibyte] & mask;

                    if (bits > 0) {
                        mbytes[ibyte] = mbytes[ibyte] ^ (G[0] >> ibit);
                        mbytes[ibyte + 1] = mbytes[ibyte + 1] ^ (
                            0xFF & ((G[0] << 8 - ibit) | (G[1] >> ibit))
                        )
                        mbytes[ibyte + 2] = mbytes[ibyte + 2] ^ (
                            0xFF & ((G[1] << 8 - ibit) | (G[2] >> ibit))
                        )
                        mbytes[ibyte + 3] = mbytes[ibyte + 3] ^ (
                            0xFF & ((G[2] << 8 - ibit) | (G[3] >> ibit))
                        )
                    }
                }
            }

            let first = mbytes[mbytes.length - 3];
            let second = mbytes[mbytes.length - 2];
            let third = mbytes[mbytes.length - 1];
            return (first << 16) | (second << 8) | third
        },
        floor(x) {
            return Math.floor(x);
        },
        icao(msg) {
            let addr = String("");
            let DF = this.df(msg);
            if ([11, 17, 18].includes(DF)) {
                addr = msg.toString().slice(2, 8);
            } else if ([0, 4, 5, 16, 20, 21].includes(DF)) {
                let c0 = this.crc(msg, true);
                let c1 = parseInt(msg.toString().slice(-6), 16);
                addr = Number(c0 ^ c1).toString();
            }
            return addr;
        },
        is_icao_assigned(icao) {
            if (typeof icao !== 'string' || icao.length !== 6) {
                return false;
            }
            let icaoint = parseInt(icao, 16);

            if (0x200000 < icaoint && icaoint < 0x27FFFF) {
                return false;  /* AFI */
            }

            if (0x280000 < icaoint && icaoint < 0x28FFFF) {
                return false;  /* SAM */
            }

            if (0x500000 < icaoint && icaoint < 0x5FFFFF) {
                return false;  /* EUR, NAT */
            }

            if (0x600000 < icaoint && icaoint < 0x67FFFF) {
                return false;  /* MID */
            }

            if (0x680000 < icaoint && icaoint < 0x6F0000) {
                return false;  /* ASIA */
            }

            if (0x900000 < icaoint && icaoint < 0x9FFFFF) {
                return false;  /* NAM, PAC */
            }

            if (0xB00000 < icaoint && icaoint < 0xBFFFFF) {
                return false;  /* CAR */
            }

            if (0xD00000 < icaoint && icaoint < 0xDFFFFF) {
                return false;  /* future */
            }

            if (0xF00000 < icaoint && icaoint < 0xFFFFFF) {
                return false;  /* future */
            }
            return true;
        },
        typecode(msg) {
            let DF = this.df(msg);
            if (!([17, 18].includes(DF))) {
                return undefined;
            }
            let tcbin = this.hex2bin(msg.toString().slice(8, 10));
            return this.bin2int(tcbin.slice(0, 5));
        },
        cprNL(lat) {
            const nz = 15;
            if (is_close.isClose(lat, 0)) {
                return 59;
            } else if (is_close.isClose(Math.abs(lat), 87)) {
                return 2;
            } else if (lat > 87 || lat < -87) {
                return 1;
            }
            let a = 1 - Math.cos(Math.PI / (2 * nz));
            let b = Math.cos(Math.PI / 180 * Math.abs(lat)) ** 2;
            let nl = 2 * Math.PI / (Math.acos(1 - a / b));
            return Math.floor(nl);
        },
        squawk(binstr) {
            if (binstr.toString().length !== 13) {
                throw new Error("Input must be 13 bits binary string");
            }

            binstr = binstr.toString().split('');

            let C1 = binstr[0];
            let A1 = binstr[1];
            let C2 = binstr[2];
            let A2 = binstr[3];
            let C4 = binstr[4];
            let A4 = binstr[5];
            let B1 = binstr[7];
            let D1 = binstr[8];
            let B2 = binstr[9];
            let D2 = binstr[10];
            let B4 = binstr[11];
            let D4 = binstr[12];

            let byte1 = parseInt(A4 + A2 + A1, 2)
            let byte2 = parseInt(B4 + B2 + B1, 2)
            let byte3 = parseInt(C4 + C2 + C1, 2)
            let byte4 = parseInt(D4 + D2 + D1, 2)

            return String(byte1) + String(byte2) + String(byte3) + String(byte4);
        },
        idcode(msg) {
            let DF = this.df(msg);
            if (!([5, 21].includes(DF))) {
                throw new Error("Message must be Downlink Format 5 or 21.");
            }
            let mbin = this.hex2bin(msg);
            let idcodebin = mbin.slice(19, 32);
            return this.squawk(idcodebin);
        },
        altcode(msg) {
            let alt;
            let DF = this.df(msg);
            if (!([0, 4, 16, 20].includes(DF))) {
                throw new Error("Message must be Downlink Format 0, 4, 16, or 20.");
            }
            let mbin = this.hex2bin(msg);
            let altitude_code = mbin.slice(19, 32);
            alt = this.altitude(altitude_code);

            return alt
        },
        altitude(binstr) {
            let alt, vbin;
            if (binstr.toString().length !== 13) {
                throw new Error("Input must be 13 bits binary string");
            }

            let Mbit = binstr.toString().charAt(6);
            let Qbit = binstr.toString().charAt(8);

            if (Number(this.bin2int(binstr)) === 0) {
                alt = undefined;
            } else if (Mbit === "0") {
                if (Qbit === "1") {
                    vbin = binstr.slice(0, 6) + binstr.toString().charAt(7) + binstr.toString().slice(9);
                    alt = this.bin2int(vbin) * 25 - 1000;
                }
                if (Qbit === "0") {
                    let C1 = binstr[0];
                    let A1 = binstr[1];
                    let C2 = binstr[2];
                    let A2 = binstr[3];
                    let C4 = binstr[4];
                    let A4 = binstr[5];
                    let B1 = binstr[7];
                    let B2 = binstr[9];
                    let D2 = binstr[10];
                    let B4 = binstr[11];
                    let D4 = binstr[12];

                    let graystr = D2 + D4 + A1 + A2 + A4 + B1 + B2 + B4 + C1 + C2 + C4;
                    alt = this.gray2alt(graystr);
                }
            }
            if (Mbit === "1") {
                vbin = binstr.slice(0, 6).toString() + binstr.slice(7).toString();
                alt = parseInt(this.bin2int(vbin) * 3.28084);
            }
            return alt;
        },
        gray2alt(binstr) {
            let gc500 = binstr.toString().slice(0, 8);
            let n500 = this.gray2int(gc500);
            let gc100 = binstr.toString().slice(8);
            let n100 = this.gray2int(gc100);

            if ([0, 5, 6].includes(n100)) {
                return undefined;
            }

            if (Number(n100) === 7) {
                n100 = 5;
            }


            if (n500 % 2) {
                n100 = 6 - n100;
            }
            return (n500 * 500 + n100 * 100) - 1300;
        },
        gray2int(binstr) {
            let num = this.bin2int(binstr)
            num ^= num >> 8
            num ^= num >> 4
            num ^= num >> 2
            num ^= num >> 1
            return num
        },
        data(msg) {
            return msg.toString().slice(8, -6);
        },
        allzeros(msg) {
            let d = this.hex2bin(this.data(msg));
            if (this.bin2int(d) > 0) {
                return false;
            } else {
                return true;
            }
        },
        wrongstatus(data, sb, msb, lsb) {
            let status = parseInt(data.toString().charAt(sb - 1));
            let value = this.bin2int(data.toString().slice(msb - 1, lsb));
            if(!status){
                if(Number(value) !== 0){
                    return true;
                }
            }
            return false;
        },
    }
}