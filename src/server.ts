import express from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';

import { Realm } from './';
import { getQueriesMap, buildQueryPipeline } from './targets/common';

require('dotenv').config();

async function main() {
	const app = express();
	const PORT = process.env.PORT || 8080;
	const client = new MongoClient(
		process.env.DB_URL || `mongodb://localhost:27017`,
	);
	await client.connect();
	console.log(`✅ [db]: Connected successfully`);

	app.use(cors());
	app.use(express.json());

	const realm = new Realm();

	app.post(`/:collection/_reactivesearch`, async (req, res) => {
		const query = realm.query(req.body.query);
		const collection = client
			.db(process.env.DB_NAME)
			.collection(req.params.collection);
		const data = await collection.aggregate(query).toArray();
		res.status(200).send({
			data,
		});
	});

	app.post(`/:collection/_reactivesearch/validate`, (req, res) => {
		const qmap = getQueriesMap(req.body.query);
		const result = buildQueryPipeline(qmap);
		res.status(200).send(result);
	});

	app.listen(PORT, () => {
		console.log(`⚡️[server]: Server is running at https://localhost:${PORT}`);
	});
}

main();
