const common = require('../../common');

module.exports = () => {
    return {
        is50(msg) {
            if (common().allzeros(msg)) {
                return false;
            }
            let d = common().hex2bin(common().data(msg));
            if (common().wrongstatus(d, 1, 3, 11)) {
                return false;
            }
            if (common().wrongstatus(d, 12, 13, 23)) {
                return false;
            }
            if (common().wrongstatus(d, 24, 25, 34)) {
                return false;
            }
            if (common().wrongstatus(d, 35, 36, 45)) {
                return false;
            }
            if (common().wrongstatus(d, 46, 47, 56)) {
                return false;
            }

            let roll = this.roll50(msg);
            if (roll && Math.abs(roll) > 50) {
                return false;
            }

            let gs = this.gs50(msg);
            if (gs && gs > 600) {
                return false;
            }

            let tas = this.tas50(msg);
            if (tas && tas > 500) {
                return false;
            }

            if (gs && tas && (Math.abs(tas - gs) > 200)) {
                return false;
            }
            return true;
        },
        roll50(msg) {
            let d = common().hex2bin(common().data(msg));
            if (d.charAt(0) === "0") {
                return undefined;
            }
            let sign = parseInt(d.charAt(1));
            let value = common().bin2int(d.slice(2, 11));
            if (sign) {
                value = value - 512;
            }
            let angle = value * 45 / 256;
            return Math.round(angle);
        },
        trk50(msg) {
            let d = common().hex2bin(common().data(msg));
            if (d.charAt(11) === "0") {
                return undefined;
            }
            let sign = parseInt(d.charAt(12));
            let value = common().bin2int(d.slice(13, 23));
            if (sign) {
                value = value - 1024;
            }
            let trk = value * 90 / 512.0;
            if (trk < 0) {
                trk = 360 + trk;
            }
            return Math.round(trk);
        },
        gs50(msg) {
            let d = common().hex2bin(common().data(msg));
            if (d.charAt(23) === "0") {
                return undefined;
            }
            return common().bin2int(d.slice(24,34)) * 2;
        },
        rtrk50(msg){
            let d = common().hex2bin(common().data(msg));
            if (d.charAt(34) === "0") {
                return undefined;
            }
            if (d.slice(36,45) === "111111111"){
                return undefined;
            }
            let sign = parseInt(d.charAt(35));
            let value = common().bin2int(d.slice(36,45));
            if(sign){
                value = value - 512;
            }
            let angle = value * 8 / 256;
            return Math.round(angle);
        },
        tas50(msg){
            let d = common().hex2bin(common().data(msg));
            if(d.charAt(45) === "0"){
                return undefined;
            }
            return common().bin2int(d.slice(46,56)) * 2;
        }
    }
}