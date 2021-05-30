const common = require('../../common');

module.exports = () => {
    return {
        is30(msg){
            if(common().allzeros(msg)){
                return false;
            }
            let d = common().hex2bin(common().data(msg));
            if(d.slice(0,8) !== "00110000"){
                return false;
            }
            if(d.slice(28,30) === "11"){
                return false;
            }
            if(common().bin2int(d.slice(15,22)) >= 48){
                return false;
            }
            return true;
        },
    }
}