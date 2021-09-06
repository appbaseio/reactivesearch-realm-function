import { ALL_FIELDS, EXCLUDE_FIELD, INCLUDE_FIELD } from '../constants';

import { QueryMap, RSQuery } from 'src/types/types';
import { getSearchQuery } from './search';
import { getTermQuery } from './term';
import { getGeoQuery } from './geo';
import { getRangeQuery } from './range';

export const getIncludeExcludeFields = (query: RSQuery<any>): any => {
	let { includeFields = [], excludeFields = [] } = query;

	if (includeFields.length === 0 && excludeFields.length === 0) {
		return null;
	}

	if (excludeFields.includes(ALL_FIELDS)) {
		return {
			$project: {
				_0923biu3g4h: INCLUDE_FIELD,
			},
		};
	}

	if (includeFields.includes(ALL_FIELDS)) {
		if (excludeFields.length === 0) {
			// Don't run the pipeline
			return null;
		} else {
			includeFields = includeFields.filter((item) => item !== ALL_FIELDS);
		}
	}

	// Exclude pipeline should be run before include
	let excludeAggregation = {},
		includeAggregation = {};
	if (excludeFields.length > 0) {
		excludeAggregation = Object.assign(
			{},
			...Array.from(excludeFields, (field) => ({ [field]: EXCLUDE_FIELD })),
		);
	}

	if (includeFields.length > 0) {
		includeAggregation = Object.assign(
			{},
			...Array.from(includeFields, (field) => ({ [field]: INCLUDE_FIELD })),
		);
	}

	const res = {
		$project: { ...excludeAggregation, ...includeAggregation },
	};

	if (Object.keys(res).length) {
		return res;
	}

	return null;
};

export const getQueriesMap = (queries: RSQuery<any>[]): QueryMap => {
	const res: QueryMap = {};
	queries.forEach((item) => {
		let itemId: string = item.id || `${Date.now()}`;
		res[itemId] = {
			rsQuery: item,
			mongoQuery: {},
		};

		if (item.type === `search`) {
			res[itemId].mongoQuery = getSearchQuery(item);
		}

		if (item.type === `geo`) {
			res[itemId].mongoQuery = getGeoQuery(item);
		}

		if (item.type == `term`) {
			res[itemId].mongoQuery = getTermQuery(item);
		}

		if (item.type == `range`) {
			res[itemId].mongoQuery = getRangeQuery(item);
		}
	});

	return res;
};

// TODO handle term query
// handle default query
// handle customQuery

export const buildQueryPipeline = (queryMap: QueryMap): any => {
	const mongoPipelines: any[] = [];

	Object.keys(queryMap).forEach((item) => {
		const { rsQuery, mongoQuery } = queryMap[item];
		let finalMongoQuery = mongoQuery;

		if (rsQuery.react) {
			let andQuery = [];
			let orQuery = [];
			let currentSearch: any = null;
			const isTermQuery = rsQuery.type === 'term';

			if (!isTermQuery) {
				currentSearch = mongoQuery[0].$search;
			}

			// must query
			if (rsQuery.react.and) {
				if (Array.isArray(rsQuery.react.and)) {
					rsQuery.react.and.forEach((andItem) => {
						const relevantQuery = queryMap[andItem].mongoQuery;
						if (!isTermQuery) {
							andQuery.push(relevantQuery[0].$search);
						}
					});
				} else {
					const relevantQuery = queryMap[rsQuery.react.and].mongoQuery;
					if (!isTermQuery) {
						andQuery.push(relevantQuery[0].$search);
					}
				}
			}

			// should query
			if (rsQuery.react.or) {
				if (Array.isArray(rsQuery.react.or)) {
					rsQuery.react.or.forEach((andItem) => {
						const relevantQuery = queryMap[andItem].mongoQuery;
						if (!isTermQuery) {
							orQuery.push(relevantQuery[0].$search);
						}
					});
				} else {
					const relevantQuery = queryMap[rsQuery.react.or].mongoQuery;
					if (!isTermQuery) {
						orQuery.push(relevantQuery[0].$search);
					}
				}
			}

			let index = currentSearch.index;

			if (index) {
				delete currentSearch.index;
			}

			let compoundQuery: any = {
				$search: {
					compound: {
						must: [currentSearch, ...andQuery],
						should: [currentSearch, ...orQuery],
					},
				},
			};

			if (index) {
				compoundQuery.$search.index = index;
			}

			finalMongoQuery = [compoundQuery, ...mongoQuery.slice(1)];
		}

		if (rsQuery.execute === undefined || rsQuery.execute) {
			mongoPipelines.push(finalMongoQuery);
		}
	});

	return mongoPipelines;
};
