#!/usr/bin/python3.8
import pyModeS as pms
import numpy as np
from textwrap import wrap

msg = "8D4840D6202CC371C32CE0576098"

pms.tell("8D4840D6202CC371C32CE0576098")

#print("Bin2Hex: ", hex2bin(msg))

print("Typecode: ", pms.typecode(msg))

