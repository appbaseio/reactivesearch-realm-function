const yargs = require('yargs');
const { execSync } = require('child_process');
const cliProgress = require('cli-progress');

const WEBHOOK_NAME = 'reactivesearch';

const options = yargs
	.usage(
		'Usage: --private-api-key <private api key> --api-key <public api key> --app-id <application id>',
	)
	.option('private-api-key', {
		alias: 'private_api_key',
		describe: 'Private API Key',
		type: 'string',
		demandOption: true,
	})
	.option('api-key', {
		alias: 'api_key',
		describe: 'Public API Key',
		type: 'string',
		demandOption: true,
	})
	.option('app-id', {
		alias: 'app_id',
		describe: 'Application ID',
		type: 'string',
		demandOption: true,
	})
	.option('app-authentication', {
		alias: 'app_authentication',
		describe: 'Application Authentication',
		type: 'string',
		demandOption: false,
	})
	.option('-v', {
		alias: 'verbose',
		describe: 'Verbose',
		demandOption: false,
	}).argv;

const { api_key, private_api_key, app_id, app_authentication, verbose } =
	options;
const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);

let webhookEndpoint;
console.log('\nDeploying ReactiveSearch API as a Realm function\n');
let step = -1;
try {
	bar.start(5, ++step);
	execSync(
		`./node_modules/mongodb-realm-cli/realm-cli login --api-key=${api_key} --private-api-key=${private_api_key}`,
	);
	bar.update(++step);
	execSync(
		`rm -rf realm-app && ./node_modules/mongodb-realm-cli/realm-cli pull --local=./realm-app  --remote=${app_id}`,
	);
	bar.update(++step);
	execSync(
		`node build --name=${WEBHOOK_NAME}` +
			(app_authentication ? ` --app-authentication=${app_authentication}` : ''),
	);
	bar.update(++step);
	execSync(
		`./node_modules/mongodb-realm-cli/realm-cli push --local=./realm-app --yes`,
	);
	bar.update(++step);
	const appDescription = JSON.parse(
		execSync(
			`./node_modules/mongodb-realm-cli/realm-cli app describe --app=${app_id}`,
		)
			.toString()
			.replace('App description', ''),
	);
	let { http_endpoints } = appDescription;
	http_endpoints.map((endpoint) =>
		endpoint.webhooks.map((hook) => {
			if (hook.name === WEBHOOK_NAME) {
				webhookEndpoint = hook.url;
			}
		}),
	);
	bar.update(++step);
	bar.stop();
	console.info('\n Successfully deployed webhook.');
} catch (error) {
	switch (step) {
		case 0:
			console.error(
				'\n Deployment Failed: Please check you public and private api keys',
			);
			break;
		case 1:
			console.error(
				'\n Deployment Failed: Unable to pull application configuration. Please check your application id.',
			);
			break;
		case 2:
			console.error(
				'\n Deployment Failed: Please make sure to run yarn install or npm install',
			);
			break;
		case 3:
			console.error(
				'\n Deployment Failed: Unable to push application configuration. Please check your application id.',
			);
			break;
		case 4:
			console.error(
				'\n Deployment Failed: Unable to find endpoint of http webhook',
			);
			break;
	}
	if (verbose) {
		console.log('\n');
		console.log(error.toString());
	}

	console.error('\n Failed to deploy webhook');
	bar.stop();
}

if (webhookEndpoint) {
	console.info(`\n Deployed webhook endpoint : ${webhookEndpoint}`);
	console.log(
		`\n You can make a test request to this webhook using this curl command \n`,
	);
	console.log(`curl -XPOST ${webhookEndpoint} \\
        -H "Content-Type: application/json" \\
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
     `);
} else {
	console.error("\n Something went wrong. We aren't able to find endpoint");
}
