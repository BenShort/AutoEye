import time
import smbus2
from sensor_common import read_twobytes, read_byte, write_byte, StreamingMovingAverage, FiniteDifference, Threshold

# mpu i2c address
mpu_address = 0x68

""" GLOBAL VARIABLES: Registers of required data/commands """
# needed to wake up mpu
PWR_MGMT_1 = 0x6B

# high bits for acceleration
accel_x_high = 0x3B
accel_y_high = 0x3D
accel_z_high = 0x3F

temperature_high = 0x41

gyro_x_high = 0x43
gyro_y_high = 0x45
gyro_z_high = 0x47


ACCEL_TO_MPSS = 9.8/15000

class MPU:
    def __init__(self, window_size=20):
        f = open("error.log", "a")
        print("Setting up IMU Module (MPU6050)")
        f.write("Setting up IMU Module (MPU6050) \n")
        f.close()

        self.bus = smbus2.SMBus(1)
        time.sleep(1)
        write_byte(PWR_MGMT_1, 0x00, self.bus, mpu_address)

        # moving average setup
        self.xaccel_av = StreamingMovingAverage(window_size=window_size)
        self.yaccel_av = StreamingMovingAverage(window_size=window_size)
        self.zaccel_av = StreamingMovingAverage(window_size=window_size)

        self.xgyro_av = StreamingMovingAverage(window_size=window_size)
        self.ygyro_av = StreamingMovingAverage(window_size=window_size)
        self.zgyro_av = StreamingMovingAverage(window_size=window_size)
        
        self.temp_av = StreamingMovingAverage(window_size=window_size)

        self.last = self.accel_moving_av()


        # Gyro derivative setup
        twoAgo = self.accel_moving_av()
        oneAgo = self.accel_moving_av()
        self.xgyro_grad = FiniteDifference(oneAgo[0], twoAgo[0])
        self.ygyro_grad = FiniteDifference(oneAgo[1], twoAgo[1])
        self.zgyro_grad = FiniteDifference(oneAgo[2], twoAgo[2])

        # Acceleration threshold setup
        self.xaccel_thresh = Threshold(1350, 10)
        self.yaccel_thresh = Threshold(1350, 10)

        # Temperature threshold setup
        self.temp_thresh = Threshold(-12400, 50)

        # gyro derivative threshold setup
        #TODO: tweak numbers
        self.xgyroderiv_thresh = Threshold(2400,10)
        self.ygyroderiv_thresh = Threshold(1500,10)
    # returns acceleration
    # inputs: units (str) - if mpss, then returns in metres per sec^2, otherwise arbitrary
    # delay (flt) - delay between measurements
    # outputs: tuple of x,y and z acceleration
    def acceleration(self, units="", delay=0.1):
        xaccel = read_twobytes(accel_x_high, self.bus, mpu_address)
        yaccel = read_twobytes(accel_y_high, self.bus, mpu_address)
        zaccel = read_twobytes(accel_z_high, self.bus, mpu_address)

        if delay!=0:
            time.sleep(delay)

        if units.lower()=="mpss":
            return xaccel*ACCEL_TO_MPSS, yaccel*ACCEL_TO_MPSS, zaccel*ACCEL_TO_MPSS
        else:
            return float(xaccel), float(yaccel), float(zaccel)

    # returns temperature
    # inputs: 
    #    units (str) - C is celcius, F is farenheit, else is arbitrary
    #    delay (float) - delay between measurements. 0 causes batch reading (several identical readings)    
    # outputs:
    #   temperature (float)
    def temperature(self, units="", delay=0.1):
        temp = read_twobytes(temperature_high, self.bus, mpu_address)
        if delay!=0:
            time.sleep(delay)
        tempC = temp/340.0+36.53
        if units.lower()=="c":
            return tempC
        elif units.lower()=="f":
            return 1.8*tempC+32
        else:
            return temp

    # returns gyroscope readings
    # inputs: 
    #    delay (float) - delay between measurements. 0 causes batch reading (several identical readings)    
    # outputs:
    #   tuple of x, y, z gyroscope readings
    def gyroscope(self,delay=0.1):
        xgyro = read_twobytes(gyro_x_high, self.bus, mpu_address)
        ygyro = read_twobytes(gyro_y_high, self.bus, mpu_address)
        zgyro = read_twobytes(gyro_z_high, self.bus, mpu_address)
        if delay!=0:
            time.sleep(delay)
        
        return xgyro, ygyro, zgyro

    # Moving average acceleration
    def accel_moving_av(self, units=""):
        # processing
        x, y, z = self.acceleration()
        x = self.xaccel_av.process(x)
        y = self.yaccel_av.process(y)
        z = self.zaccel_av.process(z)

        if units.lower()=="mpss":
            return x*ACCEL_TO_MPSS, y*ACCEL_TO_MPSS, z*ACCEL_TO_MPSS
        else:
            return float(x), float(y), float(z)
    
    # Moving average gyroscope
    def gyro_moving_av(self):
        # processing
        x, y, z = self.gyroscope()
        x = self.xgyro_av.process(x)
        y = self.ygyro_av.process(y)
        z = self.zgyro_av.process(z)

        return x, y, z

    # Moving average temperature
    def temp_moving_av(self, units=""):
        temp = self.temperature()
        temp = self.temp_av.process(temp)
        tempC = temp/340.0+36.53
        if units.lower()=="c":
            return tempC
        elif units.lower()=="f":
            return 1.8*tempC+32
        else:
            return temp

    # Gyroscope derivative
    def gyro_deriv(self):
        current = self.gyro_moving_av()
        xgyro_deriv = self.xgyro_grad.process(current[0])
        ygyro_deriv = self.ygyro_grad.process(current[1])
        zgyro_deriv = self.zgyro_grad.process(current[2])

        return xgyro_deriv, ygyro_deriv, zgyro_deriv

    # Acceleration thresholding - accounting for drift
    def accel_threshold(self):
        current = self.accel_moving_av()
        # xresult = self.xaccel_thresh.process(current[0])
        # yresult = self.yaccel_thresh.process(current[1])

        if ((current[0] - self.last[0]) > 200) or ((current[1] - self.last[1]) > 200):
            self.last = current
            return True
        else:
            self.last = current
            return False

        # return xresult or yresult
    
    # Gyroscope derivative thresholding
    # NB: Gyroscope drifts much slower than accelerometer
    def gyro_deriv_threshold(self):
        current = self.gyro_moving_av()
        xresult = self.xgyroderiv_thresh.process(current[0])
        yresult = self.ygyroderiv_thresh.process(current[1])
        return xresult or yresult

    # Temperature thresholding
    def temp_threshold(self):
        current = self.temp_moving_av()
        return not self.temp_thresh.process(current)
    

        
        


