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
        }
    }
}