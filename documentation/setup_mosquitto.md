# Setup of MQTT on AWS
First follow this guide to install the latest version and get TLS configured:
https://medium.com/gravio-edge-iot-platform/how-to-set-up-a-mosquitto-mqtt-broker-securely-using-client-certificates-82b2aaaef9c8

However, it is very important to set the CN for the server (when you sign the server) to the 
Public IPv4 DNS of the aws instance.

Then make the client key.

Distribute the ca.crt and the signed client key and crt.

When connecting be careful to put the IPv4 DNS in as the hostname!
