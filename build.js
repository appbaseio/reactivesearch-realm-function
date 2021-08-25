const yargs = require("yargs");
const Fs = require('fs')  
const Path = require('path');
const { exit } = require("yargs");
const { execSync } = require('child_process');



const options = yargs
 .usage("Usage: -webhookname <name>")
 .option("webhookname", { alias: "name", describe: "Webhook Name", type: "string", demandOption: true })
 .argv;

const webHookName = options.name

// Check if file exists 
const configPath = Path.join(__dirname, "./realm-app/realm_config.json")

if(!Fs.existsSync(configPath)){
    console.log("Please pull application configuration first")
    exit()
}

// Create webhook directory
const webhookDirectory = Path.join(__dirname, `./realm-app/http_endpoints/http_endpoint/incoming_webhooks/${webHookName}`)
Fs.mkdirSync(webhookDirectory, { recursive: true });


const webHookConfigFileContent = `
{
    "name": "${webHookName}",
    "run_as_authed_user": false,
    "run_as_user_id": "",
    "run_as_user_id_script_source": "",
    "can_evaluate": {},
    "options": {
        "httpMethod": "POST",
        "validationMethod": "NO_VALIDATION"
    },
    "respond_result": true,
    "disable_arg_logs": true,
    "fetch_custom_user_data": false,
    "create_user_on_auth": false
}
`;

const webHookConfigFilePath =  Path.join(webhookDirectory, "config.json")
Fs.writeFileSync(webHookConfigFilePath, webHookConfigFileContent);

const webHookSourceFilePath =  Path.join(webhookDirectory, "source.js")
execSync(`tsc ./src/functions/searchFunction/source.ts && mv ./src/functions/searchFunction/source.js ${webHookSourceFilePath}`);
