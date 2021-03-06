import { ConfigType, RSQuery, ResponseObject } from '../types/types';

import { QueryMap } from '../types/types';
import { RSQuerySchema } from './schema';
import Schema from '../validate/schema.js';
import { generateTermRelevantQuery } from '../targets/common';
import { getGeoQuery } from '../targets/geo';
import { getRangeQuery } from '../targets/range';
import { getSearchQuery } from '../targets/search';
import { getTermQuery } from '../targets/term';

export const buildQueryPipeline = (
	queryMap: QueryMap,
	config: ConfigType,
): any => {
	const mongoPipelines: Record<string, any> = {};
	// other pipelines added because of default or custom query
	const extraTargets: any[] = [];

	Object.keys(queryMap).forEach((item) => {
		const { rsQuery, mongoQuery, error } = queryMap[item];
		const id = rsQuery?.id || `${Date.now()}`;
		if (rsQuery && mongoQuery) {
			if (rsQuery.execute === undefined || rsQuery.execute) {
				let finalMongoQuery = [...mongoQuery];

				if (rsQuery.defaultQuery) {
					let defaultQueryTargets = Array.isArray(rsQuery.defaultQuery)
						? rsQuery.defaultQuery
						: [rsQuery.defaultQuery];
					const mongoQueryIndexesToDelete: number[] = [];
					let skip: any = null;
					let limit: any = null;
					// delete skip and limit from defaultQuery if present
					defaultQueryTargets = defaultQueryTargets.filter(
						(defaultQueryItem) => {
							const defaultKey = Object.keys(defaultQueryItem)[0];
							if (defaultKey === `$skip`) {
								skip = defaultQueryItem[`$skip`];
							}
							if (defaultKey === `$limit`) {
								limit = defaultQueryItem[`$limit`];
							}
							return defaultKey !== `$skip` && defaultKey !== `$limit`;
						},
					);

					mongoQuery.forEach((mongoQueryItem: any, index: number) => {
						const key = Object.keys(mongoQueryItem)[0];

						// check if defaultQuery has that value then use defaultQuery target,
						// eg. $limit exist in both then use the one passed in defaultQuery
						defaultQueryTargets.forEach((defaultQueryItem) => {
							const defaultKey = Object.keys(defaultQueryItem)[0];
							if (defaultKey === key) {
								mongoQueryIndexesToDelete.push(index);
							}
						});
					});

					// generated facet pipeline for skip and limit
					// if present in default query
					// and remove them from root mongo query
					const hits: any = [];

					if (skip !== null) {
						hits.push({ $skip: skip });
					}

					if (limit !== null) {
						hits.push({ $limit: limit });
					}

					if (hits.length) {
						const facetIndex = mongoQuery.findIndex((item: any) => {
							return item.$facet && item.$facet.hits;
						});

						if (facetIndex > -1) {
							mongoQuery[facetIndex] = {
								$facet: {
									hits,
									total: [
										{
											$count: 'count',
										},
									],
								},
							};
						}
					}

					finalMongoQuery = [
						...defaultQueryTargets,
						...mongoQuery.filter(
							(_: any, i: number) =>
								mongoQueryIndexesToDelete.indexOf(i) === -1,
						),
					];
				}

				if (rsQuery.react) {
					let andQuery: any = [];
					let orQuery: any = [];
					let currentSearch: any = null;
					const isTermQuery = rsQuery.type === 'term';

					// must query
					if (rsQuery.react.and) {
						// if and is not array convert it to array
						const relevantAndRef = Array.isArray(rsQuery.react.and)
							? rsQuery.react.and
							: [rsQuery.react.and];
						relevantAndRef.forEach((andItem) => {
							if (queryMap[andItem]) {
								const {
									rsQuery: relevantRSQuery,
									mongoQuery: relevantMongoQuery,
								} = queryMap[andItem];
								if (relevantRSQuery && relevantMongoQuery) {
									// handles case where relevant query is term query
									if (relevantRSQuery.type === 'term') {
										if (!isTermQuery) {
											const relTermQuery =
												generateTermRelevantQuery(relevantRSQuery);
											if (relTermQuery) {
												andQuery.push(relTermQuery);
											}
										}
									} else {
										if (relevantMongoQuery[0]?.$search) {
											let queryCopy = { ...relevantMongoQuery[0].$search };

											// remove highlight from relevant query
											queryCopy = JSON.parse(
												JSON.stringify(queryCopy, function (k, v) {
													if (k === 'highlight') {
														return undefined;
													}

													if (k === `index`) {
														return undefined;
													}
													return v;
												}),
											);
											andQuery.push(queryCopy);
										}
									}

									if (relevantRSQuery.customQuery) {
										andQuery.push(
											relevantRSQuery.customQuery.$search
												? relevantRSQuery.customQuery.$search
												: relevantRSQuery.customQuery,
										);
									}
								}
							}
						});
					}

					// should query
					if (rsQuery.react.or) {
						// if or is not array convert it to array
						const relevantOrRef = Array.isArray(rsQuery.react.or)
							? rsQuery.react.or
							: [rsQuery.react.or];
						relevantOrRef.forEach((orItem) => {
							if (queryMap[orItem]) {
								const {
									rsQuery: relevantRSQuery,
									mongoQuery: relevantMongoQuery,
								} = queryMap[orItem];
								if (relevantRSQuery && relevantMongoQuery) {
									if (relevantRSQuery.type === 'term') {
										if (!isTermQuery) {
											const relTermQuery =
												generateTermRelevantQuery(relevantRSQuery);
											if (relTermQuery) {
												orQuery.push(relTermQuery);
											}
										}
									} else {
										if (relevantMongoQuery[0]?.$search) {
											let queryCopy = { ...relevantMongoQuery[0].$search };

											// remove highlight from relevant query
											queryCopy = JSON.parse(
												JSON.stringify(queryCopy, function (k, v) {
													if (k === 'highlight') {
														return undefined;
													}

													if (k === `index`) {
														return undefined;
													}
													return v;
												}),
											);
											orQuery.push(queryCopy);
										}
									}

									if (relevantRSQuery.customQuery) {
										orQuery.push(
											relevantRSQuery.customQuery.$search
												? relevantRSQuery.customQuery.$search
												: relevantRSQuery.customQuery,
										);
									}
								}
							}
						});
					}

					let compoundQuery: any = {
						$search: {
							compound: {},
						},
					};

					if (!isTermQuery) {
						currentSearch = mongoQuery[0].$search;
						// if has both the clause
						// perform and with the current query and (and & or) with react queries
						// example: must: {  must: { A, should: B}, $currentComponentQuery }
						if (orQuery.length && andQuery.length) {
							if (currentSearch) {
								compoundQuery.$search.compound = {
									must: [
										currentSearch,
										{
											compound: {
												must: [
													...andQuery,
													{
														compound: {
															should: [...orQuery],
														},
													},
												],
											},
										},
									],
								};
							} else {
								compoundQuery.$search.compound = {
									must: [
										...andQuery,
										{
											compound: {
												should: [...orQuery],
											},
										},
									],
								};
							}
						} else if (orQuery.length || andQuery.length) {
							if (orQuery.length) {
								compoundQuery.$search.compound = {
									should: currentSearch ? [currentSearch, ...orQuery] : orQuery,
								};
							}
							if (andQuery.length) {
								compoundQuery.$search.compound = {
									must: currentSearch ? [currentSearch, ...andQuery] : andQuery,
								};
							}
						} else {
							compoundQuery.$search = currentSearch;
						}

						let index = (currentSearch || {}).index;

						if (index) {
							delete currentSearch.index;
						}

						if (
							compoundQuery &&
							compoundQuery.$search &&
							compoundQuery.$search.compound &&
							Object.keys(compoundQuery.$search.compound).length
						) {
							// add index to final compound query
							if (rsQuery.index || config.index) {
								compoundQuery.$search.index = rsQuery.index || config.index;
							}

							finalMongoQuery = currentSearch
								? [...extraTargets, compoundQuery, ...finalMongoQuery.slice(1)]
								: [...extraTargets, compoundQuery, ...finalMongoQuery];
						} else {
							finalMongoQuery = currentSearch
								? [...extraTargets, ...finalMongoQuery.slice(1)]
								: [...extraTargets, ...finalMongoQuery];
						}
					} else {
						if (orQuery.length) {
							compoundQuery.$search.compound = {
								should: orQuery,
							};
						}

						if (andQuery.length) {
							compoundQuery.$search.compound = {
								must: andQuery,
							};
						}

						if (
							compoundQuery &&
							compoundQuery.$search &&
							compoundQuery.$search.compound &&
							Object.keys(compoundQuery.$search.compound).length
						) {
							// add index to final compound query
							if (rsQuery.index || config.index) {
								compoundQuery.$search.index = rsQuery.index || config.index;
							}

							finalMongoQuery = [
								...extraTargets,
								compoundQuery,
								...finalMongoQuery,
							];
						} else {
							finalMongoQuery = [...extraTargets, ...finalMongoQuery];
						}
					}
				}

				mongoPipelines[id] = finalMongoQuery;
			}
		} else {
			mongoPipelines[id] = {
				error,
			};
		}
	});
	return mongoPipelines;
};

