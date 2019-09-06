package handlers

import (
	"database/sql"
	"errors"
	"github.com/guoapeng/props"
	_ "github.com/mattn/go-sqlite3"
	"log"
	"time"
)

const (
	DRIVERNAME = "DRIVERNAME"
	DATASOURCENAME = "DATASOURCENAME"
)

type DataSource struct {
	DriverName string
	DataSourceName string
}

func (ds *DataSource) open() (*sql.DB, error) {
	db, err := sql.Open("sqlite3", "./classmates.db")
	if err != nil {
		log.Printf("Open mysql failed,err:%v\n", err)
		return nil, err
	} else {
		db.SetConnMaxLifetime(100 * time.Second)
		db.SetMaxOpenConns(100)
		db.SetMaxIdleConns(16)
		return db, nil
	}
}

func NewDataSource() *DataSource {
	if appConf, err := propsReader.New(); err == nil {
		return &DataSource{DriverName: appConf.Get(DRIVERNAME), DataSourceName: appConf.Get(DATASOURCENAME)}
	} else {
		panic("failed to create data source during reading properties")
	}
}

func (template *GdbcTemplate) Insert(sql string, args ...interface{}) (sql.Result, error) {
	if db, err := template.datasource.open(); err == nil {
		result,err:=db.Exec(sql, args...)
		return result, err
	} else {
		return nil, errors.New("failed to open db!")
}

}
func (template *GdbcTemplate) QueryOne(sql string, args ...interface{}) (func(dest ...interface{}) (error)) {
	if db, err := template.datasource.open(); err == nil {
		defer db.Close()
		queryStmt, err := db.Prepare(sql)
		if err != nil {
			log.Fatal(err)
		}
		row := queryStmt.QueryRow(args...)
		return func(dest ...interface{}) (error) {
			if err := row.Scan(dest...); err != nil {
				log.Printf("scan failed, err:%v \n", err)
				return err
			} else {
				return nil
			}
		}
	} else {
		return func(dest ...interface{}) (error) {
			log.Printf("Open mysql failed,err:%v\n", err)
			return err
		}
	}
}

type GdbcTemplate struct {
	datasource DataSource
	fetchSize  int
}

func (template *GdbcTemplate) query(sql string, obj *interface{}) error {
	return nil
}

func New() *GdbcTemplate {
	return &GdbcTemplate{datasource: *NewDataSource()}
}
