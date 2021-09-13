const yargs = require('yargs');
const { execSync } = require('child_process');
const cliProgress = require('cli-progress');

const WEBHOOK_NAME = 'reactivesearch';

const options = yargs
	.usage(
		'Usage: -private-api-key <private api key> -api-key <public api key> -app-id <application id>',
	)
	.option('private-api-key', {
		alias: 'api_key',
		describe: 'Private API Key',
		type: 'string',
		demandOption: true,
	})
	.option('api-key', {
		alias: 'public_api_key',
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
	}).argv;

const { api_key, public_api_key, app_id, app_authentication } = options;
const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);

let webhookEndpoint;
console.log('\nDeploying webhook\n');
try {
	bar.start(5, 0);
	execSync(
		`./node_modules/mongodb-realm-cli/realm-cli login --api-key=${public_api_key} --private-api-key=${api_key}`,
	);
	bar.update(1);
	execSync(
		`rm -rf realm-app && ./node_modules/mongodb-realm-cli/realm-cli pull --local=./realm-app  --remote=${app_id}`,
	);
	bar.update(2);
	execSync(
		`node build --name=${WEBHOOK_NAME}` +
			(app_authentication ? ` --app-authentication=${app_authentication}` : ''),
	);
	bar.update(3);
	execSync(
		`./node_modules/mongodb-realm-cli/realm-cli push --local=./realm-app --yes`,
	);
	bar.update(4);
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
	bar.update(5);
	bar.stop();
	console.info('\n Successfully deployed webhook.');
} catch (error) {
	console.log(error);
	console.error('\n Failed to deploy webhook');
	bar.stop();
}

if (webhookEndpoint) {
	console.info(`\n Deployed webhook endpoint : ${webhookEndpoint}`);
	console.log(
		`\n You can make a test request to this webhook using this curl command \n`,
	);
	console.log(`curl \\
        -H "Content-Type: application/json" \\
        -d {
			query: [{
				id: 'search',
				type: 'search', // default to search
				dataField: '*',
				size: 5
			}],
			config: {
				database: <database>,
				collection: <collection>
			}
		}'
        ${webhookEndpoint}
     `);
} else {
	console.error("\n Something went wrong. We aren't able to find endpoint");
}
