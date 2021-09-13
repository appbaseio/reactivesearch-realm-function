const yargs = require('yargs');
const Fs = require('fs');
const Path = require('path');
const { exit } = require('yargs');
const { execSync } = require('child_process');

const { Base64 } = require('js-base64');

const options = yargs
	.usage('Usage: -webhookname <name>')
	.option('webhookname', {
		alias: 'name',
		describe: 'Webhook Name',
		type: 'string',
		demandOption: true,
	})
	.option('app-authentication', {
		alias: 'app_authentication',
		describe: 'Application Authentication',
		type: 'string',
		demandOption: false,
	}).argv;

const webHookName = options.name;
const { app_authentication } = options;

// Check if file exists
const configPath = Path.join(__dirname, './realm-app/realm_config.json');

if (!Fs.existsSync(configPath)) {
	console.log('Please pull application configuration first');
	exit();
}

const httpEndpointConfig = `
{
    "name": "http_endpoint",
    "type": "http",
    "config": {},
    "version": 1
}
`;

const httpEndpointDirectory = Path.join(
	__dirname,
	`./realm-app/http_endpoints/http_endpoint`,
);
Fs.mkdirSync(httpEndpointDirectory, { recursive: true });
Fs.writeFileSync(`${httpEndpointDirectory}/config.json`, httpEndpointConfig);

// Create webhook directory
const webhookDirectory = Path.join(
	__dirname,
	`./realm-app/http_endpoints/http_endpoint/incoming_webhooks/${webHookName}`,
);
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

const webHookConfigFilePath = Path.join(webhookDirectory, 'config.json');
Fs.writeFileSync(webHookConfigFilePath, webHookConfigFileContent);

const webHookSourceFilePath = Path.join(webhookDirectory, 'source.js');

if (!Fs.existsSync('dist')) {
	Fs.mkdirSync('dist');
}
execSync(
	`concat -o dist/source.ts ./src/searchFunction/source.ts ./src/constants.ts ./src/utils.ts ./src/types/* ./src/validators/* ./src/targets/* ./src/searchFunction/index.ts`,
);
execSync(`cp ./src/searchFunction/realm.d.ts ./dist/realm.d.ts`);

const regex =
	/import(?:["'\s]*([\w*{}\n\r\t, ]+)from\s*)?["'\s].*([@\w_-]+)["'\s].*;$/gm;
const data = Fs.readFileSync('./dist/source.ts', { encoding: 'utf-8' });
var result = data.replace(regex, '');
Fs.writeFileSync('./dist/source.ts', result, { encoding: 'utf-8' });

execSync(`sed -i 's/export const/const/g' ./dist/source.ts`);
execSync(`sed -i 's/export type/type/g' ./dist/source.ts`);
base64;
if (app_authentication) {
	execSync(
		`sed -i 's/AUTHORIZATION_CREDENTIALS = null/AUTHORIZATION_CREDENTIALS = ${Base64.encode(
			app_authentication,
		)}/g' ./dist/source.ts`,
	);
}
execSync(`tsc ./dist/source.ts`);
execSync(`sed -i 's/exports\.__esModule = true;//g' ./dist/source.js`);
execSync(`sed -i 's/exports\.ReactiveSearch.*;//g' ./dist/source.js`);

execSync(`mv ./dist/source.js ${webHookSourceFilePath}`);