export const getQueriesMap = (
	queries: RSQuery<any>[],
	config: ConfigType,
): QueryMap => {
	const res: QueryMap = {};
	queries.forEach((item) => {
		// Default value of dataField is *
		if (
			(item.type === 'search' || item.type === undefined) &&
			item.dataField === undefined
		) {
			item.dataField = '*';
		}

		let itemId: string = item.id || `${Date.now()}`;
		try {
			res[itemId] = {
				rsQuery: item,
				mongoQuery: {},
			};

			// default item type to search
			if (!item.type) {
				item.type = `search`;
			}

			if (item.type === `search`) {
				res[itemId].mongoQuery = getSearchQuery(item, config);
			}

			if (item.type === `geo`) {
				// in case if value is not set, treat it as match_all query / search query
				// this helps in loading all the data on map initially
				if (!item.value) {
					item.type = 'search';
					res[itemId].mongoQuery = getSearchQuery(item, config);
				} else {
					res[itemId].mongoQuery = getGeoQuery(item, config);
				}
			}

			if (item.type == `term`) {
				res[itemId].mongoQuery = getTermQuery(item, config);
			}

			if (item.type == `range`) {
				res[itemId].mongoQuery = getRangeQuery(item, config);
			}
		} catch (err) {
			res[itemId] = {
				rsQuery: item,
				error: {
					status: `Bad request`,
					message: err.message,
					code: 400,
				},
			};
		}
	});

	return res;
};

