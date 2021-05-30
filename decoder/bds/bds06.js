const common = require('../../common');

module.exports = () => {
    return {
        surface_position(msg0, msg1, t0, t1, lat_ref, lon_ref){
            throw new Error("Not implemented yet");
        },
        surface_position_with_ref(msg, lat_ref, lon_ref){
            throw new Error("Not implemented yet");
        },
        surface_velocity(msg, source= false){
            throw new Error("Not implemented yet");
        },

    }
}