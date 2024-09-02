import time
import smbus2

from sensor_common import read_twobytes, read_byte, write_byte, read_block, StreamingMovingAverage, Threshold
# from machine import Pin, I2C

""" GLOBAL VARIABLES: Registers of required data/commands """
# CCS i2c address
CCS_ADDRESS = 0x5B

STATUS = 0x00
SETUP = 0x01
ALG_RESULT_DATA = 0x02
ERROR_CODES = 0xE0
APP_START = 0xF4

class CCS:
    def __init__(self, window_size=5):
        f = open("error.log", "a")
        print("Setting up Air Sensor module (CCS811)")
        f.write("Setting up Air Sensor module (CCS811) \n")

        # requires a software i2c connection, pins 16, 18 (GPIO 23, 24)
        # https://github.com/fivdi/i2c-bus/blob/master/doc/raspberry-pi-software-i2c.md
        self.bus = smbus2.SMBus(3)
        time.sleep(1)
        
        status = read_byte(STATUS, self.bus, CCS_ADDRESS)
        self.errorReport(status)

        self.ec02_av = StreamingMovingAverage(window_size)
        self.tvoc_av = StreamingMovingAverage(window_size)

        self.ec02_thresh = Threshold(1000, 30)
        self.tvoc_thresh = Threshold(400, 30)
        if status&0x10==0x10:
            # write with no data to APP_START to take CCS out of boot mode
            # check error log just in case
            self.bus.write_byte(CCS_ADDRESS, APP_START)
            status = read_byte(STATUS, self.bus, CCS_ADDRESS)
            self.errorReport(status)
            # write setup 
            write_byte(SETUP, 0x10, self.bus, CCS_ADDRESS)
            status = read_byte(STATUS, self.bus, CCS_ADDRESS)
            self.errorReport(status)
            time.sleep(1)
        
    # returns c02 reading or None if not ready
    def ec02(self):
        status = read_byte(STATUS, self.bus, CCS_ADDRESS)
        self.errorReport(status)
        if (status & 0x08) != 0x08:
            return None
        
        return read_twobytes(ALG_RESULT_DATA, self.bus, CCS_ADDRESS)

    # returns TVOC reading or None if not ready
    def TVOC(self):
        status = read_byte(STATUS, self.bus, CCS_ADDRESS)
        self.errorReport(status)
        if (status & 0x08) != 0x08:
            return None
        
        data = read_block(ALG_RESULT_DATA, self.bus, CCS_ADDRESS, 4)[2:]
        data = (data[0]<<8)+data[1]
        return data

    # apply moving average to CO2 readings
    def ec02_moving_av(self):
        reading = self.ec02()
        if reading is None:
            return None
        reading = self.ec02_av.process(reading)
        return reading

    # apply moving average TVOC readings
    def TVOC_moving_av(self):
        reading = self.TVOC()
        if reading is None:
            return None
        reading = self.tvoc_av.process(reading)
        return reading

    # apply thresholding to CO2
    def ec02_threshold(self):
        current = self.ec02_moving_av()
        if current is None:
            return False
        return self.ec02_thresh.process(current)
    
    # apply thresholding to TVOC
    def tvoc_threshold(self):
        current = self.ec02_moving_av()
        if current is None:
            return False
        return self.tvoc_thresh.process(current)

    """ PRIVATE: error reporter"""
    def errorReport(self, status):
        f = open("error.log", "a")
        if ((status & 0x01) == 0x01):
            error = read_byte(ERROR_CODES, self.bus, CCS_ADDRESS)
            if error & 0x01 == 0x1:
                f.write("CCS: The CCS811 received an I2C write request addressed to this station but with invalid register address ID \n")
            elif error & 0x02 == 0x02:
                f.write("CCS: The CCS811 received an I2C read request to a mailbox ID that is invalid \n")
            elif error & 0x04 == 0x04:
                f.write("CCS: The CCS811 received an I2C request to write an unsupported mode to MEAS_MODE \n")
            elif error & 0x08 == 0x08:
                f.write("CCS: The sensor resistance measurement has reached or exceeded the maximum range \n")
            elif error & 0x10 == 0x10:
                f.write("CCS: The Heater current in the CCS811 is not in range \n")
            elif error & 0x20 == 0x20:
                f.write("CCS: The Heater voltage is not being applied correctly \n")
            else:
                print("No error (how did this get called?)") 
        f.close()        
    


    







    
