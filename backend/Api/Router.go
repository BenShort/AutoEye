package Api

// imports
import (
	"crypto/tls"
	"crypto/x509"
	"fmt"
	"io/ioutil"
	"net/http"
	"strconv"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	_ "github.com/go-sql-driver/mysql"

	mh "AutoEye/backend/MqttHandler"
)

/////////// COMMON REQUEST RETURNS in Module ///////////

// return_success called at the end of each response
func returnSuccess(c *gin.Context, message interface{}) {
	c.Header("Access-Control-Allow-Origin", "*")
	c.Header("Access-Control-Allow-Headers", "access-control-allow-origin, access-control-allow-headers")
	c.JSON(http.StatusOK, message)
}

// return_added called at the end of each add response
func returnCreated(c *gin.Context) {
	message := "entry success"
	c.Header("Access-Control-Allow-Origin", "*")
	c.Header("Access-Control-Allow-Headers", "access-control-allow-origin, access-control-allow-headers")
	c.JSON(http.StatusCreated, &message)
}

func stoiAndCheckEmpty(c *gin.Context, input string) (int, error) {
	output, err := strconv.Atoi(input)
	if err != nil {
		c.JSON(http.StatusNotAcceptable, gin.H{"message": "not type int"})
		return 0, err
	}
	return output, nil
}

////////////// ApiManager //////////////

type ApiManager struct {
	router     *gin.Engine
	port       string
	MM         *mh.MqttManager
	enableMqtt bool
}

// init with https
func (a *ApiManager) InitHttps(port string, MM *mh.MqttManager, enableMqtt bool, caFilePath string, certFilePath string, keyFilePath string) error {
	fmt.Println("Starting API with HTTPS")

	a.MM = MM
	a.enableMqtt = enableMqtt

	err = setupMySQL()
	if err != nil {
		return err
	}

	a.router = a.setupRoutes()

	// Load the TLS certificate and private key
	tlsConfig := &tls.Config{}
	cert, err := tls.LoadX509KeyPair(certFilePath, keyFilePath)
	if err != nil {
		panic("Failed to load TLS certificate and key: " + err.Error())
	}
	tlsConfig.Certificates = []tls.Certificate{cert}

	// Load the CA certificate
	if caFilePath != "" {
		caCert, err := ioutil.ReadFile(caFilePath)
		if err != nil {
			panic("Failed to read CA certificate: " + err.Error())
		}
		caPool := x509.NewCertPool()
		caPool.AppendCertsFromPEM(caCert)
		tlsConfig.ClientCAs = caPool
		tlsConfig.ClientAuth = tls.RequireAndVerifyClientCert
	}

	// Create an HTTP server with the TLS configuration
	server := &http.Server{
		Addr:      ":8081",
		Handler:   a.router,
		TLSConfig: tlsConfig,
	}

	// Run the server
	err = server.ListenAndServeTLS(certFilePath, keyFilePath)
	if err != nil {
		panic("Failed to start server: " + err.Error())
	}

	return nil
}

// init with http
func (a *ApiManager) InitHttp(port string, MM *mh.MqttManager, enableMqtt bool) error {
	fmt.Println("Starting API")

	a.MM = MM
	a.enableMqtt = enableMqtt

	err = setupMySQL()
	if err != nil {
		return err
	}

	a.router = a.setupRoutes()

	err = a.router.Run(port)
	if err != nil {
		fmt.Println("Got error starting API over HTTP")
		return err
	}

	return nil
}

func (a *ApiManager) indexView(c *gin.Context) {
	c.Header("Access-Control-Allow-Origin", "*")
	c.Header("Access-Control-Allow-Headers", "access-control-allow-origin, access-control-allow-headers")
	c.JSON(http.StatusOK, gin.H{"message": "HotChips"})
}

// Setup Gin Routes
func (a *ApiManager) setupRoutes() *gin.Engine {
	// setup router
	router := gin.Default()
	config := cors.DefaultConfig()

	// create custom config to allow all standard types of requests
	config.AllowAllOrigins = true
	config.AllowMethods = []string{"Get", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"}
	router.Use(cors.New(config))

	// Set main route, used for checking connection
	router.GET("/", a.indexView)

	// Set routes for api

	// Registered User Devices
	router.GET("/UserDevices/List", DisplayUserDevices)
	router.PUT("/UserDevices/Add", AddUserDevice)
	// Registered Push Notifications
	router.PUT("/Notifications/AddToken", AddToken)
	router.DELETE("/Notifications/RemoveToken", RemoveToken)

	/////////////////////
	////// SENSORS //////
	/////////////////////

	// GPS
	router.GET("/GPS/GetLatestData", DisplaySensorData("GPSData"))
	// Temperature
	router.GET("/Temperature/GetLatestData", DisplaySensorData("TemperatureData"))
	router.GET("/Temperature/GetHistoricalData", DisplaySensorDataRange("TemperatureData"))
	// Movement - DEBUG USE ONLY
	router.GET("/Movement/GetLatestData", DisplaySensorData("MovementData"))
	// AirQuality
	router.GET("/AirQuality/GetLatestData", DisplaySensorData("AirQualityData"))

	// Parked
	router.GET("/ParkState/Get", DisplayState("ParkState"))
	router.PUT("/ParkState/Modify", a.PutState("ParkState"))

	// Set up Gin Server
	return router
}
