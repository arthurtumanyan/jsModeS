const common = require('../../common');

module.exports = () => {
    return {
        selected_altitude(msg) {
            let alt_source;

            if (common().typecode(msg) !== 29) {
                throw new Error("Not a target state and status message, expecting TC=29");
            }
            let mb = common().hex2bin(msg).slice(32);
            let subtype = Number(common().bin2int(mb.slice(5, 7)));
            if (subtype === 0) {
                throw new Error("ADS-B version 1 target state and status message does not contain selected altitude, use target altitude instead");
            }
            let alt = Number(common().bin2int(mb.slice(9, 20)));
            if (alt === 0) {
                alt = undefined;
            } else {
                alt = (alt - 1) * 32;
            }
            if (parseInt(mb.charAt(8)) === 0) {
                alt_source = "MCP/FCU";
            } else {
                alt_source = "FMS";
            }
            return {alt, alt_source}
        },
        target_altitude(msg) {
            let alt_source;
            let alt_ref;
            let alt;

            if (common().typecode(msg) !== 29) {
                throw new Error("Not a target state and status message, expecting TC=29");
            }
            let mb = common().hex2bin(msg).slice(32);
            let subtype = Number(common().bin2int(mb.slice(5, 7)));

            if (subtype === 1) {
                throw new Error("ADS-B version 2 target state and status message does not contain target altitude, use selected altitude instead");
            }
            let alt_avail = Number(common().bin2int(mb.slice(7, 9)));
            if (alt_avail === 0) {
                return undefined;
            } else if (alt_avail === 1) {
                alt_source = "MCP/FCU";
            } else if (alt_avail === 2) {
                alt_source = "Holding mode";
            } else {
                alt_source = "FMS/RNAV";
            }
            if (parseInt(mb.charAt(9)) === 0) {
                alt_ref = "FL";
            } else {
                alt_ref = "MSL";
            }
            alt = -1000 + common().bin2int(mb.slice(15, 25)) * 100;
            return {alt, alt_source, alt_ref}
        },
        vertical_mode(msg) {
            if (common().typecode(msg) !== 29) {
                throw new Error("Not a target state and status message, expecting TC=29");
            }
            let mb = common().hex2bin(msg).slice(32);
            let subtype = Number(common().bin2int(mb.slice(5, 7)));

            if (subtype === 1) {
                throw new Error("ADS-B version 2 target state and status message does not contain vertical mode, use vnav mode instead");
            }
            let vertical_mode = Number(common().bin2int(mb.slice(13, 15)));
            if (vertical_mode === 0) {
                return undefined;
            }
            return vertical_mode;
        },
        horizontal_mode(msg) {
            if (common().typecode(msg) !== 29) {
                throw new Error("Not a target state and status message, expecting TC=29");
            }
            let mb = common().hex2bin(msg).slice(32);
            let subtype = Number(common().bin2int(mb.slice(5, 7)));
            if (subtype === 1) {
                throw new Error("ADS-B version 2 target state and status message does not contain horizontal mode, use lnav mode instead");
            }
            let horizontal_mode = Number(common().bin2int(mb.slice(25, 27)));
            if (horizontal_mode === 0) {
                return undefined;
            }
            return horizontal_mode;
        },
        selected_heading(msg) {
            let hdg;
            let hdg_sign;
            if (common().typecode(msg) !== 29) {
                throw new Error("Not a target state and status message, expecting TC=29");
            }
            let mb = common().hex2bin(msg).slice(32);
            let subtype = Number(common().bin2int(mb.slice(5, 7)));
            if (subtype === 0) {
                throw new Error("ADS-B version 1 target state and status message does not contain selected heading, use target angle instead");
            }
            if (parseInt(mb.charAt(29)) === 0) {
                hdg = undefined;
            } else {
                hdg_sign = parseInt(mb.charAt(30));
                hdg = (hdg_sign + 1) * Number(common().bin2int(mb.slice(31, 39))) * (180 / 256);
            }
            return Math.round(hdg);
        },
        target_angle(msg) {
            let angle;
            let angle_type;
            let angle_source;

            if (common().typecode(msg) !== 29) {
                throw new Error("Not a target state and status message, expecting TC=29");
            }
            let mb = common().hex2bin(msg).slice(32);
            let subtype = Number(common().bin2int(mb.slice(5, 7)));
            if (subtype === 1) {
                throw new Error("ADS-B version 2 target state and status message does not contain target angle, use selected heading instead");
            }
            let angle_avail = Number(common().bin2int(mb.slice(25, 27)));
            if (angle_avail === 0) {
                angle = undefined;
            } else {
                angle = Number(common().bin2int(mb.slice(27, 36)));
                if (angle_avail === 1) {
                    angle_source = "MCP/FCU";
                } else if (angle_avail === 2) {
                    angle_source = "Autopilot mode";
                } else {
                    angle_source = "FMS/RNAV";
                }
                if (parseInt(mb.charAt(36))) {
                    angle_type = "Heading";
                } else {
                    angle_type = "Track";
                }
            }
            return {angle, angle_type, angle_source}
        },
        baro_pressure_setting(msg) {
            if (common().typecode(msg) !== 29) {
                throw new Error("Not a target state and status message, expecting TC=29");
            }
            let mb = common().hex2bin(msg).slice(32);
            let subtype = Number(common().bin2int(mb.slice(5, 7)));
            if (subtype === 0) {
                throw new Error("ADS-B version 1 target state and status message does not contain barometric pressure setting");
            }
            let baro = Number(common().bin2int(mb.slice(20, 29)));
            if (baro === 0) {
                baro = undefined;
            } else {
                baro = 800 + (baro - 1) * 0.8;
            }
            return Math.round(baro);
        },

        autopilot(msg) {
            let autopilot;
            if (common().typecode(msg) !== 29) {
                throw new Error("Not a target state and status message, expecting TC=29");
            }
            let mb = common().hex2bin(msg).slice(32);
            let subtype = Number(common().bin2int(mb.slice(5, 7)));
            if (subtype === 0) {
                throw new Error("ADS-B version 1 target state and status message does not contain autopilot engagement");
            }
            if (parseInt(mb.charAt(46)) === 0) {
                return undefined;
            }
            autopilot = parseInt(mb.charAt(47)) === 1;
            return autopilot;
        },
        vnav_mode(msg) {
            let vnav_mode;
            if (common().typecode(msg) !== 29) {
                throw new Error("Not a target state and status message, expecting TC=29");
            }
            let mb = common().hex2bin(msg).slice(32);
            let subtype = Number(common().bin2int(mb.slice(5, 7)));
            if (subtype === 0) {
                throw new Error("ADS-B version 1 target state and status message does not contain vnav mode, use vertical mode instead");
            }
            if (parseInt(mb.charAt(46)) === 0) {
                return undefined;
            }
            vnav_mode = parseInt(mb.charAt(48)) === 1;
            return vnav_mode;
        },
        altitude_hold_mode(msg){
            let alt_hold_mode;
            if(common().typecode(msg) !== 29){
                throw new Error("Not a target state and status message, expecting TC=29");
            }
            let mb = common().hex2bin(msg).slice(32);
            let subtype = Number(common().bin2int(mb.slice(5,7)));
            if(subtype === 0){
                throw new Error("ADS-B version 1 target state and status message does not contain altitude hold mode");
            }
            if(parseInt(mb.charAt(46)) === 0){
                return undefined;
            }
            alt_hold_mode = parseInt(mb.charAt(49)) === 1;
            return alt_hold_mode;
        },
        approach_mode(msg){
            let app_mode;
            if(common().typecode(msg) !== 29){
                throw new Error("Not a target state and status message, expecting TC=29");
            }
            let mb = common().hex2bin(msg).slice(32);
            let subtype = Number(common().bin2int(mb.slice(5,7)));
            if(subtype === 0){
                throw new Error("ADS-B version 1 target state and status message does not contain approach mode");
            }
            if(parseInt(mb.charAt(46)) === 0){
                return undefined;
            }
            app_mode = parseInt(mb.charAt(51)) === 1;
            return app_mode;
        },
        lnav_mode(msg){
            let lnav_mode;
            if(common().typecode(msg) !== 29){
                throw new Error("Not a target state and status message, expecting TC=29");
            }
            let mb = common().hex2bin(msg).slice(32);
            let subtype = Number(common().bin2int(mb.slice(5,7)));
            if(subtype === 0){
                throw new Error("ADS-B version 1 target state and status message does not contain lnav mode, use horizontal mode instead");
            }
            if(parseInt(mb.charAt(46)) === 0){
                return undefined;
            }
            lnav_mode = parseInt(mb.charAt(53)) === 1;
            return lnav_mode;
        },
        tcas_operational(msg){
            let tcas;
            if(common().typecode(msg) !== 29){
                throw new Error("Not a target state and status message, expecting TC=29");
            }
            let mb = common().hex2bin(msg).slice(32);
            let subtype = Number(common().bin2int(mb.slice(5,7)));
            if(subtype === 0){
                tcas = parseInt(mb.charAt(51)) === 0;
            }else{
                tcas = parseInt(mb.charAt(52)) === 1;
            }
            return tcas;
        },
        tcas_ra(msg){
            if(common().typecode(msg) !== 29){
                throw new Error("Not a target state and status message, expecting TC=29");
            }
            let mb = common().hex2bin(msg).slice(32);
            let subtype = Number(common().bin2int(mb.slice(5,7)));
            if(subtype === 1){
                throw new Error("ADS-B version 2 target state and status message does not contain TCAS/ACAS RA");
            }
            return parseInt(mb.charAt(52) === 1);
        },
        emergency_status(msg){
            if(common().typecode(msg) !== 29){
                throw new Error("Not a target state and status message, expecting TC=29");
            }
            let mb = common().hex2bin(msg).slice(32);
            let subtype = Number(common().bin2int(mb.slice(5,7)));
            if(subtype === 1){
                throw new Error("ADS-B version 2 target state and status message does not contain emergency status");
            }
            return Number(common().bin2int(mb.slice(53,56)));
        },
    }
}