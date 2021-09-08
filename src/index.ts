import { getQueriesMap, buildQueryPipeline } from './targets/common';
import { ConfigType, RSQuery } from './types/types';

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
		// TODO check if toArray is supported on mongo realm env
		const aggregationsObject = buildQueryPipeline(queryMap);
		try {
			return Promise.all(
				Object.keys(aggregationsObject).map(async (item: any) => {
					try {
						const collection = this.config.client
							.db(this.config.database)
							.collection(collectionName);
						const hits = await collection
							.aggregate(aggregationsObject[item])
							.toArray();
						const { rsQuery } = queryMap[item];
						if (hits[0].aggregations) {
							return {
								id: item,
								hits: {},
								status: 200,
								aggregations: {
									[<string>rsQuery.dataField]: {
										doc_count_error_upper_bound: 0,
										// TODO get this count
										sum_other_doc_count: 0,
										buckets: hits[0].aggregations.map(
											(item: { _id: string; count: number }) => ({
												key: item._id,
												doc_count: item.count,
											}),
										),
									},
								},
							};
						}
						return {
							id: item,
							hits: {
								// TODO add total
								total: {
									value: 100,
									relation: `eq`,
								},
								// TODO add max score
								max_score: 0,
								hits: hits.map((item: any) => ({
									_index: rsQuery.index || `default`,
									_type: collectionName,
									_id: item._id,
									// TODO add score pipeline
									_score: 0,
									_source: item,
								})),
							},
							error: null,
							status: 200,
						};
					} catch (err) {
						return {
							id: item,
							hits: null,
							error: err,
							status: 400,
						};
					}
				}),
			).then((res) => {
				const transformedRes: any = {
					settings: {
						took: 100,
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
