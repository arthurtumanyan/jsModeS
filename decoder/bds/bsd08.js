const common = require('../../common');

module.exports = () => {
    return {
        category(msg) {
            if (common().typecode(msg) < 1 || common().typecode(msg) > 4) {
                throw new Error("Not an identification message: ", msg);
            }
            let msgbin = common().hex2bin(msg);
            let mebin = msgbin.toString().slice(32, 87);
            return common().bin2int(mebin.toString().slice(5, 8));
        },
        callsign(msg) {
            if (common().typecode(msg) < 1 || common().typecode(msg) > 4) {
                throw new Error("Not an identification message: ", msg);
            }
            const chars = String("#ABCDEFGHIJKLMNOPQRSTUVWXYZ#####_###############0123456789######");
            let msgbin = common().hex2bin(msg);
            let csbin = msgbin.toString().slice(40, 96);

            let cs = String("");
            cs += chars.charAt(common().bin2int(csbin.slice(0, 6)));
            cs += chars.charAt(common().bin2int(csbin.slice(6, 12)));
            cs += chars.charAt(common().bin2int(csbin.slice(12, 18)));
            cs += chars.charAt(common().bin2int(csbin.slice(18, 24)));
            cs += chars.charAt(common().bin2int(csbin.slice(24, 30)));
            cs += chars.charAt(common().bin2int(csbin.slice(30, 36)));
            cs += chars.charAt(common().bin2int(csbin.slice(36, 42)));
            cs += chars.charAt(common().bin2int(csbin.slice(42, 48)));
            cs = cs.replace("#", "");
            return cs;
        }
    }
}