const performance = {
	now: (): number => {
		const time = new Date();
		return time.getTime();
	},
};

export class ReactiveSearch {
	// for realm function client is generated via context
	// fot test env client is generated via npm mongodb package
	config: ConfigType;
	// @ts-ignore
	schema: Schema;

	constructor(config: ConfigType) {
		this.config = {
			client: config.client,
			database: config.database,
			collection: config.collection,
			index: config.index,
		};
		// @ts-ignore
		this.schema = new Schema(RSQuerySchema, { strip: false });
	}

	verify = (data: RSQuery<any>[]): any => {
		const errors = [];
		for (const x of data) {
			const error = this.schema.validate(x);
			if (error.length > 0) {
				errors.push(error.toString());
			} else {
				errors.push(null);
			}
		}
		if (errors.filter((x) => x).length === 0) {
			return null;
		} else {
			return errors;
		}
	};

	// TODO define type for mongo query
	translate = (data: RSQuery<any>[]): Record<string, any> => {
		const error = this.verify(data);
		if (error) {
			return {
				error: {
					error,
					code: 400,
					status: `Bad Request`,
				},
			};
		}

		const queryMap = getQueriesMap(data, this.config);
		const result = buildQueryPipeline(queryMap, this.config);
		return result;
	};

	transformResponse = (totalTimeTaken: number, data: ResponseObject[]): any => {
		const transformedRes: any = [];
		data.forEach((item: any) => {
			const { rsQuery, response, error, took, raw } = item;
			if (error) {
				return transformedRes.push(error);
			}
			if (rsQuery) {
				// user can re-shape response incase of default query
				// hence we will be returning raw key in that case

				// prepare response for term aggregations
				// should be of following shape {..., aggregations: {[dataField]: {buckets: [{key:'', doc_count: 0}]}}}
				if (rsQuery.type === 'term') {
					const dataField = Array.isArray(rsQuery.dataField)
						? `${rsQuery.dataField[0]}`
						: `${rsQuery.dataField}`;
					return transformedRes.push({
						id: rsQuery.id,
						took: took,
						hits: {},
						raw,
						status: 200,
						aggregations: {
							[dataField]: {
								buckets: response[0]?.aggregations.map(
									(item: { _id: string; count: any }) => ({
										key: item._id,
										doc_count: item?.count?.$numberInt
											? parseInt(item?.count?.$numberInt)
											: item?.count || 0,
									}),
								),
							},
						},
					});
				}

				// if not term aggregations return search results
				// for range query it can have min, max and histogram values
				const { hits, total, min, max, histogram } = response[0];
				const dataToReturn: any = {
					id: rsQuery.id,
					took: took,
					raw,
					hits: {
						total: {
							value: total[0]?.count || 0,
							relation: `eq`,
						},
						// TODO add max score
						max_score: 0,
						hits:
							rsQuery.size === 0
								? []
								: hits.map((item: any) =>
										item.highlights
											? {
													_index:
														rsQuery.index || this.config.index || `default`,
													_collection: this.config.collection,
													_id: item._id,
													// TODO add score pipeline
													_score: 0,
													_source: {
														...item,
														highlights: null,
													},
													highlight: item.highlights.map((entity: any) => ({
														[entity.path]: entity.texts
															.map((text: any) =>
																text.type === 'text'
																	? text.value
																	: `<b>${text.value}</b>`,
															)
															.join(' '),
													})),
											  }
											: {
													_index:
														rsQuery.index || this.config.index || `default`,
													_collection: this.config.collection,
													_id: item._id,
													// TODO add score pipeline
													_score: 0,
													_source: item,
											  },
								  ),
					},
					error: null,
					status: 200,
				};

				if (min || max || histogram) {
					dataToReturn.aggregations = {};
				}

				if (min) {
					dataToReturn.aggregations.min = {
						value: min[0].min?.$numberInt
							? parseInt(min[0].min?.$numberInt)
							: min[0].min || 0,
					};
				}

				if (max) {
					dataToReturn.aggregations.max = {
						value: max[0].max?.$numberInt
							? parseInt(max[0].max?.$numberInt)
							: max[0].max || 0,
					};
				}

				if (histogram) {
					const dataField = Array.isArray(rsQuery.dataField)
						? `${rsQuery.dataField[0]}`
						: `${rsQuery.dataField}`;
					dataToReturn.aggregations[dataField] = {
						buckets: histogram.map(
							(item: { _id: string | number; count: any }) => ({
								key: item._id,
								doc_count: item?.count?.$numberInt
									? parseInt(item?.count?.$numberInt)
									: item?.count || 0,
							}),
						),
					};
				}

				return transformedRes.push(dataToReturn);
			}
		});

		const result: any = {
			settings: {
				took: totalTimeTaken,
			},
		};

		transformedRes.forEach((item: any) => {
			const { id, ...rest } = item;
			result[id] = rest;
		});

		return result;
	};

