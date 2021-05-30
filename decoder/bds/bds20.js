const common = require('../../common');

module.exports = () => {
    return {
        is20(msg) {
            if (common().allzeros(msg)) {
                return false;
            }
            let d = common().hex2bin(common().data(msg));
            if (d.slice(0, 8) !== "00100000") {
                return false;
            }
            let cs = this.cs20(msg);
            if (cs.includes("#")) {
                return false;
            }
            return true;
        },
        cs20(msg) {
            let chars = String("#ABCDEFGHIJKLMNOPQRSTUVWXYZ#####_###############0123456789######");
            let d = common().hex2bin(common().data(msg));
            let cs = String("");
            cs += chars.charAt(common.bin2int(d.slice(8,14)));
            cs += chars.charAt(common.bin2int(d.slice(14,20)));
            cs += chars.charAt(common.bin2int(d.slice(20,26)));
            cs += chars.charAt(common.bin2int(d.slice(26,32)));
            cs += chars.charAt(common.bin2int(d.slice(32,38)));
            cs += chars.charAt(common.bin2int(d.slice(38,44)));
            cs += chars.charAt(common.bin2int(d.slice(44,50)));
            cs += chars.charAt(common.bin2int(d.slice(50,56)));

            return cs;
        }
    }
}