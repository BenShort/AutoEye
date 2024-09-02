package Api

// imports
import (
	"fmt"
	"net/http"

	_ "github.com/go-sql-driver/mysql"

	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
)

// DB mapping
type UserDevice struct {
	User       string `json:"User"`
	DeviceID   string `json:"DeviceID"`
	DeviceName string `json:"DeviceName"`
}

// display UserDevices information
func DisplayUserDevices(c *gin.Context) {
	// make query
	User := c.Query("User")

	if len(User) == 0 {
		c.JSON(http.StatusNotAcceptable, gin.H{"message": "please enter a User"})
		return
	}

	rows, err := db.Query("SELECT `DeviceID`, `DeviceName` FROM testdb.UserDevices WHERE `User`=?;", User)
	if err != nil {
		fmt.Println(err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"message": "error with DB"})
	}

	// Get all rows, add into a reduced map
	UserDevicesList := make([][2]string, 0)

	// go through each row
	if rows != nil {
		defer rows.Close()
		for rows.Next() {
			// Individual row processing
			var UserDevicesRow [2]string
			if err := rows.Scan(&UserDevicesRow[0], &UserDevicesRow[1]); err != nil {
				fmt.Println(err.Error())
				c.JSON(http.StatusInternalServerError, gin.H{"message": "error with DB"})
				break
			}
			// append information
			UserDevicesList = append(UserDevicesList, UserDevicesRow)
		}
	}

	defer rows.Close()

	// return JSON of all rows
	returnSuccess(c, &UserDevicesList)
}

// Add the UserDevice
func AddUserDevice(c *gin.Context) {
	// variables
	var NewUserDevice UserDevice

	// input Queries
	NewUserDevice.User = c.Query("User")
	NewUserDevice.DeviceID = c.Query("DeviceID")
	NewUserDevice.DeviceName = c.Query("DeviceName")

	existsEmpty, emptyFields := checkEmptyFields(NewUserDevice)

	// check the input queries were inputted
	if existsEmpty {
		message := fmt.Sprintf("Please enter: %s", emptyFields)
		c.JSON(http.StatusNotAcceptable, gin.H{"message": message})
		return
	}

	// insert entry into the db
	sqlCommand := fmt.Sprintf("INSERT INTO `UserDevices` (`User`,`DeviceID`, `DeviceName`) VALUES('%s','%s','%s');", NewUserDevice.User, NewUserDevice.DeviceID, NewUserDevice.DeviceName)

	// do query
	err = insertQuery(c, sqlCommand)
	if err != nil {
		return
	}

	// log
	fmt.Println("created UserDevices entry", NewUserDevice)

	// success
	returnCreated(c)
}
