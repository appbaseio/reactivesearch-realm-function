import { MongoClient } from 'mongodb';
import { ReactiveSearch } from './searchFunction';
import cors from 'cors';
import express from 'express';

require('dotenv').mongodb();

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

	app.post(`/_reactivesearch`, async (req, res) => {
		let db = req.query.db;
		let collection = req.query.collection;

		if (!db || !collection) {
			//check if mongodb key is present in req.body
			const mongodb = req.body.mongodb;
			if (!mongodb) {
				res.status(400).send({
					error: `mongodb object is required with db and collection name as its keys`,
				});
				return;
			}
			db = mongodb.db;
			collection = mongodb.collection;
		}

		const ref = new ReactiveSearch({
			client,
			database: <string>db,
			collection: <string>collection,
		});
		const data = await ref.query(req.body.query);
		res.status(200).send(data);
	});

	app.post(`/_reactivesearch/validate`, (req, res) => {
		let db = req.query.db;
		let collection = req.query.collection;

		if (!db || !collection) {
			//check if mongodb key is present in req.body
			const mongodb = req.body.mongodb;
			if (!mongodb) {
				res.status(400).send({
					error: `mongodb object is required with db and collection name as its keys`,
				});
				return;
			}
			db = mongodb.db;
			collection = mongodb.collection;
		}

		const ref = new ReactiveSearch({
			client,
			database: <string>db,
			collection: <string>collection,
		});
		const query = ref.translate(req.body.query);
		res.status(200).send(query);
	});

	app.listen(PORT, () => {
		console.log(`⚡️[server]: Server is running at https://localhost:${PORT}`);
	});
}

main();
