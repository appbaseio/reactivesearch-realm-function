import { MongoClient } from 'mongodb';
import { ReactiveSearch } from './searchFunction';
import cors from 'cors';
import express, { Request } from 'express';

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

	const validateRequest = (
		req: Request,
	): {
		db: string;
		collection: string;
		query: any;
	} => {
		try {
			let db = req.query.db;
			let collection = req.query.collection;

			if (!db || !collection) {
				//check if mongodb key is present in req.body
				const mongodb = req.body.mongodb;
				if (
					!mongodb ||
					!mongodb.db ||
					!mongodb.db.trim() ||
					!mongodb.collection ||
					!mongodb.collection.trim()
				) {
					throw new Error(
						`mongodb object is required with db and collection name as its keys`,
					);
				}
				db = mongodb.db;
				collection = mongodb.collection;
			}
			if (!req.body.query) {
				throw new Error(`query is required`);
			}

			return {
				db: <string>db,
				collection: <string>collection,
				query: req.body.query,
			};
		} catch (err) {
			throw err;
		}
	};

	app.post(`/_reactivesearch`, async (req, res) => {
		try {
			const { db, collection, query } = validateRequest(req);
			const ref = new ReactiveSearch({
				client,
				database: <string>db,
				collection: <string>collection,
			});

			try {
				const data = await ref.query(query);
				res.status(200).send(data);
			} catch (err) {
				res.status(500).send({
					error: {
						status: `Internal server error`,
						code: 500,
						message: err.message,
					},
				});
			}
		} catch (error) {
			res.status(400).send({
				error: {
					message: error.message,
					code: 400,
					status: `Bad Request`,
				},
			});
		}
	});

	app.post(`/_reactivesearch/validate`, (req, res) => {
		try {
			const { db, collection, query } = validateRequest(req);
			const ref = new ReactiveSearch({
				client,
				database: <string>db,
				collection: <string>collection,
			});
			const data = ref.translate(query);
			res.status(200).send(data);
		} catch (error) {
			res.status(400).send({
				error: {
					message: error.message,
					code: 400,
					status: `Bad Request`,
				},
			});
		}
	});

	app.listen(PORT, () => {
		console.log(`⚡️[server]: Server is running at https://localhost:${PORT}`);
	});
}

main();
