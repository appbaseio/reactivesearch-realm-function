// jshint ignore: start
/// <reference path="./realm.d.ts" />

'use strict';

import { AUTHORIZATION_CREDENTIALS } from '../constants';
import { RSFunctionQueryData } from '../types/types';
import { ReactiveSearch } from './index';
// @ts-ignore
exports = async (request: any, response: any) => {
	if (AUTHORIZATION_CREDENTIALS) {
		if (request?.headers['Authorization']?.[0] !== AUTHORIZATION_CREDENTIALS) {
			const result = {
				error: {
					code: 401,
					message: 'invalid username or password',
					status: 'Unauthorized',
				},
			};
			response.setStatusCode(401);
			response.setHeader('Content-Type', 'application/json');
			response.setBody(JSON.stringify(result));
			return;
		}
	}
	const { validate, db, collection } = request.query;

	let dbName = db;
	let collectionName = collection;

	// @ts-expect-error
	const data: RSFunctionQueryData = EJSON.parse(request.body.text());
	const { mongodb, query } = data;
	const client = context.services.get('mongodb-atlas');
	if (!dbName || !collectionName) {
		//check if mongodb key is present in req.body
		if (
			!mongodb ||
			!mongodb.db ||
			!mongodb.db.trim() ||
			!mongodb.collection ||
			!mongodb.collection.trim()
		) {
			response.setStatusCode(400);
			response.setHeader('Content-Type', 'application/json');
			response.setBody(
				JSON.stringify({
					error: {
						message: `mongodb object is required with db and collection name as its keys`,
						code: 400,
						status: `Bad Request`,
					},
				}),
			);
			return;
		}
		dbName = mongodb.db;
		collectionName = mongodb.collection;
	}

	if (!query) {
		response.setStatusCode(400);
		response.setHeader('Content-Type', 'application/json');
		response.setBody(
			JSON.stringify({
				error: {
					message: `query is required`,
					code: 400,
					status: `Bad Request`,
				},
			}),
		);
		return;
	}

	const reactiveSearch = new ReactiveSearch({
		client,
		database: dbName,
		collection: collectionName,
	});

	try {
		const results = validate
			? await reactiveSearch.translate(query)
			: await reactiveSearch.query(query);
		if (results.error) {
			response.setStatusCode(400);
		} else {
			response.setStatusCode(200);
		}
		response.setHeader('Content-Type', 'application/json');
		response.setBody(JSON.stringify(results));
	} catch (err) {
		response.setStatusCode(500);
		response.setHeader('Content-Type', 'application/json');
		response.setBody(
			JSON.stringify({
				error: {
					status: `Internal server error`,
					code: 500,
					message: err.message,
				},
			}),
		);
	}
};
