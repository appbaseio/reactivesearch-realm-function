import { getQueriesMap, buildQueryPipeline } from './targets/common';
import { ConfigType, RSQuery } from './types/types';
const {performance} = require('perf_hooks');

export class ReactiveSearch {
	// for realm function client is generated via context
	// fot test env client is generated via npm mongodb package
	config: ConfigType;

	constructor(config: ConfigType) {
		this.config = {
			client: config.client,
			database: config.database,
		};
	}

	// TODO define type for mongo query
	translate = (data: RSQuery<any>[]): Record<string, any> => {
		const queryMap = getQueriesMap(data);
		const result = buildQueryPipeline(queryMap);
		return result;
	};

	query = (data: RSQuery<any>[], collectionName: string): any => {
		const queryMap = getQueriesMap(data);

		const aggregationsObject = buildQueryPipeline(queryMap);
		try {
			const totalStart = performance.now();
			return Promise.all(
				Object.keys(aggregationsObject).map(async (item: any) => {
					try {
						const start = performance.now();
						const collection = this.config.client
							.db(this.config.database)
							.collection(collectionName);

						const res = await collection
							.aggregate(aggregationsObject[item])
							.toArray();

						const { rsQuery } = queryMap[item];
						const end = performance.now();
						if (res[0].aggregations) {
							const dataField = Array.isArray(rsQuery.dataField)
								? `${rsQuery.dataField[0]}`
								: `${rsQuery.dataField}`;
							return {
								id: item,
								took: Number((end - start).toFixed(2)),
								hits: {},
								status: 200,
								aggregations: {
									[dataField]: {
										buckets: res[0].aggregations.map(
											(item: { _id: string; count: number }) => ({
												key: item._id,
												doc_count: item?.count || 0,
											}),
										),
									},
								},
							};
						}
						const { hits, total, min, max, histogram } = res[0];
						const dataToReturn: any = {
							id: item,
							took: 100,
							hits: {
								total: {
									value: total[0]?.count || 0,
									relation: `eq`,
								},
								// TODO add max score
								max_score: 0,
								hits: hits.map((item: any) => ({
									_index: rsQuery.index || `default`,
									_collection: collectionName,
									_id: item._id,
									// TODO add score pipeline
									_score: 0,
									_source: item,
								})),
							},
							error: null,
							status: 200,
						};

						if (min || max || histogram) {
							dataToReturn.aggregations = {};
						}

						if (min) {
							dataToReturn.aggregations.min = {
								value: min[0].min,
							};
						}

						if (max) {
							dataToReturn.aggregations.max = {
								value: max[0].max,
							};
						}

						if (histogram) {
							const dataField = Array.isArray(rsQuery.dataField)
								? `${rsQuery.dataField[0]}`
								: `${rsQuery.dataField}`;
							dataToReturn.aggregations[dataField] = {
								buckets: histogram.map(
									(item: { _id: string | number; count: number }) => ({
										key: item._id,
										doc_count: item?.count || 0,
									}),
								),
							};
						}
						return dataToReturn;
					} catch (err) {
						console.log({ err });
						return {
							id: item,
							hits: null,
							error: err.toString(),
							status: 400,
						};
					}
				}),
			).then((res) => {
				const totalEnd = performance.now();
				const transformedRes: any = {
					settings: {
						took: Number((totalEnd - totalStart).toFixed(2)),
					},
				};

				res.forEach((item: any) => {
					const { id, ...rest } = item;
					transformedRes[id] = rest;
				});
				return transformedRes;
			});
		} catch (err) {
			throw err;
		}
	};
}
