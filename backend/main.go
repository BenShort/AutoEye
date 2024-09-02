package main

// imports
import (
	api "AutoEye/backend/Api"
	mh "AutoEye/backend/MqttHandler"
)

// Main function
func main() {
	// Initialise and Start MQTT side of the Backend
	var mqttManager mh.MqttManager
	mqttManager.Init("ec2-34-227-228-95.compute-1.amazonaws.com", "8883")
	mqttManager.Connect("Backend", "./certs/ca.crt", "./certs/client.crt", "./certs/client.key")
	mqttManager.Listen("/#")

	// Initialise and start the REST API side of the backend
	var apiManager api.ApiManager
	apiManager.InitHttp(":8081", &mqttManager, true) // DEVELOPER USE ONLY
	// apiManager.InitHttps(":8081", &mqttManager, true, "./httpsCerts/ca.crt", "./httpsCerts/server.crt", "./httpsCerts/server.key") // FOR PRODUCTION BUILD
}
