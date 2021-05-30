const common = require('../../common');

module.exports = () => {
    return {
        is_emergency(msg) {
            if (common().typecode(msg) !== 28) {
                throw new Error("Not an airborne status message, expecting TC=28 ", msg);
            }
            let mb = common().hex2bin(msg).slice(32);
            let subtype = Number(common().bin2int(mb.slice(5, 8)));

            if (subtype === 2) {
                throw new Error("Emergency message is ACAS-RA, not implemented");
            }

            let emergency_state = Number(common().bin2int(mb.slice(8, 11)));
            if (subtype === 1 && emergency_state === 1) {
                return true;
            } else {
                return false;
            }
        },
        emergency_state(msg) {
            let mb = common().hex2bin(msg).slice(32);
            let subtype = Number(common().bin2int(mb.slice(5, 8)));
            if (subtype === 2) {
                throw new Error("Emergency message is ACAS-RA, not implemented");
            }
            return common().bin2int(mb.slice(8, 11));
        },
        emergency_squawk(msg) {
            if (common().typecode(msg) !== 28) {
                throw new Error("Not an airborne status message, expecting TC=28");
            }
            let msgbin = common().hex2bin(msg);
            let idcode = msgbin.slice(43, 49) + "0" + msgbin.slice(49, 55);
            return common().squawk(idcode);
        }
    }
}