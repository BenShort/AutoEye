""" Read two bytes of data and perform bit logic to convert int read as unsigned to signed int  """
def read_twobytes(register, bus, device_address):
    try:
        high = bus.read_byte_data(device_address, register)
        low = bus.read_byte_data(device_address, register+1)
    except OSError as e:
        f = open("error.log", "a")
        f.write("Unable to establish I2C - check connections and device address \n")
        f.write(str(e))
        f.write("\n")
        f.close()
        return 0x0000

    value = (high<<8) + low

    if value > 0x8000:
        return -((0xFFFF-value)+1)
    else:
        return value

""" Read single byte from device """
def read_byte(register, bus, device_address):
    try:
        return bus.read_byte_data(device_address, register)
    except OSError as e:
        f = open("error.log", "a")
        f.write("Unable to establish I2C - check connections and device address \n")
        f.write(str(e))
        f.write("\n")
        f.close()
        return 0x00

""" Write single byte to register """
def write_byte(register, value, bus, device_address):
    try:
        bus.write_byte_data(device_address, register, value)
    except OSError as e:
        f = open("error.log", "a")
        f.write("Unable to establish I2C - check connections and device address \n")
        f.write(str(e))
        f.write("\n")
        f.close()

""" Read block of data """
def read_block(register, bus, device_address, block_length):
    try:
        return bus.read_i2c_block_data(device_address, register, block_length)
    except OSError as e:
        f = open("error.log", "a")
        f.write("Unable to establish I2C - check connections and device address \n")
        f.write(str(e))
        f.write("\n")
        f.close()
        return 0x00

""" Perform streaming moving average on data """
class StreamingMovingAverage:
    def __init__(self, window_size):
        self.window_size = window_size
        self.values = []
        self.sum = 0

    def process(self, value):
        self.values.append(value)
        self.sum += value
        if len(self.values) > self.window_size:
            self.sum -= self.values.pop(0)
        return float(self.sum) / len(self.values)

# Use method of finite differences as derivative approximation
# Will be off from real-time data by one sample (0.1s by default)
class FiniteDifference:
    def __init__(self, oneAgo, twoAgo, timeDiff=0.1):
        self.oneAgo = oneAgo
        self.twoAgo = twoAgo
        self.timeDiff = timeDiff
        self.epsilon = 0.00001
    
    def process(self, current):
        f = open("error.log", "a")
        if abs(self.timeDiff) > self.epsilon: 
            dydx = (current-self.twoAgo)/(2*abs(self.timeDiff))
        elif abs(self.timeDiff)>0:
            f.write("WARNING: time difference is small! Derivatives may not be accurate")
            dydx = (current-self.twoAgo)/(2*abs(self.timeDiff))
        else:
            f.write("WARNING: time difference is 0! Defaulted to 0.1")
            dydx = (current-self.twoAgo)/0.2
        f.close()

        self.twoAgo = self.oneAgo
        self.oneAgo = current
        return dydx

# checks if median of prior values is above threshold 
class Threshold:
    def __init__(self, thresh, window_size):
        self.threshold = thresh
        self.window_size = window_size
        self.values = []

    def process(self, value):
        self.values.append(value)
        if len(self.values)>self.window_size:
            self.values.pop(0)
        return sorted(self.values)[len(self.values)//2] > self.threshold


