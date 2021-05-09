"use strict"
const mqtt = require('mqtt');
const mqttClient = mqtt.connect('mqtt://127.0.0.1');
const common = require('./common');
const bds08 = require('./decoder/bds/bsd08');

const msg = "8C4841753A9A153237AEF0F275BE"
const msgA = "8D406B902015A678D4D220AA4BDA"
const msgB = "8D4CA251204994B1C36E60A5343D"
const msgT = "007118F77AA25D4BB1E345EC2A";
const binS = "10101010101010101010";

let msg_counter = 0;

mqttClient.on('connect', function () {
    mqttClient.subscribe('adsb/ek6ram', function (err) {
        if (err) {
            console.log('Error occured: ', err);
        }
    })
})
/*
mqttClient.on('message', function (topic, message) {
    msg_counter++;
    let msg = message.toString();
    let idcode = undefined;
    let altcode = undefined;
    let icao = undefined;
    //console.log('MSG: ', msg, 'Length: ', msg.length);
    icao = common().icao(msg);

    if([14,28].includes(msg.length) && (icao.length === 6)){
        console.log('ICAO: ', icao);
        let df = common().df(msg);
        console.log('DF: ', df);
        if([5,21].includes(df)){
            idcode = common().idcode(msg);
            console.log('Squawk: ', idcode);
        }
        if ([0, 4, 16, 20].includes(df)){
            altcode = common().altcode(msg);
            console.log('Altitude: ', altcode);
        }

        //console.log("ICAO: ", icao, "IDCODE: ", idcode, "ALTITUDE: ", altcode);
    }

})
*/

/*
let hex2bin = common().hex2bin(msg);
let hex2int = common().hex2int(msg);
let bin2int = common().bin2int(hex2bin);
let bin2hex = common().bin2hex(hex2bin);
let df = common().df(msg);
let crc1 = common().crc(msgA);
let crc2 = common().crc(msgB);
let icao = common().icao(msg);
let is_icao_assigned = common().is_icao_assigned(icao);
let typecode = common().typecode(msg);
let cprNL = common().cprNL(56.7);
 */
//let idcode = common().idcode(msg);
//let altcode = common().altcode(msg);
let category = bds08().category(msg);
let callsign = bds08().callsign(msg);
console.log('Category: ', category, 'Callsign: ', callsign);


//console.log(hex2bin);
//console.log(hex2int);
//console.log(bin2int);
//console.log(bin2hex);
//console.log(df);
//console.log(icao);
//console.log(is_icao_assigned);
//console.log(typecode);
//console.log(cprNL);
//console.log(idcode);
//console.log("altcode: ", altcode)

