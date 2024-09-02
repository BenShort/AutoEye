import mpu6050 as imu
import gps
import time
import airquality as ccs
import LTEModule
from MQTTClient import MQTTClient
from threading import Thread

class Device:
    def __init__(self, enable_imu, enable_gps, enable_ccs, enable_lte, MAC):
        self.ENABLE_IMU = enable_imu
        self.ENABLE_GPS = enable_gps
        self.ENABLE_CCS = enable_ccs
        self.DEVICE_MAC = MAC
        self.parked = False
        self.stolen = False
        self.payload = {}
        self.temp_payload = {}
        if enable_lte:
            self.lte = LTEModule.LTEModule()
        if enable_imu:
            self.mpu = imu.MPU()
        if enable_ccs:
            self.c = ccs.CCS()
            # self.lte.connect()
        if enable_gps:
            self.g = gps.GPS()
        
    
    def setup(self):
        connected = False
        while not connected:
            try:
                self.client = MQTTClient("./AutoEye/embedded/certs/ca.crt", "./AutoEye/embedded/certs/client.crt", "./AutoEye/embedded/certs/client.key", "ec2-34-227-228-95.compute-1.amazonaws.com", 8883)
                self.client.connect()
                self.receiver = MQTTClient("./AutoEye/embedded/certs/ca.crt", "./AutoEye/embedded/certs/client.crt", "./AutoEye/embedded/certs/client.key", "ec2-34-227-228-95.compute-1.amazonaws.com", 8883)
                self.receiver.connect()
                self.receiver.subscribe("/Status/Parked")
                connected = True
            except Exception as e:
                print("Error connecting to MQTT broker, trying again...")
                print(e)
                time.sleep(5)
    
    # IMU sending thread - decoupled to ensure deadlines are met
    def send_IMU(self):
        enable = True
        while enable:
            time.sleep(2.5)
            if self.ENABLE_IMU:
                if self.stolen:
                    stolen_payload = "stolen"
                else:
                    stolen_payload = ""
                
                try:
                    serialized = self.client.serialize_sensor_data(int(time.time()), self.DEVICE_MAC, self.temp_payload)
                    self.client.publish("/sensors/Temperature", serialized)
                    print("TEMPERATURE", serialized)
                    serialized = self.client.serialize_sensor_data(int(time.time()), self.DEVICE_MAC, stolen_payload)
                    self.client.publish("/Status/Stolen", serialized)
                    print("STOLEN PAYLOAD:", serialized)
                except:
                    print("Error - could not publish to MQTT broker (disconnected?)")
                    enable = False
                    self.setup()
    
    # GPS reading and sending thread
    def run_GPS(self):
        enable = True
        while enable:
            if self.ENABLE_GPS:
                time.sleep(5)
                data = self.g.get_fix()
                serialized = self.client.serialize_sensor_data(int(time.time()), self.DEVICE_MAC, data)
                try:
                    print("GPS:",serialized)
                    self.client.publish("/sensors/GPS", serialized)
                except:
                    print("Error - could not publish to MQTT broker /sensors/GPS (disconnected?)")
                    enable = False
                    self.setup()

    # Air Quality sensor reading and sending thread
    def run_CCS(self):
        enable = True
        while enable:
            if self.ENABLE_CCS:
                time.sleep(1)
                ec02 = self.c.ec02_moving_av()
                time.sleep(1)
                tvoc = self.c.TVOC_moving_av()
                payload = {
                    "c02": ec02,
                    "tvoc": tvoc,
                    "c02_above_threshold": self.c.ec02_threshold(),
                    "tvoc_thresh":self.c.tvoc_threshold()
                }
                serialized = self.client.serialize_sensor_data(int(time.time()), self.DEVICE_MAC, payload)
                try:
                    self.client.publish("/sensors/AirQuality", serialized)
                    print("AIR QUALITY:", serialized)
                except:
                    print("Error - could not publish to MQTT broker /sensors/AirQuality (disconnected?)")
                    enable = False
                    self.setup()

    # MQTT receiving thread
    def run_mqtt_receive(self):
        self.receiver.loop_forever()
    
    # parked state reading thread
    def update_message(self):
        while True:
            try:
                self.parked = self.receiver.message["State"]
            except Exception as e:
                # print("Error: ", e)
                pass
            time.sleep(0.1)

    def run(self):
        gpsThread = Thread(target=self.run_GPS)
        imuThread = Thread(target=self.send_IMU)
        pollMovementThread = Thread(target=self._poll_Movement)
        ccsThread = Thread(target=self.run_CCS)
        receivingThread = Thread(target=self.run_mqtt_receive)
        updatingThread = Thread(target=self.update_message)
        
        gpsThread.start()
        imuThread.start()
        pollMovementThread.start()
        ccsThread.start()
        receivingThread.start()
        updatingThread.start()
        
        # wait for threads to finish, except they never will
        imuThread.join()
        pollMovementThread.join()
        gpsThread.join()
        ccsThread.join()
        receivingThread.join()
        updatingThread.join()

    ## Private: IMU polling thread 
    def _poll_Movement(self):
        while True:
            # print("poll")
            time.sleep(0.1)
            if self.ENABLE_IMU:
                xaccel_av, yaccel_av, zaccel_av = self.mpu.accel_moving_av(units="mpss")
                self.payload["acceleration"] = [xaccel_av, yaccel_av, zaccel_av]

                xg, yg, zg = self.mpu.gyro_moving_av()
                self.payload["gyroscope"] = [xg, yg, zg]


                xgyro_deriv, ygyro_deriv, zgyro_deriv = self.mpu.gyro_deriv()
                self.payload["gyroscope_deriv"] = [xgyro_deriv, ygyro_deriv, zgyro_deriv]

                temp = self.mpu.temp_moving_av(units="C")
                self.temp_payload["temperature"] = temp

                temp_threshold = self.mpu.temp_threshold()
                self.temp_payload["freezing"] = temp_threshold

                # thresholding automatically applies moving averages
                accel_threshold = self.mpu.accel_threshold()
                gyroderiv_threshold =self.mpu.gyro_deriv_threshold()
                print("STOLEN: ", (accel_threshold or gyroderiv_threshold) and self.parked)
                self.stolen = (accel_threshold or gyroderiv_threshold) and self.parked 
                    # print("#################################")
                    # print("MOVING", (accel_threshold or gyroderiv_threshold))