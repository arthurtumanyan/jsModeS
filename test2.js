import {common} from 'pyModeS';
function surface_position(msg0, msg1, t0, t1, lat_ref, lon_ref) {
    /*Decode surface position from a pair of even and odd position message,
    the lat/lon of receiver must be provided to yield the correct solution.

    Args:
    msg0 (string): even message (28 hexdigits)
    msg1 (string): odd message (28 hexdigits)
    t0 (int): timestamps for the even message
    t1 (int): timestamps for the odd message
    lat_ref (float): latitude of the receiver
    lon_ref (float): longitude of the receiver

    Returns:
    (float, float): (latitude, longitude) of the aircraft
    */
    var air_d_lat_even, air_d_lat_odd, cprlat_even, cprlat_odd, cprlon_even, cprlon_odd, dls, imin, j, lat, lat_even, lat_even_n, lat_even_s, lat_odd, lat_odd_n, lat_odd_s, lon, lons, m, msgbin0, msgbin1, ni, nl;
    msgbin0 = common.hex2bin(msg0);
    msgbin1 = common.hex2bin(msg1);
    cprlat_even = (common.bin2int(msgbin0.slice(54, 71)) / 131072);
    cprlon_even = (common.bin2int(msgbin0.slice(71, 88)) / 131072);
    cprlat_odd = (common.bin2int(msgbin1.slice(54, 71)) / 131072);
    cprlon_odd = (common.bin2int(msgbin1.slice(71, 88)) / 131072);
    air_d_lat_even = (90 / 60);
    air_d_lat_odd = (90 / 59);
    j = common.floor((((59 * cprlat_even) - (60 * cprlat_odd)) + 0.5));
    lat_even_n = Number.parseFloat((air_d_lat_even * ((j % 60) + cprlat_even)));
    lat_odd_n = Number.parseFloat((air_d_lat_odd * ((j % 59) + cprlat_odd)));
    lat_even_s = (lat_even_n - 90);
    lat_odd_s = (lat_odd_n - 90);
    lat_even = ((lat_ref > 0) ? lat_even_n : lat_even_s);
    lat_odd = ((lat_ref > 0) ? lat_odd_n : lat_odd_s);
    if ((common.cprNL(lat_even) !== common.cprNL(lat_odd))) {
        return null;
    }
    if ((t0 > t1)) {
        lat = lat_even;
        nl = common.cprNL(lat_even);
        ni = max((common.cprNL(lat_even) - 0), 1);
        m = common.floor((((cprlon_even * (nl - 1)) - (cprlon_odd * nl)) + 0.5));
        lon = ((90 / ni) * ((m % ni) + cprlon_even));
    } else {
        lat = lat_odd;
        nl = common.cprNL(lat_odd);
        ni = max((common.cprNL(lat_odd) - 1), 1);
        m = common.floor((((cprlon_even * (nl - 1)) - (cprlon_odd * nl)) + 0.5));
        lon = ((90 / ni) * ((m % ni) + cprlon_odd));
    }
    lons = [lon, (lon + 90), (lon + 180), (lon + 270)];
    lons = function () {
    var _pj_a = [], _pj_b = lons;
    for (var _pj_c = 0, _pj_d = _pj_b.length; (_pj_c < _pj_d); _pj_c += 1) {
        var l = _pj_b[_pj_c];
        _pj_a.push((((l + 180) % 360) - 180));
    }
    return _pj_a;
}
.call(this);
    dls = function () {
    var _pj_a = [], _pj_b = lons;
    for (var _pj_c = 0, _pj_d = _pj_b.length; (_pj_c < _pj_d); _pj_c += 1) {
        var l = _pj_b[_pj_c];
        _pj_a.push(abs((lon_ref - l)));
    }
    return _pj_a;
}
.call(this);
    imin = min(range(4), {"key": dls.__getitem__});
    lon = lons[imin];
    return [round(lat, 5), round(lon, 5)];
}
function surface_position_with_ref(msg, lat_ref, lon_ref) {
    /*Decode surface position with only one message,
    knowing reference nearby location, such as previously calculated location,
    ground station, or airport location, etc. The reference position shall
    be with in 45NM of the true position.

    Args:
    msg (str): even message (28 hexdigits)
    lat_ref: previous known latitude
    lon_ref: previous known longitude

    Returns:
    (float, float): (latitude, longitude) of the aircraft
    */
    var cprlat, cprlon, d_lat, d_lon, i, j, lat, lon, m, mb, ni;
    mb = common.hex2bin(msg).slice(32);
    cprlat = (common.bin2int(mb.slice(22, 39)) / 131072);
    cprlon = (common.bin2int(mb.slice(39, 56)) / 131072);
    i = Number.parseInt(mb[21]);
    $lat = (i ? (90 / 59) : (90 / 60));
    j = (common.floor((lat_ref / $lat)) + common.floor(((0.5 + ((lat_ref % $lat) / $lat)) - cprlat)));
    lat = ($lat * (j + cprlat));
    ni = (common.cprNL(lat) - i);
    if ((ni > 0)) {
        $lon = (90 / ni);
    } else {
        $lon = 90;
    }
    m = (common.floor((lon_ref / $lon)) + common.floor(((0.5 + ((lon_ref % $lon) / $lon)) - cprlon)));
    lon = ($lon * (m + cprlon));
    return [round(lat, 5), round(lon, 5)];
}

//# sourceMappingURL=test2.js.map
