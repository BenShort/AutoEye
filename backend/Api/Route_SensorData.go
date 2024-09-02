package Api

// imports
import (
	"database/sql"
	"fmt"
	"net/http"

	_ "github.com/go-sql-driver/mysql"

	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
)

///// SensorData /////

type SensorData struct {
	TimeStamp int    `json:"TimeStamp"`
	DeviceID  string `json:"DeviceID"`
	Data      string `json:"Data"`
}

func processSQLResults(rows *sql.Rows) ([]SensorData, error) {
	// Get all rows, add into the UserDevice Struct
	sensorDataList := make([]SensorData, 0)

	// go through each row
	if rows != nil {
		defer rows.Close()

		for rows.Next() {
			// Individual row processing
			sensorDataRow := SensorData{}

			// Scan Each Row
			if err := rows.Scan(&sensorDataRow.TimeStamp, &sensorDataRow.DeviceID, &sensorDataRow.Data); err != nil {
				fmt.Println(err.Error())
				return nil, err
			}
			// append information
			sensorDataList = append(sensorDataList, sensorDataRow)
		}
	}

	return sensorDataList, nil
}

///// Routes //////

func DisplaySensorData(table string) gin.HandlerFunc {
	handle := func(c *gin.Context) {
		// ensure table not empty
		if table == "" {
			panic("No Table Entered")
		}

		// make query
		DeviceID := c.Query("DeviceID")

		// Check Query was entered
		if len(DeviceID) == 0 {
			c.JSON(http.StatusNotAcceptable, gin.H{"message": "please enter a DeviceID"})
			return
		}

		query := fmt.Sprintf("SELECT * FROM testdb.`%s` WHERE `DeviceID`='%s' ORDER BY `TimeStamp` DESC LIMIT 1;", table, DeviceID)
		fmt.Println(query)
		rows, err := db.Query(query) // http.ResponseWriter, r *http.Request WHERE `DeviceID`=?;", DeviceID)
		if err != nil {
			fmt.Println(err.Error())
			c.JSON(http.StatusInternalServerError, gin.H{"message": "error with DB"})
		}

		SensorData, err := processSQLResults(rows)
		fmt.Println("TD:")
		fmt.Print(SensorData)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "error with DB"})
		}

		defer rows.Close()

		// return JSON of all rows
		returnSuccess(c, &SensorData)
	}

	return gin.HandlerFunc(handle)
}

// display sensor data between a range
func DisplaySensorDataRange(table string) gin.HandlerFunc {
	handle := func(c *gin.Context) {
		// ensure table not empty
		if table == "" {
			panic("No Table Entered")
		}

		// make query
		DeviceID := c.Query("DeviceID")
		startTime, err := stoiAndCheckEmpty(c, c.Query("StartTime"))
		if err != nil {
			fmt.Println(err)
			return
		}

		endTime, err := stoiAndCheckEmpty(c, c.Query("EndTime"))
		if err != nil {
			fmt.Println(err)
			return
		}

		// Check Query was entered
		if len(DeviceID) == 0 {
			c.JSON(http.StatusNotAcceptable, gin.H{"message": "please enter a DeviceID"})
			return
		}

		query := fmt.Sprintf("SELECT * FROM testdb.`%s` WHERE `DeviceID`='%s' AND `TimeStamp` >= %d AND `TimeStamp` <= %d;", table, DeviceID, startTime, endTime)
		fmt.Println(query)
		rows, err := db.Query(query) // http.ResponseWriter, r *http.Request WHERE `DeviceID`=?;", DeviceID)
		if err != nil {
			fmt.Println(err.Error())
			c.JSON(http.StatusInternalServerError, gin.H{"message": "error with DB"})
		}

		SensorData, err := processSQLResults(rows)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "error with DB"})
		}

		defer rows.Close()

		// return JSON of all rows
		returnSuccess(c, &SensorData)
	}

	return gin.HandlerFunc(handle)
}
