package Api

// imports
import (
	"database/sql"
	"fmt"
	"net/http"
	"strconv"

	_ "github.com/go-sql-driver/mysql"

	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
)

// DB mapping
type State struct {
	DeviceID string `json:"DeviceID"`
	State    int    `json:"State"`
}

// display sensor data between a range
func DisplayState(table string) gin.HandlerFunc {
	handle := func(c *gin.Context) {
		// ensure table not empty
		if table == "" {
			panic("No Table Entered")
		}

		// make query
		var s State
		s.DeviceID = c.Query("DeviceID")

		if len(s.DeviceID) == 0 {
			c.JSON(http.StatusNotAcceptable, gin.H{"message": "please enter a DeviceID"})
			return
		}

		SQ := fmt.Sprintf("SELECT `State` FROM `testdb`.`%s` WHERE `DeviceID`='%s' LIMIT 1;", table, s.DeviceID)
		stateQuery := db.QueryRow(SQ)
		switch err := stateQuery.Scan(&s.State); err {
		case sql.ErrNoRows:
			// insert
			IQ := fmt.Sprintf("INSERT INTO `testdb`.`%s` (`DeviceID`,`State`) VALUES ('%s',%d)", table, s.DeviceID, 0)
			req, err := db.Query(IQ)
			if err != nil {
				fmt.Println(err.Error())
				c.JSON(http.StatusInternalServerError, gin.H{"message": "error with DB"})
			}
			req.Close()
			returnCreated(c)
		case nil:
			// req.Close()
			returnSuccess(c, &s.State)
			return
		default:
			fmt.Println(err.Error())
			// req.Close()
			c.JSON(http.StatusInternalServerError, gin.H{"message": "error with DB"})
			return
		}
	}

	return gin.HandlerFunc(handle)
}

// display sensor data between a range
func (a *ApiManager) PutState(table string) gin.HandlerFunc {
	handle := func(c *gin.Context) {
		// ensure table not empty
		if table == "" {
			panic("No Table Entered")
		}
		var s State

		// input Queries
		s.DeviceID = c.Query("DeviceID")
		stateString := c.Query("State")
		s.State, err = strconv.Atoi(stateString)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Please enter Integer for State"})
			return
		}

		existsEmpty, emptyFields := checkEmptyFields(s)

		// check the input queries were inputted
		if existsEmpty {
			message := fmt.Sprintf("Please enter: %s", emptyFields)
			c.JSON(http.StatusNotAcceptable, gin.H{"message": message})
			return
		}

		// select latest session to latch onto
		q := fmt.Sprintf("INSERT INTO `testdb`.`%s` (`DeviceID`,`State`) VALUES ('%s',%d) ON DUPLICATE KEY UPDATE `State`=%d;", table, s.DeviceID, s.State, s.State)
		fmt.Println(q)
		req, err := db.Query(q)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "error with DB"})
			fmt.Println(err)
			// req.Close()
			return
		}

		// publish to mqtt if enabled
		if a.enableMqtt {
			topic := fmt.Sprintf("/Status/Parked")
			message := fmt.Sprintf("{\"DeviceID\" : \"%s\", \"State\" : %s}", s.DeviceID, stateString)
			a.MM.Publish(topic, message)
		}

		req.Close()
		c.JSON(http.StatusOK, gin.H{"message": "Success"})
		return
	}
	return gin.HandlerFunc(handle)
}
