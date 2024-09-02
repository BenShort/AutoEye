import RPi.GPIO as GPIO
import serial
import os
import time

class LTEModule:
    def __init__(self):
        print("Setting up LTE Module")
        self.serial_port = "/dev/ttyAMA0"
        self.baud_rate = 115200
        self._connection_attempts = 20
        
        # GPIO config
        self.GPIO_PIN = 4
        GPIO.setmode(GPIO.BCM)
        GPIO.setup(self.GPIO_PIN, GPIO.OUT)

        self.connect()


    #### PUBLIC ####
    # setup the module so that it can register with the LTE network and connect
    def connect(self):
        f = open("error.log", "a")
        config_commands = ["AT+CNMP=13", "AT+CNMP=2"]
        delay_commands = 5  # in seconds
        for i in range(self._connection_attempts):
            if self._check_enabled():
                try:
                    ser = serial.Serial(self.serial_port, self.baud_rate)
                    for command in config_commands:
                        ser.write((command + "\r\n").encode())
                        print("Send Command to LTE: "+command+"\n")
                        time.sleep(delay_commands)
                    break
                except serial.SerialException:
                    print("Serial port not ready. Retrying in 1 second... \n")
                    time.sleep(1)
                    quit()
        
        
        f.close()
        time.sleep(1)
        os.system("sudo pppd call gprs &")
        time.sleep(25)
        os.system("sudo ifconfig wlan0 down")
        os.system("sudo route add -net 0.0.0.0 ppp0")
	
    def reboot(self):
        f = open("error.log", "a")
        print("rebooting")
        self._toggle_module()
        time.sleep(12)
        self._toggle_module()
        time.sleep(10)

        print("Successfully rebooted LTE Module")
        f.close()

    #### PRIVATE ####
    # check if the LTE module is enabled
    def _check_enabled(self) -> bool:
        f = open("error.log", "a")
        try:
            ser = serial.Serial(self.serial_port, self.baud_rate)
            ser.close()
            print("LTE Module is connected \n")
            # f.close()
            return True
        except serial.SerialException:
            print("LTE Module not connected \n")
            # f.close()
            return False
        
    def _toggle_module(self):
        GPIO.output(self.GPIO_PIN, GPIO.HIGH)
        time.sleep(2)
        GPIO.output(self.GPIO_PIN, GPIO.LOW)
