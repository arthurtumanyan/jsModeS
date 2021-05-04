const common = require('../../common');

module.exports = () => {
    return {
        airborne_position(msg0, msg1, t0, t1) {
            let air_d_lat_even, air_d_lat_odd, cprlat_even, cprlat_odd, cprlon_even, cprlon_odd, j, lat, lat_even,
                lat_odd,
                lon, m, mb0, mb1, ni, nl, oe0, oe1;
            mb0 = common().hex2bin(msg0).slice(32);
            mb1 = common().hex2bin(msg1).slice(32);
            oe0 = Number.parseInt(mb0[21]);
            oe1 = Number.parseInt(mb1[21]);
            if (((oe0 === 0) && (oe1 === 1))) {
            } else {
                if (((oe0 === 1) && (oe1 === 0))) {
                    [mb0, mb1] = [mb1, mb0];
                    [t0, t1] = [t1, t0];
                } else {
                    throw new Error("Both even and odd CPR frames are required.");
                }
            }
            cprlat_even = (common().bin2int(mb0.slice(22, 39)) / 131072);
            cprlon_even = (common().bin2int(mb0.slice(39, 56)) / 131072);
            cprlat_odd = (common().bin2int(mb1.slice(22, 39)) / 131072);
            cprlon_odd = (common().bin2int(mb1.slice(39, 56)) / 131072);
            air_d_lat_even = (360 / 60);
            air_d_lat_odd = (360 / 59);
            j = common().floor((((59 * cprlat_even) - (60 * cprlat_odd)) + 0.5));
            lat_even = Number.parseFloat((air_d_lat_even * ((j % 60) + cprlat_even)));
            lat_odd = Number.parseFloat((air_d_lat_odd * ((j % 59) + cprlat_odd)));
            if ((lat_even >= 270)) {
                lat_even = (lat_even - 360);
            }
            if ((lat_odd >= 270)) {
                lat_odd = (lat_odd - 360);
            }
            if ((common().cprNL(lat_even) !== common().cprNL(lat_odd))) {
                return null;
            }
            if ((t0 > t1)) {
                lat = lat_even;
                nl = common().cprNL(lat);
                ni = max((common().cprNL(lat) - 0), 1);
                m = common().floor((((cprlon_even * (nl - 1)) - (cprlon_odd * nl)) + 0.5));
                lon = ((360 / ni) * ((m % ni) + cprlon_even));
            } else {
                lat = lat_odd;
                nl = common().cprNL(lat);
                ni = max((common().cprNL(lat) - 1), 1);
                m = common().floor((((cprlon_even * (nl - 1)) - (cprlon_odd * nl)) + 0.5));
                lon = ((360 / ni) * ((m % ni) + cprlon_odd));
            }
            if ((lon > 180)) {
                lon = (lon - 360);
            }
            return [round(lat, 5), round(lon, 5)];
        },

        airborne_position_with_ref(msg, lat_ref, lon_ref) {

            let cprlat, cprlon, d_lat, d_lon, i, j, lat, lon, m, mb, ni;
            mb = common().hex2bin(msg).slice(32);
            cprlat = (common().bin2int(mb.slice(22, 39)) / 131072);
            cprlon = (common().bin2int(mb.slice(39, 56)) / 131072);
            i = Number.parseInt(mb[21]);
            lat = (i ? (360 / 59) : (360 / 60));
            j = (common().floor((lat_ref / lat)) + common().floor(((0.5 + ((lat_ref % lat) / lat)) - cprlat)));
            lat = (lat * (j + cprlat));
            ni = (common().cprNL(lat) - i);
            if ((ni > 0)) {
                lon = (360 / ni);
            } else {
                lon = 360;
            }
            m = (common().floor((lon_ref / lon)) + common().floor(((0.5 + ((lon_ref % lon) / lon)) - cprlon)));
            lon = (lon * (m + cprlon));
            return [round(lat, 5), round(lon, 5)];
        },

        altitude(msg) {
            let alt, altbin, altcode, mb, tc;
            tc = common().typecode(msg);
            if ((((tc < 9) || (tc === 19)) || (tc > 22))) {
                throw new Error(("%s: Not a airborn position message" % msg));
            }
            mb = common().hex2bin(msg).slice(32);
            altbin = mb.slice(8, 20);
            if ((tc < 19)) {
                altcode = ((altbin.slice(0, 6) + "0") + altbin.slice(6));
                alt = common().altitude(altcode);
            } else {
                alt = (common().bin2int(altbin) * 3.28084);
            }
            return alt;
        }
    }
}

