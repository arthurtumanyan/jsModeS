const common = require('../../common');

module.exports = () => {
    return {
        is60(msg) {
            if (common().allzeros(msg)) {
                return false;
            }
            let d = common().hex2bin(common().data(msg));
            if (common().wrongstatus(d, 1, 2, 12)) {
                return false;
            }
            if (common().wrongstatus(d, 13, 14, 23)) {
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
            let ias = this.ias60(msg);
            if (ias && ias > 500) {
                return false;
            }
            let mach = this.mach60(msg);
            if (mach && mach > 1) {
                return false;
            }
            let vr_baro = this.vr_60baro(msg);
            if (vr_baro && Math.abs(vr_baro) > 6000) {
                return false;
            }
            let vr_ins = this.vr60ins(msg);
            if (vr_ins && Math.abs(vr_ins) > 6000) {
                return false;
            }
            if (mach && ias && (common().df(msg) === 20)) {
                let alt = common().altcode(msg);
                if (alt) {
                    let ias_ = aero.mach2cas(mach, alt * aero.ft) / aero.kts;
                    if(Math.abs(ias - ias_) > 20){
                        return false;
                    }
                }
            }
            return true;
        },
        hdg60(msg){
            let d = common().hex2bin(common().data(msg));
            if(d.charAt(0) === "0"){
                return undefined;
            }
            let sign = parseInt(d.charAt(1)).toFixed(0);
            let value = common().bin2int(d.slice(2,12));
            if(sign){
                value = value - 1024;
            }
            let hdg = value * 90 / 512;
            if(hdg < 0){
                hdg = 360 + hdg;
            }
            return Math.round(hdg);
        },
        ias60(msg){
            let d = common().hex2bin(common().data(msg));
            if(d.charAt(12) === "0"){
                return undefined;
            }
            return common().bin2int(d.slice(13,23));
        },
        mach60(msg){
            let d = common().hex2bin(common().data(msg));
            if(d.charAt(23) === "0"){
                return undefined;
            }
            let mach = common().bin2int(d.slice(24,34) * 2.048 / 512.0);
            return round(mach);
        },
        vr60baro(msg){
            let d = common().hex2bin(common().data(msg));
            if(d.charAt(34) === "0"){
                return undefined;
            }
            let sign = parseInt(d.charAt(35)).toFixed(0);
            let value = Number(common().bin2int(d.slice(36,45)));
            if(value === 0 || value === 511){
                return 0
            }
            if(sign){
                value = value - 512;
            }
            return value * 32;
        },
        vr60ins(msg){
            let d = common().hex2bin(common().data(msg));
            if(d.charAt(45) === "0"){
                return undefined;
            }
            let sign = parseInt(d.charAt(46)).toFixed(0);
            let value = Number(common().bin2int(d.slice(47,56)));
            if(value === 0 || value === 511){
                return 0;
            }
            if(sign){
                value = value - 512;
            }
            return value * 32;
        }

    }
}