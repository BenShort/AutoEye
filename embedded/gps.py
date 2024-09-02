import time
import serial
from func_timeout import func_timeout, FunctionTimedOut, func_set_timeout
import os

class NMEAParser:
    def __init__(self, uart):
        self.uart = uart
        self.has_fix = False
        self.latitude = 51.498356
        self.longitude = -0.176894
    
    """ Receive an fix from the GPS """
    def update(self):
        nmea_sentences = []
        try:
            # Flush to receive most recent data
            self.uart.flushInput()
            self.uart.flushOutput()
            time.sleep(1)
            for i in range(4):
                time.sleep(0.1)
                val = func_timeout(5,self.uart.readline,args=())
                nmea_sentences.append(val)
        except FunctionTimedOut:
            print("FAILED TO READ from serial in within 5 seconds - timed out")
            # Reset software uart
            self.uart.close()
            os.system("sudo rmmod soft_uart")
            os.system("sudo insmod ~/AutoEye/embedded/soft_uart/soft_uart.ko")

        for byteObj in nmea_sentences:
            checksum = 0
            try:
                data = byteObj.decode()
                for byte in byteObj:
                    if chr(byte)!="*":
                        if chr(byte) != "$":
                            checksum ^= byte
                    else:
                        break
            except:
                # occasionally read will fail and byteObj will be len(0)
                try:
                    # occasional error when reading - first value is 0xFF
                    while chr(byteObj[0]) != "$":
                        byteObj = byteObj[1:]
                    data = byteObj
                    for byte in data:
                        if chr(byte)!="*":
                            if chr(byte) != "$":
                                checksum ^= byte
                        else:
                            break
                    data = data.decode()
                except:
                    data = "$"

            data = data.split(",")
            if str(data[0]) == "$GPGGA":
                if str(data[2])!="":
                    ns = -1 if str(data[3])=="S" else 1
                    self.latitude = ns*(float(data[2][:2])+float(data[2][2:])/60)
                else:
                    self.has_fix = False

                if str(data[4])!="" and checksum == int(data[14][1:3], 16):
                    ew = -1 if str(data[5])=="W" else 1
                    self.longitude = ew*(float(data[4][:3])+float(data[4][3:])/60)
                    self.has_fix = True
                else:
                    self.has_fix = False
    
    
    @func_set_timeout(5)
    def send_command(self, command):
        self.uart.write(command)
        

class GPS:
    def __init__(self):
        print("Setting up GPS module")
        # Try to set up uart connection, retry if it fails
        try:
            self.uart = None
            while self.uart is None:
                try:
                    self.uart = serial.Serial("/dev/ttySOFT0", baudrate=9600, timeout=10)
                except:
                    time.sleep(10)
                    print("SLEEPIG")
            # defaults to GPIO 17,27 (pins 11, 13)
            # https://github.com/adrianomarto/soft_uart
            self.gps = NMEAParser(self.uart)

            try:
                self.gps.send_command(b"PMTK314,0,5,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0")
            except Exception as e:
                print(e)

            time.sleep(1)

            # Set update rate to once every five seconds
            try:
                self.gps.send_command(b"PMTK220,5000")
            except Exception as e:
                print(e)
        except Exception as e:
            print(str(e)+"\n")
            self.gps = None
    
    """ 
        get_fix to get a gps fix and return some data
        If no fix available, 
    
    """
    def get_fix(self):
        # Ensure GPS is available
        if self.gps is not None:
            self.gps.update()
            if not self.gps.has_fix:
                # Default fix to Imperial
                return {
                    "latitude":"51.498356",
                    "longitude":"-0.176894"
                }
            else:
                return {
                    "latitude":str(self.gps.latitude),
                    "longitude":str(self.gps.longitude),
                }
        else:
            # close and restart GPS
            self.uart.close()
            self.__init__()
            return {}
