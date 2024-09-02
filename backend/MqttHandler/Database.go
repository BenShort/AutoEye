package MqttHandler

// imports
import (
	"database/sql"
	"fmt"
	"log"
	"strconv"

	_ "github.com/go-sql-driver/mysql"
)

// db variables
var (
	db  *sql.DB
	err error
)

func setupMySQL() {
	// open db
	db, err = sql.Open("mysql", "root:helloworld@tcp(172.17.0.1:3306)/testdb?timeout=5s")
	// check if db opened
	if err != nil {
		fmt.Println(err.Error())
	}

	if err = db.Ping(); err != nil {
		fmt.Println(err.Error())
	}

	// add log to check upon startup
	log.Println("connected to mysql")
}

func insertDb(table string, columns string, values string) error {
	// do query
	query := fmt.Sprintf("INSERT INTO `testdb`.`%s` (%s) VALUES(%s);", table, columns, values)
	fmt.Println(query)

	req, err := db.Query(query)
	if err != nil {
		fmt.Println(err)
		return err
	}

	req.Close()

	return nil
}

func stoiAndCheckEmpty(input string) (int, error) {
	output, err := strconv.Atoi(input)
	if err != nil {
		return 0, err
	}

	return output, nil
}
