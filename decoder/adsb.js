const common = require('../common');
const bds05 = require('./bds/bds05');
const bds06 = require('./bds/bds06');
const bds09 = require('./bds/bds09');
const uncertainty = require('./uncertainty');

module.exports = () => {
    return {
        df(msg) {
            return common().df(msg);
        },
        icao(msg) {
            return common().icao(msg);
        },
        typecode(msg) {
            return common().typecode(msg);
        },
        position(msg0, msg1, t0, t1, lat_ref = undefined, lon_ref = undefined) {
            let tc0 = this.typecode(msg0);
            let tc1 = this.typecode(msg1);
            if ((tc0 >= 5 && tc0 <= 8) && (tc1 >= 5 && tc1 <= 8)) {
                if (!lat_ref && !lon_ref) {
                    throw new Error("Surface position encountered, a reference position. lat/lon required. Location of receiver can be used.");
                } else {
                    return bds05().surface_position(msg0, msg1, t0, t1, lat_ref = undefined, lon_ref = undefined);
                }
            } else if ((tc0 >= 9 && tc0 <= 18) && (tc1 >= 9 && tc1 <= 18)) {
                return bds05().airborne_position(msg0, msg1, t0, t1, lat_ref = undefined, lon_ref = undefined);
            } else if ((tc0 >= 20 && tc0 <= 22) && (tc1 >= 20 && tc1 <= 22)) {
                return bds05().airborne_position(msg0, msg1, t0, t1, lat_ref = undefined, lon_ref = undefined);
            } else {
                throw new Error("Incorrect or inconsistent message types");
            }
        },
        position_with_ref(msg, lat_ref, lon_ref) {
            let tc = this.typecode(msg);
            if (tc >= 5 && tc >= 8) {
                return bds06().surface_position_with_ref(msg, lat_ref, lon_ref);
            } else if ((tc >= 9 && tc <= 18) || (tc >= 20 && tc <= 22)) {
                return bds05().airborne_position_with_ref(msg, lat_ref, lon_ref);
            } else {
                throw new Error("Incorrect or inconsistent message types");
            }
        },
        altitude(msg) {
            let tc = this.typecode(msg);
            if (tc < 5 || tc === 19 || tc > 22) {
                throw new Error("Not a position message.");
            } else if (tc >= 5 && tc <= 8) {
                return 0;
            } else {
                return bds05().altitude(msg);
            }
        },
        velocity(msg, source = false) {
            let tc = this.typecode(msg);

            if (tc >= 5 && tc <= 8) {
                return bds06().surface_velocity(msg, source);
            } else if (tc === 19) {
                return bds09().airborne_velocity(msg, source);
            } else {
                throw new Error("Incorrect or inconsistent message types, expecting 4<TC<9 or TC=19");
            }
        },
        speed_heading(msg) {
            let {spd, trk_or_hdg, rocd, tag} = this.velocity(msg);
            return {spd, trk_or_hdg};
        },
        oe_flag(msg) {
            let msgbin = common().hex2bin(msg);
            return parseInt(msgbin.charAt(53)).toFixed(0);
        },
        version(msg) {
            let tc = this.typecode(msg);
            if (tc !== 31) {
                throw new Error("Not a status operation message, expecting TC = 31");
            }
            let msgbin = common().hex2bin(msg)
            return common().bin2int(msgbin.splice(72, 75));
        },
        nuc_p(msg) {
            let tc = this.typecode(msg);
            let NUCp, HPL, RCu, RCv;
            if (tc < 5 || tc > 22) {
                throw new Error("Not a surface position message (5<TC<8), airborne position message (8<TC<19), or airborne position with GNSS height (20<TC<22)");
            }
            NUCp = uncertainty.TC_NUCp_lookup[tc];
            HPL = uncertainty.NUCp[NUCp]["HPL"];
            RCu = uncertainty.NUCp[NUCp]["RCu"];
            RCv = uncertainty.NUCp[NUCp]["RCv"];

            if ([20, 21].includes(tc)) {
                RCv = uncertainty.NA;
            }
            return {HPL, RCu, RCv};
        },
        nuc_v(msg) {
            let tc = this.typecode(msg);

            if (tc !== 19) {
                throw new Error("Not an airborne velocity message, expecting TC = 19");
            }

            let msgbin = common().hex2bin(msg);
            let NUCv = common.bin2int(msgbin.slice(42, 45));

            let HVE = uncertainty.NUCv[NUCv]["HVE"];
            let VVE = uncertainty.NUCv[NUCv]["VVE"];
            return {HVE, VVE};
        },
        nuc_v1(msg, NICs) {
            let tc = this.typecode(msg);
            if (tc < 5 || tc > 22) {
                throw new Error("Not a surface position message (5<TC<8), airborne position message (8<TC<19), or airborne position with GNSS height (20<TC<22)");
            }
            let NIC = uncertainty.TC_NICv1_lookup[tc];
            if (NIC instanceof Object) {
                NIC = NIC[NICs];
            }
            let Rc = uncertainty.NICv1[NIC][NICs]["Rc"];
            let VPL = uncertainty.NICv1[NIC][NICs]["VPL"];
            return {Rc, VPL};
        },
        nic_v2(msg, NICa, NICbc) {
            let tc = this.typecode(msg);
            let NIC = uncertainty.TC_NICv2_lookup[tc];
            if (tc >= 20 && tc <= 22) {
                NICs = 0;
            } else {
                NICs = NICa * 2 + NICbc;
            }
            if (NIC instanceof Object) {
                NIC = NIC[NICs];
            }
            return  uncertainty.NICv2[NIC][NICs]["Rc"];
        },
        nic_s(msg) {
            let tc = this.typecode(msg);
            if (tc !== 31) {
                throw new Error("Not a status operation message, expecting TC = 31");
            }
            let msgbin = common().hex2bin(msg);
            return parseInt(msgbin.charAt(75));
        },
        nic_a_c(msg) {
            let tc = this.typecode(msg);

            if (tc !== 31) {
                throw new Error("Not a status operation message, expecting TC = 31");
            }

            let msgbin = common().hex2bin(msg);
            let nic_a = parseInt(msgbin.charAt(75));
            let nic_c = parseInt(msgbin.charAt(51));
            return {nic_a, nic_c};
        },
        nic_b(msg) {
            let tc = this.typecode(msg);
            if (tc < 9 || tc > 18) {
                throw new Error("Not a airborne position message, expecting 8<TC<19");
            }

            let msgbin = common().hex2bin(msg);
            return parseInt(msgbin.charAt(39));

            return nic_b
        },
        nac_p(msg) {

            let NACp, EPU, VEPU;
            let tc = this.typecode(msg);

            if (![29, 31].includes(tc)) {
                throw new Error("Not a target state and status message, or operation status message, expecting TC = 29 or 31");
            }
            let msgbin = common().hex2bin(msg);

            if (tc === 29) {
                NACp = common().bin2int(msgbin.slice(71, 75));
            } else if (tc === 31) {
                NACp = common().bin2int(msgbin.slice(76, 80));
            }
            EPU = uncertainty.NACp[NACp]["EPU"];
            VEPU = uncertainty.NACp[NACp]["VEPU"];
            return {EPU, VEPU};
        },
        nac_v(msg) {
            let tc = this.typecode(msg);
            if (tc !== 19) {
                throw new Error("Not an airborne velocity message, expecting TC = 19");
            }
            let msgbin = common().hex2bin(msg);
            let NACv = common().bin2int(msgbin.slice(42, 45));
            let HFOMr = uncertainty.NACv[NACv]["HFOMr"];
            let VFOMr = uncertainty.NACv[NACv]["VFOMr"];
            return {HFOMr, VFOMr};
        },
        sil(msg, version) {
            let SIL, PE_RCu, PE_VPL, SIL_SUP;

            let tc = this.typecode(msg);
            if (![29, 31].includes(tc)) {
                throw new Error("Not a target state and status message, or operation status message, expecting TC = 29 or 31");
            }
            let msgbin = common().hex2bin(msg);
            if (tc === 29) {
                SIL = common().bin2int(msgbin.slice(76, 78));
            } else if (tc === 31) {
                SIL = common().bin2int(msgbin.slice(82, 84));
            }
            let base = "unknown";
            if (version === 2) {
                if (tc === 29) {
                    SIL_SUP = common().bin2int(msgbin.charAt(39));
                } else if (tc === 31) {
                    SIL_SUP = common().bin2int(msgbin.charAt(86));
                }
                if (SIL_SUP === 0) {
                    base = "hour";
                } else if (SIL_SUP === 1) {
                    base = "sample";
                }
            }
            return {PE_RCu, PE_VPL, base};
        },
    }
}