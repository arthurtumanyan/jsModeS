const common = require('../../common');

module.exports = () => {
    return {
        is45(msg){

            if(common().allzeros(msg)){
                return false;
            }
            let d = common().hex2bin(common().data(msg));
            if(common().wrongstatus(d,1,2,3)){
                return false;
            }
            if(common().wrongstatus(d, 4,5,6)){
                return false;
            }
            if(common().wrongstatus(d,7, 8, 9)){
                return false;
            }
            if(common().wrongstatus(d,10, 11, 12)){
                return false;
            }
            if(common().wrongstatus(d,13, 14, 15)){
                return false;
            }
            if(common().wrongstatus(d,16, 17, 26)){
                return false;
            }
            if(common().wrongstatus(d,27, 28, 38)){
                return false;
            }
            if(common().wrongstatus(d,39, 40, 51)){
                return false;
            }
            if(Number(common().bin2int(d.slice(51,56))) !== 0){
                return false;
            }
            let temp = this.temp45(msg);
            if(temp){
                if(temp > 60 || temp < -80){
                    return false;
                }
            }
            return true;
        },

        turb45(msg){
            let d = common().hex2bin(common().data(msg));
            if(d.charAt(0) === "0"){
                return undefined;
            }
            return common().bin2int(d.slice(1,3));
        },
        ws45(msg){
            let d = common().hex2bin(common().data(msg));
            if(d.charAt(3) === "0"){
                return undefined;
            }
            return common().bin2int(d.slice(4,6));
        },
        mb45(msg){
            let d = common().hex2bin(common().data(msg));
            if(d.charAt(6) === "0"){
                return undefined;
            }
            return common().bin2int(d.slice(7,9));
        },
        ic45(msg){
            let d = common().hex2bin(common().data(msg));
            if(d.charAt(9) === "0"){
                return false;
            }
            return common().bin2int(d.slice(10,12));
        },
        wv45(msg){
            let d = common().hex2bin(common().data(msg));
            if(d.charAt(12) === "0"){
                return undefined;
            }
            return common().bin2int(d.slice(13,15));
        },
        temp45(msg){
            let d = common().hex2bin(common().data(msg));
            let sign = parseInt(d.charAt(16));
            let value = common().bin2int(d.slice(17,26));
            if(sign){
                value = value - 512;
            }
            let temp = value * 0.25;
            return Math.round(temp);
        },
        rh45(msg){
            let d = common().hex2bin(common().data(msg));
            if(d.charAt(38) === "0"){
                return false;
            }
            return common().bin2int(d.slice(39,51));
        }
    }
}