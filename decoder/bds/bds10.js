const common = require('../../common');

module.exports = () => {
    return {
        is10(msg) {
            if (common().allzeros(msg)) {
                return false;
            }
            let d = common().hex2bin(common().data(msg));
            if (d.slice(0, 8) !== "00010000") {
                return false;
            }
            if (common().bin2int(d.slice(9, 14)) !== 0) {
                return false;
            }
            if (d.charAt(14) === "1" && common().bin2int(d.slice(16, 23)) < 5) {
                return false;
            }
            if (d.charAt(14) === "0" && common().bin2int(d.slice(16, 23)) > 4) {
                return false;
            }
            return true;
        },
        ovc10(msg){
            let d = common().hex2bin(common().data(msg));
            return parseInt(d.charAt(14));
        }
    }
}