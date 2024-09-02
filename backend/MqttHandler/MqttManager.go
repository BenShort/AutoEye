package MqttHandler

import (
	"crypto/tls"
	"crypto/x509"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"strings"

	mqtt "github.com/eclipse/paho.mqtt.golang"
	expo "github.com/oliveroneill/exponent-server-sdk-golang/sdk"
)

// //// MqttManager /////
type MqttManager struct {
	broker string
	port   string

	client mqtt.Client
	topic  string
	f      mqtt.MessageHandler
}

///// Public Methods ////

func (m *MqttManager) Init(_broker string, _port string) {
	m.broker = _broker
	m.port = _port
	m.f = m.createMessageHandler()

	setupMySQL()
}

func (m *MqttManager) Connect(client_name string, ca_cert string, client_cert string, client_key string) error {
	opts := mqtt.NewClientOptions()
	fmt.Println(m.broker)
	broker := fmt.Sprintf("ssl://%s:%s", m.broker, m.port)
	opts.AddBroker(broker)

	tlsConfig := m.newTlsConfig(ca_cert, client_cert, client_key)

	opts.SetClientID(client_name).SetTLSConfig(tlsConfig)

	m.client = mqtt.NewClient(opts)
	if token := m.client.Connect(); token.Wait() && token.Error() != nil {
		fmt.Println("MQTT Connection Error")
		fmt.Println(token.Error())
		return token.Error()
	}

	return nil
}

func (m *MqttManager) Listen(topic string) error {
	if token := m.client.Subscribe(topic, 0, m.f); token.Wait() && token.Error() != nil {
		fmt.Println("MQTT Subscription Error")
		fmt.Println(token.Error())
		return token.Error()
	}
	fmt.Println("Subscription Successful")
	return nil
}

///// Private Methods /////

// create new TLS config
func (m *MqttManager) newTlsConfig(ca_cert string, client_cert string, client_key string) *tls.Config {
	certpool := x509.NewCertPool()
	pemCerts, err := ioutil.ReadFile(ca_cert)
	if err == nil {
		certpool.AppendCertsFromPEM(pemCerts)
	}

	// Import client certificate/key pair
	cert, err := tls.LoadX509KeyPair(client_cert, client_key)
	if err != nil {
		panic(err)
	}

	// Parse certificates
	cert.Leaf, err = x509.ParseCertificate(cert.Certificate[0])
	if err != nil {
		panic(err)
	}
	fmt.Println(cert.Leaf)

	// Create tls.Config with desired tls properties
	return &tls.Config{
		// RootCAs = certs used to verify server cert.
		RootCAs: certpool,
		// ClientAuth = whether to request cert from server.
		// Since the server is set up for SSL, this happens
		// anyways.
		ClientAuth: tls.NoClientCert,
		// ClientCAs = certs used to validate client cert.
		ClientCAs: nil,
		// InsecureSkipVerify = verify that cert contents
		// match server. IP matches what is in cert etc.
		// Have to be careful as AWS EC2 has a DNS and IP,
		// and MQTT requires the DNS rather than the IP
		InsecureSkipVerify: true,
		// Certificates = list of certs client sends to server.
		Certificates: []tls.Certificate{cert},
	}
}

// convert received MQTT messsage to map
func (m *MqttManager) messageToMap(jsonString string) (map[string]interface{}, error) {
	var jsonMap map[string]interface{}

	err = json.Unmarshal([]byte(jsonString), &jsonMap)
	if err != nil {
		fmt.Print("Got error extracting JSON")
		fmt.Println(err)
		fmt.Println(jsonString)
		return nil, err
	}

	return jsonMap, nil
}

// process extracted data and insert into db
func (m *MqttManager) processMessage(table string, payload []byte) error {
	// { DeviceID: '', Data: ''}
	// extract data into json format
	extractedData, err := m.messageToMap(string(payload))
	if err != nil {
		fmt.Println("Bad format, cannot add")
		return err
	}

	// format the json values into db format
	timeStampInt := int64(extractedData["TimeStamp"].(float64))
	dataJson, err := json.Marshal(extractedData["Data"])
	dataJsonStr := string(dataJson)
	dataJsonStr = strings.ReplaceAll(dataJsonStr, "\\", "")

	if err != nil {
		fmt.Println(err)
		return err
	}

	insertValues := fmt.Sprintf("%d,'%s','%s'", timeStampInt, extractedData["DeviceID"], dataJsonStr)
	// insert into db
	err = insertDb(table, "`TimeStamp`,`DeviceID`,`Data`", insertValues)
	if err != nil {
		fmt.Println("Error inserting MQTT values, potentially wrong format")
		return err
	}

	return nil
}

