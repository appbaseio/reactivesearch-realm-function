const yargs = require('yargs');
const { execSync } = require('child_process');
const cliProgress = require('cli-progress');

const WEBHOOK_NAME = 'reactivesearch';

const options = yargs
	.usage(
		'Usage: -private-api-key <private api key> -public-api-key <public api key> -app-id <application id>',
	)
	.option('private-api-key', {
		alias: 'api_key',
		describe: 'Private API Key',
		type: 'string',
		demandOption: true,
	})
	.option('public-api-key', {
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
	}).argv;

const { api_key, public_api_key, app_id } = options;
const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);

console.log('\nDeploying webhook\n');
bar.start(5, 0);
execSync(
	`realm-cli login --api-key=${api_key} --private-api-key=${public_api_key}`,
);
bar.update(1);
execSync(
	`rm -rf realm-app && realm-cli pull --local=./realm-app  --remote=${app_id}`,
);
bar.update(2);
execSync(`node build --name=${WEBHOOK_NAME}`);
bar.update(3);
execSync(`realm-cli push --local=./realm-app --yes`);
bar.update(4);
const appDescription = JSON.parse(
	execSync(`realm-cli app describe --app=${app_id}`)
		.toString()
		.replace('App description', ''),
);
const { http_endpoints } = appDescription;
let webhookEndpoint = null;
http_endpoints.map((endpoint) =>
	endpoint.webhooks.map((hook) => {
		if (hook.name === WEBHOOK_NAME) {
			webhookEndpoint = hook.url;
		}
	}),
);
bar.update(5);
bar.stop();
console.info('\nSuccessfully deployed webhook.');

if (http_endpoints) {
	console.info(`\n Deployed webhook endpoint : ${webhookEndpoint}`);
	console.log(
		`\n You can make a test request to this webhook using this curl command \n`,
	);
	console.log(`curl \\
        -H "Content-Type: application/json" \\
        -d '{"foo":"bar"}' \\
        ${webhookEndpoint}
     `);
} else {
	console.error("Something went wrong. We aren't able to find endpoint");
}