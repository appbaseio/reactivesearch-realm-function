# Deploy To Realm

Deploy ReactiveSearch API as a MongoDB Realm app function with a single command.

### **Pre-requisites**

1. You need to have a Cloud Atlas MongoDB cluster, as Atlas Search only works in this mode.
2. You need to create an API key.
    
    There are two options for creating an API key in Atlas Cloud. You can either start with an Organization level API key and add that to your project or directly create a project level API key.
    
    - **Option 1:** Organization level API key
        1. Create API key
            
            ![https://i.imgur.com/O4B6Tco.png](https://i.imgur.com/O4B6Tco.png)
            
            **Organization Member** permission is sufficient.
            
        
        1. Copy the **Public Key** and **Private Key** from the next page.
            
            ![https://i.imgur.com/y4Z9uaU.png](https://i.imgur.com/y4Z9uaU.png)
            
        
        1. Go to the Project where this API key should be used. Visit that project's Access Manager and invite this API key.
            
            ![https://i.imgur.com/faA8ErC.png](https://i.imgur.com/faA8ErC.png)
            
            Invite the org level API key
            
            The API key needs a **Project Owner** permission to be able to deploy code to your Realm app.
            
    
    **OR**
    
    - **Option 2:** Project level API key
        1. Create API key
            
            ![https://i.imgur.com/J8lKs5K.png](https://i.imgur.com/J8lKs5K.png)
            
            The API key needs a **Project Owner** permission to be able to deploy code to your Realm app.
            
        
        1. Copy the **Public Key** and **Private Key** from the next page.
            
            ![https://i.imgur.com/IKurMrO.png](https://i.imgur.com/IKurMrO.png)
            
    
3. **Command to deploy:**
    
    ```bash
    node rs-cli --private-api-key $private_key --api-key $public_key --app-id $app_id
    ```
    
    Once you have cloned the project and run `yarn` or `npm install` to install the project dependencies, you can run the following command to deploy the ReactiveSearch API to your project.
    
    where
    
    - `--private-api-key` refers to the private API key from the above step
    - `--api-key` refers to the public API key from the above step
    - `--app-id` refers to your Realm App id. You can get this by going to your Project > Realm > Application view.
        
        ![https://i.imgur.com/E4f5mvq.png](https://i.imgur.com/E4f5mvq.png)
        
        e.g., `application-3-jrkwf` is the App ID for this application.
        
         
        
    
    The output of the deploy command will appear as follows:
    
    ```bash
    Deploying ReactiveSearch API as a Realm function
    
     ████████████████████████████████████████ 100% | ETA: 0s | 5/5
    
     Successfully deployed webhook.
    
     Deployed webhook endpoint : https://us-east-1.aws.webhooks.mongodb-realm.com/api/client/v2.0/app/application-3-jrkwf/service/http_endpoint/incoming_webhook/reactivesearch
    
     You can make a test request to this webhook using this curl command
    
    curl -XPOST https://us-east-1.aws.webhooks.mongodb-realm.com/api/client/v2.0/app/application-3-jrkwf/service/http_endpoint/incoming_webhook/reactivesearch  \
            -H "Content-Type: application/json" \
            -d '{
    	"query": [{
    		"id": "search",
    		"dataField": "*",
    		"size": 5
    	}],
    	"mongodb": {
    		"db": "'"$database"'",
    		"collection": "'"$collection"'"
    	}
    }'
    ```
    
    **Deploy with Basic Authentication**
    
    The deployment function also comes with built-in support to deploy with Basic Auth enabled. You can pass the plain-text values to use for Basic Auth with the `--app-authentication` flag.
    
    ```bash
    node rs-cli --private-api-key $private_key --api-key $public_key --app-id $app_id --app-authentication my-user:my-password
    ```
    
    - `--app-authentication` flag expects username password in a $user:$password format.