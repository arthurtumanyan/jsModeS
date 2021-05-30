const common = require('../common');
module.exports = () => {
    return {
        icao(msg) {
            return common().icao(msg);
        },
        interrogator(msg) {
            let IC;
            let reminder = common().crc(msg);
            if (reminder > 79) {
                IC = "corrupt IC";
            } else if (reminder < 16) {
                IC = "II" + reminder.toString();
            } else {
                IC = "SI" + (reminder - 16).toString();
            }
            return IC;
        },
        capability(msg){
            let text = undefined;
            let msgbin = common().hex2bin(msg);
            let ca = Number(common().bin2int(msgbin.slice(5,8)));
            if(ca === 0){
                text = "level 1 transponder";
            }else if(ca === 4){
                text = "level 2 transponder, ability to set CA to 7, on ground";
            }else if(ca === 5){
                text = "level 2 transponder, ability to set CA to 7, airborne";
            }else if(ca === 6){
                text = "evel 2 transponder, ability to set CA to 7, either airborne or ground";
            }else if(ca === 7){
                text = "Downlink Request value is 0,or the Flight Status is 2, 3, 4 or 5, either airborne or on the ground"
            }
            return {ca ,text};
        },
    }
}