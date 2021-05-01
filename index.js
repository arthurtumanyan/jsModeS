"use strict"

const common = require('./common');

const msg = "8D4840D6202CC371C32CE0576098"
const msgA = "8D406B902015A678D4D220AA4BDA"
const msgB = "8D4CA251204994B1C36E60A5343D"

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

//console.log(hex2bin);
//console.log(hex2int);
//console.log(bin2int);
//console.log(bin2hex);
//console.log(df);
console.log(icao);
console.log(is_icao_assigned);
console.log(typecode);
