package Api

// imports
import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"reflect"

	"github.com/gin-gonic/gin"
	_ "github.com/go-sql-driver/mysql"
)

// db variables
var (
	db  *sql.DB
	err error
)

//// Sql Specific Functions ////

func setupMySQL() error {
	// open db
	db, err = sql.Open("mysql", "root:helloworld@tcp(172.17.0.1:3306)/testdb?timeout=5s")
	// check if db opened
	if err != nil {
		fmt.Println(err.Error())
		return err
	}

	if err = db.Ping(); err != nil {
		fmt.Println(err.Error())
		return err
	}

	// add log to check upon startup
	log.Println("connected to mysql")
	return nil
}

// db insert query
func insertQuery(c *gin.Context, query string) error {
	// do query
	req, err := db.Query(query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "error inserting values into db"})
		return err
	}

	req.Close()

	return nil
}

// /// Generic Methods /////

// check if generic type is empty
func isEmptyValue(value reflect.Value) bool {
	switch value.Kind() {
	case reflect.Array, reflect.Chan, reflect.Map, reflect.Slice, reflect.String:
		return value.Len() == 0
	case reflect.Bool:
		return !value.Bool()
	case reflect.Int:
		return value.Interface == nil // ensures integers equal to 0 aren't evaluated as "empty"
	case reflect.Struct:
		// Check if all fields of the struct are empty
		for i := 0; i < value.NumField(); i++ {
			if !isEmptyValue(value.Field(i)) {
				return false
			}
		}
		return true
	default:
		// For all other types, compare with the zero value
		zero := reflect.Zero(value.Type())
		return value.Interface() == zero.Interface()
	}
}

// checkEmptyFields checks if any fields of a given struct are empty.
func checkEmptyFields(data interface{}) (isEmpty bool, emptyFields []string) {
	value := reflect.ValueOf(data)
	if value.Kind() != reflect.Struct {
		return false, nil
	}

	// iterate through each field
	for i := 0; i < value.NumField(); i++ {
		field := value.Type().Field(i)
		fieldValue := value.Field(i)

		// check if empty
		if isEmptyValue(fieldValue) {
			isEmpty = true
			emptyFields = append(emptyFields, field.Name)
		}
	}
	return isEmpty, emptyFields
}
