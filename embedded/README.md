# _Embedded_

_This is the Embedded Python Code running on the Pi/Tracker._

_It communicates with the GPS, LTE, Accelerometer, & Air Quality Sensors through custom drivers._

_It uses Software & Hardware I2C and Software & Hardware UART._

_It communicates with the backend via the MQTT Broker._

## _Sensor Communication_

_This section describes how the microcontroller sends and receives information from the various sensors._

### _Accelerometer_

_The Pi communicates with the MPU6050 accelerometer via Hardware I2C. The driver was written using SMBus. The sensor is queried every 0.1 seconds, as that is the update rate of the accelerometer. Moreover, the driver performs a moving average filter on the acceleration and temperature readouts to give more stable information. It also performs a derivative on the gyroscope readouts to find the rate of change of direction._

### _Air Quality Sensor_

_The Pi communicates with the CCS air quality sensor through Software I2C, as hardware I2C does not support clock stretching due to a hardware bug. The driver was written using SMBus. A moving average filter is also applied to the measurements of CO2 and TVOC. The sensor is queried every second, as this is the update rate of the CCS sensor._

### _GPS_

_The Pi communicates with the Adafruit GPS through [software UART](https://github.com/adrianomarto/soft_uart), as the hardware UART is needed for the LTE. The data is read using PySerial, and a dedicated driver was written for it. To ensure the serial data is not read too quickly, as this freezes the FIFO UART buffer, the update rate for the GPS is set to 5 seconds. Finally, the buffer input and output is flushed before every read to ensure the most up to date data to the user._

### _LTE_

_The LTE module communicates with the Pi through hardware UART, as the PPPD communication mechanism requires a higher baud rate than software UART can handle. Finally, the LTE module can only upload at 500 bytes per second, so the data sent to the module cannot exceed this._

## _Integration_

_To integrate these modules, we used the Python multithreading module to increase the rate at which data is sent to the server. As the deadlines are only soft deadlines, not firm or hard deadlines, even if data is lost the functionality of the device is not affected, only the user experience. Regardless, calculations showing that we reach our deadlines is included below._

![CodeCogsEqn(1)](https://github.com/AdvikChitre/AutoEye/assets/59978422/21c36071-c65d-4b2c-85fa-05e4d235a0e5)


_We also used MQTT communication to send data, as it has a much lower overhead than HTTP communication, ensuring that we stay under the 500 bytes/sec limit that LTE imposes._

_Device: MPU / CCS / GPS_

_Initiation Interval: 0.1 / 1  / 5_

_Execution Interval: 0.00343 / 0.00294 / 0.05_
