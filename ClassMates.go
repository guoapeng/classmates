package main

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	propsReader "github.com/guoapeng/props"
	"philoenglish.com/router"
)

func main() {
	//https://bootsnipp.com/snippets/vl4R7

	if appConif, err := propsReader.NewFactory("classmates", "config.properties").New(); err != nil {
		log.Fatal("failed to load mandatory properties")
		panic(err)
	} else {
		r := gin.Default()
		port := appConif.Get("httpPort")
		r.LoadHTMLGlob("static/templates/*.html")
		r.StaticFS("/static", http.Dir("static"))
		r.StaticFile("/styles.css", "./css/styles.css")
		r.StaticFile("/index.js", "./js/index.js")
		router.ConfigureRoutingRule(r)
		log.Println("listen and serving on 0.0.0.0:", port)
		r.Run(":" + port)
	}
}
