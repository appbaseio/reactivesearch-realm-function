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
	// @ts-expect-error
	const data: RSFunctionQueryData = EJSON.parse(request.body.text());
	const { mongodb, query } = data;
	const client = context.services.get('mongodb-atlas');

	const reactiveSearch = new ReactiveSearch({
		client,
		database: mongodb.db,
		collection: mongodb.collection,
	});

	const { validate } = request.query;

	const results = validate
		? await reactiveSearch.translate(query)
		: await reactiveSearch.query(query);
	response.setStatusCode(200);
	response.setHeader('Content-Type', 'application/json');
	response.setBody(JSON.stringify(results));
};