	query = (data: RSQuery<any>[]): any => {
		const error = this.verify(data);
		if (error) {
			return {
				error: {
					error,
					code: 400,
					status: `Bad Request`,
				},
			};
		}

		const queryMap = getQueriesMap(data, this.config);

		const aggregationsObject = buildQueryPipeline(queryMap, this.config);
		try {
			const totalStart = performance.now();
			return Promise.all(
				Object.keys(aggregationsObject).map(async (item: any) => {
					const { rsQuery } = queryMap[item];
					const start = performance.now();
					try {
						const { error } = aggregationsObject[item];

						// return if item has error before execution,
						// this would ideally be 400 error
						if (error) {
							return {
								rsQuery,
								error: {
									id: item,
									hits: null,
									error: error,
									status: error?.code,
								},
								took: 0,
							};
						}
						const collection = this.config.client
							.db(this.config.database)
							.collection(this.config.collection);

						const response = await collection
							.aggregate(aggregationsObject[item])
							.toArray();
						let raw: any = undefined;
						if (rsQuery && rsQuery.defaultQuery) {
							raw = await collection.aggregate(rsQuery.defaultQuery).toArray();
						}
						const end = performance.now();
						const took = Math.abs(end - start) || 1;

						return { rsQuery, took, error, raw, response };
					} catch (err) {
						const end = performance.now();
						const took = Math.abs(end - start) || 1;
						return {
							rsQuery,
							error: {
								id: item,
								hits: null,
								error: err.toString(),
								status: 500,
							},
							took,
						};
					}
				}),
			).then((res) => {
				const totalEnd = performance.now();
				const totalTimeTaken = Math.abs(totalEnd - totalStart) || 1;
				const transformedRes = this.transformResponse(
					totalTimeTaken,
					<ResponseObject[]>res,
				);

				return transformedRes;
			});
		} catch (err) {
			throw err;
		}
	};

	validateCollection = async () => {
		const admin = this.config.client.db().admin();

		let databases = await admin.listDatabases({
			nameOnly: true,
		});
		databases = databases.databases.map((x: { name: string }) => x.name);
		if (!databases.includes(this.config.database)) {
			return {
				code: 400,
				error: 'Database does not exist',
				message: 'Database does not exist',
			};
		}

		let collections = await this.config.client
			.db(this.config.database)
			.listCollections()
			.toArray();
		collections = collections.map((x: { name: string }) => x.name);
		if (!collections.includes(this.config.collection)) {
			return {
				code: 400,
				error: 'Collection does not exist',
				message: 'Collection does not exist',
			};
		}
		return {
			code: 200,
			message: 'Database and collection exist',
		};
	};
}
