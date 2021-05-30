const common = require('../../common');

module.exports = () => {
    return {
        is40(msg){

            if(common().allzeros(msg)){
                return false;
            }

            let d = common().hex2bin(common().data(msg));

            if(common().wrongstatus(d,1,2,13)){
                return false;
            }

            if (common().wrongstatus(d, 14, 15, 26)){
                return false;
            }

            if (common().wrongstatus(d, 27, 28, 39)){
                return false;
            }

            if (common().wrongstatus(d, 48, 49, 51)){
                return false;
            }

            if (common().wrongstatus(d, 54, 55, 56)){
                return false;
            }

            if(Number(common().bin2int(d.slice(39,47))) !== 0){
                return false;
            }

            if(Number(common().bin2int(d.slice(51,53))) !== 0){
                return false;
            }
            return true;
        },
        select40mcp(msg){
            let d = common().hex2bin(common().data(msg));
            if(d.charAt(0) === "0"){
                return undefined;
            }
            return (common().bin2int(d.slice(1,13)) * 16);
        },
        select40fms(msg){
            let d = common().hex2bin(common().data(msg));
            if(d.charAt(13) === "0"){
                return undefined;
            }
            return (common().bin2int(d.slice(14,26)) * 16);
        },
        p40baro(msg){
            let d = common().hex2bin(common().data(msg));
            if(d.charAt(26) === "0"){
                return undefined;
            }
            return (common().bin2int(d.slice(27,39)) * 0.1 + 800);
        }
    }
}