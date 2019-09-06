package router

import (
	"github.com/gin-gonic/gin"
	"philoenglish.com/httphandler"
)

func ConfigureRoutingRule(r *gin.Engine){
	r.GET("/user/:name",handlers.Register)
	r.GET("/classmates/:name",handlers.QueryClassMate)
	r.GET("/index.html",handlers.HomePage)
	r.GET("/",handlers.HomePage)
	r.GET("/templates/:page",handlers.NagigateToHtml)
	r.POST("/classmate/api/register",handlers.UserRegister)
}


