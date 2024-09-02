from device import Device

def gma():
    f = open("/proc/cpuinfo", "r")
    line = f.readlines()[-2]
    identity = line.split()[-1]
    return str(identity)

ENABLE_IMU = True
ENABLE_GPS = True
ENABLE_CCS = True
ENABLE_LTE = True
DEVICE_MAC = gma()

device = Device(ENABLE_IMU, ENABLE_GPS, ENABLE_CCS, ENABLE_LTE, DEVICE_MAC)

device.setup()


device.run()