// define a function for the default message handler
func (m *MqttManager) createMessageHandler() mqtt.MessageHandler {
	return func(client mqtt.Client, msg mqtt.Message) {
		topic := msg.Topic()
		payload := msg.Payload()

		var path_db_translation string

		notify := false
		sensor := false

		// configure actions upon receiving a message on each route
		switch topic {
		case "/sensors/test": // DEBUGGING CHANNEL ONLY
			fmt.Println("Got Message on Test Channel")
		case "/sensors/GPS":
			path_db_translation = "GPSData"
			sensor = true
		case "/sensors/Movement": // DEBUGGING CHANNEL ONLY
			path_db_translation = "MovementData"
			sensor = true
		case "/sensors/AirQuality":
			path_db_translation = "AirQualityData"
			sensor = true
		case "/sensors/Temperature":
			path_db_translation = "TemperatureData"
			sensor = true
		case "/Status/Parked":
			path_db_translation = "ParkState"
		case "/Status/Stolen":
			notify = true
		default:
			fmt.Println("WARNING: Unrecognized path")
		}

		if notify {
			m.pushNotification(payload)
		}

		if sensor {
			m.processMessage(path_db_translation, payload)
		}
	}
}

// push a notification to the server
func (m *MqttManager) pushNotification(payload []byte) {
	// extract Data
	extractedData, err := m.messageToMap(string(payload))
	if err != nil {
		fmt.Println("Couldn't send push notification")
		fmt.Println(err)
		return
	}

	// check if stolen
	if extractedData["Data"] == "stolen" {
		// Check the Token is Valid
		fmt.Println("trying to send notification")
		rows, err := db.Query("SELECT `User`,`DeviceName` FROM testdb.UserDevices WHERE `DeviceID`=?;", extractedData["DeviceID"])
		if err != nil {
			fmt.Println("error")
			fmt.Println(err)
		}

		// Get all rows, add into a reduced map
		userList := make([][2]string, 0)

		// go through each row
		if rows != nil {
			defer rows.Close()
			for rows.Next() {
				// Individual row processing
				var userRow [2]string
				if err := rows.Scan(&userRow[0], &userRow[1]); err != nil {
					fmt.Println(err.Error())
					break
				}
				// append information
				userList = append(userList, userRow)
			}
		}

		fmt.Println(userList)

		// get each token and push to each device
		for i := 0; i < len(userList); i++ {
			// perform an operation
			// Check the Token is Valid
			rows, err := db.Query("SELECT `Token` FROM testdb.PushNotification WHERE `User`=?;", userList[i][0])
			if err != nil {
				fmt.Println("error")
				fmt.Println(err)
			}

			// Get all rows, add into a reduced map
			var token string

			// go through each row
			if rows != nil {
				defer rows.Close()
				for rows.Next() {
					// Individual row processing
					if err := rows.Scan(&token); err != nil {
						fmt.Println(err.Error())
						break
					}
				}
			}

			// Push notification
			token = fmt.Sprintf("ExponentPushToken[%s]", token)
			fmt.Println(token)
			pushToken, err := expo.NewExponentPushToken(token)
			if err != nil {
				fmt.Println(token)
				fmt.Println(err)
				continue
			}

			// Create new Expo SDK client
			client := expo.NewPushClient(nil)
			fmt.Println(token)

			msg := fmt.Sprintf("%s has been detected as stolen.", userList[i][1])
			title := fmt.Sprintf("Alert: %s Detected Stolen", userList[i][1])

			// Publish message
			response, err := client.Publish(
				&expo.PushMessage{
					To:       []expo.ExponentPushToken{pushToken},
					Body:     msg,
					Data:     map[string]string{"withSome": "data"},
					Sound:    "default",
					Title:    title,
					Priority: expo.DefaultPriority,
				},
			)
			// Check errors
			if err != nil {
				fmt.Println(token)
				fmt.Println(err)
				fmt.Println("error sending notification")
				continue
			}

			// Validate responses
			if response.ValidateResponse() != nil {
				fmt.Println(response.PushMessage.To, "failed")
			}
		}
	}
}

// publish messages
func (m *MqttManager) Publish(topic string, message string) {
	token := m.client.Publish(topic, 0, false, message)
	token.Wait()
}
