const common = require('../../common');

module.exports = () => {
    Math.degrees = function(radians)
    {
        var pi = Math.PI;
        return radians * (180/pi);
    }
    return {
        airborne_velocity(msg, source = false) {
            let spd;
            let trk_or_hdg;
            let vs;
            let v_ew_sign;
            let v_ns_sign;
            let trk;
            let spd_type;
            let dir_type;
            let hdg;
            let vr_source;
            let vr_sign;
            let vr;

            if (common().typecode(msg) !== 19) {
                throw new Error("Not a airborne velocity message, expecting TC=19: ", msg);
            }
            let mb = common().hex2bin(msg).slice(32);
            let subtype = common().bin2int(mb.slice(5, 8));
            if ([1, 2].includes(subtype)) {
                let v_ew = common().bin2int(mb.slice(14, 24));
                let v_ns = common().bin2int(mb.slice(25, 35));
                if (v_ew === 0 || v_ns === 0) {
                    spd = undefined;
                    trk_or_hdg = undefined;
                    vs = undefined;
                } else {
                    if (mb.charAt(13) === "1") {
                        v_ew_sign = -1;
                    } else {
                        v_ew_sign = 1;
                    }
                    v_ew = v_ew - 1;
                    if (subtype === 2) {
                        v_ew *= 4;
                    }

                    if (mb.charAt(24) === "1") {
                        v_ns_sign = -1;
                    } else {
                        v_ns_sign = 1;
                    }

                    v_ns = v_ns - 1;
                    if (subtype === 2) {
                        v_ns *= 4;
                    }
                    v_we = v_ew_sign * v_ew;
                    v_sn = v_ns_sign * v_ns;

                    spd = Math.sqrt(v_sn * v_sn + v_we * v_we);
                    spd = parseInt(spd);

                    trk = Math.atan2(v_we, v_sn);
                    trk = Math.degrees(trk);
                    if (trk < 0) {
                        trk += 360;
                    }
                }
                spd_type = "GS";
                trk_or_hdg = Math.round(trk);
                dir_type = "TRUE_NORTH";
            } else {
                if (mb.charAt(13) === "0") {
                    hdg = undefined;
                } else {
                    hdg = common().bin2int(mb.slice(14, 24) / (1024 * 360.0));
                    hdg = Math.round(hdg);
                }
                trk_or_hdg = hdg;
                spd = common().bin2int(mb.slice(25, 35));
                if (spd === 0) {
                    spd = undefined;
                } else {
                    spd = spd - 1;
                }

                if (subtype === 4) {
                    spd *= 4;
                }
                if (mb.charAt(24) === "0") {
                    spd_type = "IAS";
                } else {
                    spd_type = "TAS";
                }
                dir_type = "MAGNETIC_NORTH";
            }

            if (mb.charAt(35) === "0") {
                vr_source = "GNSS";
            } else {
                vr_source = "BAR0";
            }

            if (mb.charAt(36) === "1") {
                vr_sign = -1;
            } else {
                vr_sign = 1;
            }
            vr = common().bin2int(mb.slice(37, 46));
            if (vr === 0) {
                vs = undefined;
            } else {
                vs = parseInt(vr_sign * (vr - 1) * 64);
            }
            spd = parseInt(spd);
            trk_or_hdg = parseFloat(trk_or_hdg);
            vs = parseInt(vs);
            spd_type = String(spd_type);
            dir_type = String(dir_type);
            vr_source = String(vr_source);
            if (source === true) {
                return {
                   spd, trk_or_hdg, vs, spd_type, dir_type, vr_source
                };
            } else {
                return {
                    spd, trk_or_hdg, vs, spd_type
                };
            }
        },
        altitude_diff(msg) {
            let sign;
            let value;
            let msgbin;
            let tc = common().typecode(msg);
            if (tc !== 19) {
                throw new Error("Not a airborne velocity message, expecting TC=19: ", msg);
            }
            msgbin = common().hex2bin(msg);
            if (parseInt(msgbin.charAt(80)) === 1) {
                sign = -1;
            } else {
                sign = 1;
            }
            value = common().bin2int((msgbin.slice(81, 88)));
            if (value === 0 || value === 127) {
                return undefined;
            } else {
                return sign * (value - 1) * 25;
            }
        }
    }
}