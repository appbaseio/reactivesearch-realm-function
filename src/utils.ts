import { ResponseObject, ConfigType } from './types/types';

const nativeCeil = Math.ceil,
	nativeMax = Math.max;

export const range = (
	start: number,
	end: number,
	step: number = 1,
	fromRight?: boolean,
): number[] => {
	var index = -1,
		length = nativeMax(nativeCeil((end - start) / (step || 1)), 0),
		result = Array(length);

	while (length--) {
		result[fromRight ? length : ++index] = start;
		start += step;
	}
	return result;
};

export const transformResponse = (
	config: ConfigType,
	totalTimeTaken: number,
	data: ResponseObject[],
): any => {
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
												_index: rsQuery.index || config.index || `default`,
												_collection: config.collection,
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
												_index: rsQuery.index || config.index || `default`,
												_collection: config.collection,
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
