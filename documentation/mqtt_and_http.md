### Implementing MQTT, a MySQL Database & API in Gin for the Backend

Implementation:

Backend consits of an MQTT Broker, MySQL Database and API written with Gin HTTP Web Framework (in Go). 

The MQTT Broker manages the MQTT message publications & subscriptions.

The MySQL Database connected to the Go Backedn via ssl. 

The Theft Trackers publish sensor data (GPS, Accelerometer, etc.) in real-time to the relevant MQTT topics.

The backend application subscribes & listens to these topics, processing the data & storing in the MySQL database.

Commands can be sent back to the AutoEYE Device (subscribed to chosen Topics), through the API by publishing to MQTT topics.

![backend](https://github.com/AdvikChitre/AutoEye/assets/59978422/f5741e53-4059-439a-9c00-64825375fec9)
