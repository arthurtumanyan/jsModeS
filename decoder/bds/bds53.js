const common = require('../../common');

module.exports = () => {
    return {
        is53(msg){
            if(common().allzeros(msg)){
                return undefined;
            }
            let d = common().hex2bin(common().data(msg));
            if(common().wrongstatus(d,1,3,12)){
                return false;
            }
            if(common().wrongstatus(d,13,14,23)){
                return false;
            }
            if(common().wrongstatus(d,24,25,33)){
                return false;
            }
            if(common().wrongstatus(d,34,35,46)){
                return false;
            }
            if(common().wrongstatus(d,47,49,56)){
                return false;
            }
            let ias = this.ias53(msg);
            if(ias && ias > 500){
                return false;
            }
            let mach = this.mach53(msg);
            if(mach && mach > 1){
                return false;
            }
            let tas = this.tas53(msg);
            if(tas && tas > 500){
                return false;
            }
            let vr = this.vr53(msg);
            if(vr && Math.abs(vr) > 8000){
                return false;
            }
            return true;
        },

        hdg53(msg){
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

        ias53(msg){
            let d = common().hex2bin(common().data(msg));
            if(d.charAt(12) === "0"){
                return undefined;
            }
            return common().bin2int(d.slice(13,23));
        },

        mach53(msg){
            let d = common().hex2bin(common().data(msg));
            if(d.charAt(23) === "0"){
                return undefined;
            }
            let mach = common().bin2int(d.slice(24,33)) * 0.008;
            return Math.round(mach);
        },

        tas53(msg){
            let d = common().hex2bin(common().data(msg));
            if(d.charAt(33) === "0"){
                return undefined;
            }
            let tas = common().bin2int(d.slice(34,46)) * 0.5;
            return Math.round(tas);
        },

        vr53(msg){
            let d = common().hex2bin(common().data(msg));
            if(d.charAt(46) === "0"){
                return undefined;
            }
            let sign = parseInt(d.charAt(47)).toFixed(0);
            let value = Number(common().bin2int(d.slice(48,56)));
            if(value === 0 || value === 255){
                return 0;
            }
            if(sign){
                value = value - 256;
            }
            return value * 64;
        }
    }
}