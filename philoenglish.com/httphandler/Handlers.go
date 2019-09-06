package handlers

import (
	"github.com/gin-gonic/gin"
	"github.com/guoapeng/nullable"
	"log"
)

var dbtemplate = New()

type ClassMate struct {
	UserId int64 `json:"id"`
	UserName string `json:"userName"`
	Password string
	Description nullable.String `json:"description"`
}

func Register(c *gin.Context) {
	name := c.Param("name")
	c.JSON(200, gin.H{
		"message": name,
	})
}

type UserInfor struct {
	UserName string
	Password string
}

func UserRegister(c *gin.Context) {
	var info UserInfor
	err := c.BindJSON(&info)
	if err!=nil {
		log.Fatal("failed to read data from body")
		c.JSON(400, gin.H{
			"data": "failed",
			"msg": "数据格式有误",
		})
	} else{
		log.Printf("username:%s, password %s",info.UserName, info.Password )
		dbtemplate.Insert("INSERT INTO USER(USER_NAME,PASSWORD) VALUES (?,?)", info.UserName, info.Password)
		c.JSON(200, gin.H{
			"data": "success",
		})
	}

}

func QueryClassMate(c *gin.Context)  {
	name := c.Param("name")
	if user, error := queryClassMate(name); error == nil {
		c.JSON(200, gin.H{
			"data": user,
		})
	} else {
		c.JSON(500, gin.H{
			"error": error,
		})
	}
}

func HomePage(c *gin.Context) {
	c.HTML(200,"index.html",nil)
}


func NagigateToHtml(c *gin.Context) {
	page := c.Param("page")
	c.HTML(200,page,nil)
}

func queryClassMate(name string) (*ClassMate, error){
	sql :="select ID, \n" +
		"         NAME, \n" +
		"         DESCRIPTION \n" +
		"  from CLASSMATES \n" +
		" where NAME=?"
	user := new(ClassMate)
	error := dbtemplate.QueryOne(sql, name)(&user.UserId, &user.UserName,&user.Description)
	return user, error
}

