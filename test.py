#!/usr/bin/python3.8
import pyModeS as pms
import numpy as np
from textwrap import wrap

msg = "8D4840D6202CC371C32CE0576098"
msgT = "007118F77AA25D4BB1E345EC2A"
binS = "10101010101010101010"
pms.tell("8D4840D6202CC371C32CE0576098")

def altcode(msg: str) -> [int]:
    """Compute altitude encoded in DF4 or DF20 message.

    Args:
        msg (String): 28 bytes hexadecimal message string

    Returns:
        int: altitude in ft

    """
    alt: [int]

    if pms.common.df(msg) not in [0, 4, 16, 20]:
        raise RuntimeError("Message must be Downlink Format 0, 4, 16, or 20.")

    # Altitude code, bit 20-32
    mbin = pms.common.hex2bin(msg)
    print ("mbin: ", mbin);
    altitude_code = mbin[19:32]
    print ("altitude_code: ", altitude_code)
    alt = altitude(altitude_code)
    print ("altitude_code: ", alt)
    return alt


def altitude(binstr: str) -> [int]:
    alt: [int]

    if len(binstr) != 13 or not set(binstr).issubset(set("01")):
        raise RuntimeError("Input must be 13 bits binary string")

    Mbit = binstr[6]
    Qbit = binstr[8]

    print ("mbit: ", Mbit, "qbit: ", Qbit);

    if pms.common.bin2int(binstr) == 0:
        # altitude unknown or invalid
        alt = None

    elif Mbit == "0":  # unit in ft
        if Qbit == "1":  # 25ft interval
            vbin = binstr[:6] + binstr[7] + binstr[9:]
            print("vbin: ", vbin, binstr[:6],binstr[7],binstr[9:])
            alt = pms.common.bin2int(vbin) * 25 - 1000
            print("alt: ", alt)
        if Qbit == "0":  # 100ft interval, above 50187.5ft
            C1 = binstr[0]
            A1 = binstr[1]
            C2 = binstr[2]
            A2 = binstr[3]
            C4 = binstr[4]
            A4 = binstr[5]
            # M = binstr[6]
            B1 = binstr[7]
            # Q = binstr[8]
            B2 = binstr[9]
            D2 = binstr[10]
            B4 = binstr[11]
            D4 = binstr[12]

            graystr = D2 + D4 + A1 + A2 + A4 + B1 + B2 + B4 + C1 + C2 + C4
            print("graystr: ", graystr)
            alt = pms.common.gray2alt(graystr)

    if Mbit == "1":  # unit in meter
        print("Mbit: ", Mbit)
        vbin = binstr[:6] + binstr[7:]
        print("vbin: ", vbin, binstr[:6], binstr[7:])
        alt = int(pms.common.bin2int(vbin) * 3.28084)  # convert to ft
        print("alt: ",alt)

    return alt

def gray2alt(binstr: str) -> int:
    gc500 = binstr[:8]
    print("gc500: ", gc500)
    n500 = gray2int(gc500)
    print("n500: ", n500)
    # in 100-ft step must be converted first
    gc100 = binstr[8:]
    print("gc100: ", gc100)
    n100 = gray2int(gc100)
    print("n100: ", n100)

    if n100 in [0, 5, 6]:
        return None

    if n100 == 7:
        n100 = 5

    if n500 % 2:
        n100 = 6 - n100

    alt = (n500 * 500 + n100 * 100) - 1300
    return alt


def gray2int(binstr: str) -> int:
    """Convert greycode to binary."""
    num = pms.common.bin2int(binstr)
    num ^= num >> 8
    num ^= num >> 4
    num ^= num >> 2
    num ^= num >> 1
    return num


def data(msg: str) -> str:
    """Return the data frame in the message, bytes 9 to 22."""
    return msg[8:-6]


def allzeros(msg: str) -> bool:

    d = pms.common.hex2bin(data(msg))

    if pms.common.bin2int(d) > 0:
        return False
    else:
        return True


def wrongstatus(data: str, sb: int, msb: int, lsb: int) -> bool:
    """Check if the status bit and field bits are consistency.

    This Function is used for checking BDS code versions.

    """
    # status bit, most significant bit, least significant bit
    status = int(data[sb - 1])
    value = pms.common.bin2int(data[msb - 1 : lsb])

    if not status:
        if value != 0:
            return True

    return False

print("altcode: ", altcode("2000171806A983"))
# Mode S squwak code (DF=5/21)
#pms.common.idcode(msg)

