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
type PushNotification struct {
	User  string `json:"User"`
	Token string `json:"Token"`
}

// Add the UserDevice
func AddToken(c *gin.Context) {
	// variables
	var pn PushNotification

	// input Queries
	pn.User = c.Query("User")
	pn.Token = c.Query("Token")

	existsEmpty, emptyFields := checkEmptyFields(pn)

	// check the input queries were inputted
	if existsEmpty {
		message := fmt.Sprintf("Please enter: %s", emptyFields)
		c.JSON(http.StatusNotAcceptable, gin.H{"message": message})
		return
	}

	// insert entry into the db
	sqlCommand := fmt.Sprintf("INSERT INTO `PushNotification` (`User`,`Token`) VALUES('%s','%s');", pn.User, pn.Token)

	// do query
	err = insertQuery(c, sqlCommand)
	if err != nil {
		return
	}

	// success
	returnCreated(c)
}

// Add the UserDevice
func RemoveToken(c *gin.Context) {
	// variables
	var pn PushNotification

	// input Queries
	pn.User = c.Query("User")
	pn.Token = c.Query("Token")

	existsEmpty, emptyFields := checkEmptyFields(pn)

	// check the input queries were inputted
	if existsEmpty {
		message := fmt.Sprintf("Please enter: %s", emptyFields)
		c.JSON(http.StatusNotAcceptable, gin.H{"message": message})
		return
	}

	// insert entry into the db
	sqlCommand := fmt.Sprintf("DELETE FROM `PushNotification` WHERE `User`=? AND `Token`=?;", pn.User, pn.Token)

	// do query
	req, err := db.Query(sqlCommand)
	if err != nil {
		fmt.Println(err)
		return
	}

	req.Close()

	message := "deleted success"
	c.Header("Access-Control-Allow-Origin", "*")
	c.Header("Access-Control-Allow-Headers", "access-control-allow-origin, access-control-allow-headers")
	c.JSON(http.StatusOK, &message) // deleted successfully
}
