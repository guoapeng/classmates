module main

go 1.12

require (
	github.com/gin-gonic/gin v1.4.0
	github.com/go-sql-driver/mysql v1.4.1
	github.com/guoapeng/gdbcTemplate v1.0.0 // indirect
	github.com/guoapeng/nullable v1.0.2
	github.com/guoapeng/props v1.0.3
	philoenglish.com/httphandler v1.0.0
	philoenglish.com/router v1.0.0
)

replace philoenglish.com/router => ./philoenglish.com/router

replace philoenglish.com/httphandler => ./philoenglish.com/httphandler
