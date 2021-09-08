import express from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';

import { ReactiveSearch } from './';

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

	const ref = new ReactiveSearch({
		client,
		database: process.env.DB_NAME || ``,
	});

	app.post(`/:collection/_reactivesearch`, async (req, res) => {
		const data = await ref.query(req.body.query, req.params.collection);
		res.status(200).send(data);
	});

	app.post(`/:collection/_reactivesearch/validate`, (req, res) => {
		const query = ref.translate(req.body.query);
		res.status(200).send(query);
	});

	app.listen(PORT, () => {
		console.log(`⚡️[server]: Server is running at https://localhost:${PORT}`);
	});
}

main();
