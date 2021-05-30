const common = require('../../common');

module.exports = () => {
    return {
        is44(msg) {
            if (common().allzeros()) {
                return false;
            }
            let d = common().hex2bin(common().data(msg));
            if (common().wrongstatus(d, 5, 6, 23)) {
                return false;
            }
            if (common().wrongstatus(d, 35, 36, 46)) {
                return false;
            }
            if (common().wrongstatus(d, 47, 48, 49)) {
                return false;
            }
            if (common().wrongstatus(d, 50, 51, 56)) {
                return false;
            }
            if (common().bin2int(d.slice(0, 4)) > 4) {
                return false;
            }

            let {speed, direction} = this.wind44(msg);
            if (speed && speed > 250) {
                return false;
            }
            let {temp, temp2} = this.temp44(msg);
            if (Math.min(temp, temp2) > 60 || Math.max(temp, temp2) < -80) {
                return false;
            }
            return true;
        },

        wind44(msg) {
            let d = common().hex2bin(common().data(msg));
            let status = parseInt(d.charAt(4));
            if (!status) {
                return {undefined, undefined}
            }

            let speed = Math.round(common().bin2int(d.slice(5, 14)));
            let direction = Math.round(common().bin2int(d.slice(14, 23)) * 180 / 256);
            return {
                speed, direction
            }
        },
        temp44(msg) {
            let d = common().hex2bin(common().data(msg));
            let sign = parseInt(d.charAt(23));
            let value = common().bin2int(d.slice(24, 34));
            if (sign) {
                value = value - 1024;
            }
            let temp = value * 0.25;
            temp = Math.round(temp);

            let temp_alternative = value * 0.125;
            temp_alternative = Math.round(temp_alternative);

            return {temp, temp_alternative};
        },
        p44(msg) {
            let d = common().hex2bin(common().data(msg));
            if (d.charAt(34) === "0") {
                return undefined;
            }
            return common().bin2int(d.slice(35, 46));
        },
        hum44(msg) {
            let d = common().hex2bin(common().data(msg));
            if (d.charAt(49) === "0") {
                return undefined;
            }
            return round(common().bin2int(d.slice(50, 56)) * 100 / 64);
        },
        turb44(msg) {
            let d = common().hex2bin(common().data(msg));
            if (d.charAt(46) === "0") {
                return undefined;
            }
            return common().bin2int(d.slice(47, 49));
        }
    }
}