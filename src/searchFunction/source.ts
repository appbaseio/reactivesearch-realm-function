// jshint ignore: start
/// <reference path="./realm.d.ts" />

'use strict';

import { AUTHORIZATION_CREDENTIALS } from '../constants';
import { RSFunctionQueryData } from '../types/types';
import { ReactiveSearch } from './index';
// @ts-ignore
exports = async (payload: any) => {
	if (AUTHORIZATION_CREDENTIALS) {
		if (payload?.headers['Authorization']?.[0] !== AUTHORIZATION_CREDENTIALS) {
			return {
				hits: null,
				error: 'Invalid credentials',
				status: 401,
			};
		}
	}
	// @ts-expect-error
	const data: RSFunctionQueryData = EJSON.parse(payload.body.text());
	const { config, query } = data;
	const client = context.services.get('mongodb-atlas');

	const reactiveSearch = new ReactiveSearch({
		client,
		database: config.database,
		collection: config.collection,
	});

	const results = await reactiveSearch.query(query, config.collection);
	return results;
};
