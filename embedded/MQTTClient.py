import paho.mqtt.client as mqtt
import json

class MQTTClient:
    def __init__(self, ca_certs, certfile, keyfile, broker_address, port):
        """
        Initializes the MQTT Client with TLS configuration.

        :param ca_certs: Path to the Certificate Authority certificate file.
        :param certfile: Path to the client's certificate file.
        :param keyfile: Path to the client's key file.
        :param broker_address: The address of the MQTT broker.
        :param port: The port to connect to on the MQTT broker.
        """
        self.message = {"parked":False}
        self.client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
        self.client.on_message = self.on_message
        self.client.tls_set(ca_certs=ca_certs, certfile=certfile, keyfile=keyfile)
        self.broker_address = broker_address
        self.port = port
        self.topics = []

    def on_message(self, client, userdata, message):
        """
        Callback function that is called when a message is received.
        """
        print(f"Received message: {message.payload.decode()} on topic {message.topic}")
        try:
            self.message = eval(message.payload.decode())
        except:
            print("Malformed message - ", message.payload.decode())

    def connect(self):
        """
        Connects to the MQTT broker.
        """
        self.client.connect(self.broker_address, self.port)

    def subscribe(self, topic):
        """
        Subscribes to a topic.
        """
        self.topics.append(topic)
        self.client.subscribe(topic)

    def unsubscribe(self, topic):
        """
        Unsubscribes from a topic.
        """
        self.topics.remove(topic)
        self.client.unsubscribe(topic)
        
    def publish(self, topic, payload):
        """
        Publishes a message to a topic.

        :param topic: The topic to publish the message on.
        :param payload: The message payload.
        """
        self.client.publish(topic, payload)

    def loop_forever(self):
        """
        Starts the MQTT client loop to process network events forever.
        """
        self.client.loop_forever()

    def disconnect(self):
        """
        Disconnects from the MQTT broker.
        """
        self.client.disconnect()

    def serialize_device_info(self, user, device_id):
        """
        Serializes device information into JSON format.

        :param user: The user associated with the device.
        :param device_id: The device ID.
        """
        return json.dumps({"User": user, "DeviceID": device_id})

    def serialize_sensor_data(self, timestamp, device_id, data):
        """
        Serializes sensor data into JSON format.

        :param timestamp: The timestamp of the data.
        :param device_id: The device ID.
        :param data: The sensor data.
        """
        return json.dumps({"TimeStamp": timestamp, "DeviceID": device_id, "Data": data})


