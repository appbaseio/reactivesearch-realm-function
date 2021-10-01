package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"

	"github.com/gin-gonic/gin"
	v8 "rogchap.com/v8go"
)

func main() {
	content, err := ioutil.ReadFile("./lib/reactivesearch-realm.min.js") // the file is inside the local directory
	if err != nil {
		fmt.Println("Err")
	}

	v8Ctx, err := v8.NewContext()
	if err != nil {
		fmt.Println("Err")
	}
	v8Ctx.RunScript(string(content), "reactivesearch.js")

	r := gin.Default()
	r.POST("/_reactivesearch/validate", func(c *gin.Context) {
		jsonData, err := ioutil.ReadAll(c.Request.Body)
		if err != nil {
			panic(err)
		}

		var reqBody map[string]interface{}
		err = json.Unmarshal(jsonData, &reqBody)
		if err != nil {
			panic(err)
		}

		query := reqBody["query"]
		queryBytes, _ := json.Marshal(query)

		mongodb := reqBody["mongodb"].(map[string]interface{})
		fmt.Println(mongodb)

		script := fmt.Sprintf(`
			var ref = new reactivesearch.ReactiveSearch({
				client: {},
				database: "%v",
				collection: "%v"
			});
			var data = ref.translate(%s);
			var res = JSON.stringify(data);`, mongodb["db"], mongodb["collection"], string(queryBytes))

		v8Ctx.RunScript(script, "main.js")
		val, _ := v8Ctx.RunScript("res", "value.js")
		obj := val.String()

		var resBody map[string]interface{}
		json.Unmarshal([]byte(obj), &resBody)
		c.JSON(200, resBody)
	})
	r.Run() // listen and serve on 0.0.0.0:8080 (for windows "localhost:8080")
}
