import {
	ALL_FIELDS,
	EXCLUDE_FIELD,
	FUZZINESS_AUTO,
	INCLUDE_FIELD,
} from '../constants';
import { QueryMap, RSQuery, DataField } from '../types/types';
import { getSearchQuery } from './search';
import { getTermQuery } from './term';
import { getGeoQuery } from './geo';
import { getRangeQuery } from './range';

export const getFieldsFromDataField = (
	dataField: string | Array<string | DataField> | undefined,
) => {
	let fields = null;
	if (dataField) {
		if (typeof dataField === 'string') {
			fields = [dataField];
		} else {
			// It's an array
			if (dataField.length > 0) {
				const queryField = dataField[0];
				if (typeof queryField === 'string' || queryField instanceof String) {
					fields = dataField as string[];
				} else {
					fields = dataField.map((value: any) => value.field);
				}
			}
		}
	}
	return fields;
};

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

	if (query.highlight) {
		res.$project = {
			...res.$project,
			highlights: { $meta: 'searchHighlights' },
		};
	}

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

const generateTermRelevantQuery = (
	relevantRSQuery: RSQuery<string | string[] | number | number[]>,
): any => {
	if (relevantRSQuery.value) {
		if (relevantRSQuery.queryFormat === 'and') {
			let filter: any = {};
			if (Array.isArray(relevantRSQuery.value)) {
				filter = relevantRSQuery.value.map((v) => ({
					text: {
						query: [v],
						path: relevantRSQuery.dataField,
					},
				}));
			} else {
				filter = [
					{
						text: {
							query: [relevantRSQuery.value],
							path: relevantRSQuery.dataField,
						},
					},
				];
			}
			return {
				compound: {
					filter,
				},
			};
		}
		// by default returns for OR query format
		return {
			compound: {
				filter: {
					text: {
						query: Array.isArray(relevantRSQuery.value)
							? relevantRSQuery.value
							: [relevantRSQuery.value],
						path: relevantRSQuery.dataField,
					},
				},
			},
		};
	}

	return null;
};

// TODO handle default query
export const buildQueryPipeline = (queryMap: QueryMap): any => {
	const mongoPipelines: Record<string, any> = {};

	Object.keys(queryMap).forEach((item) => {
		const { rsQuery, mongoQuery } = queryMap[item];
		if (rsQuery.execute === undefined || rsQuery.execute) {
			let finalMongoQuery = mongoQuery;

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
									andQuery.push(relevantMongoQuery[0].$search);
								}
							}

							if (relevantRSQuery.customQuery) {
								andQuery.push(relevantRSQuery.customQuery);
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
									orQuery.push(relevantMongoQuery[0].$search);
								}
							}

							if (relevantRSQuery.customQuery) {
								orQuery.push(relevantRSQuery.customQuery);
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
					} else {
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
					}

					let index = (currentSearch || {}).index;

					if (index) {
						delete currentSearch.index;
					}

					if (currentSearch && index) {
						compoundQuery.$search.index = index;
					}

					finalMongoQuery = currentSearch
						? [compoundQuery, ...mongoQuery.slice(1)]
						: [compoundQuery, ...mongoQuery];
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

					finalMongoQuery = [compoundQuery, ...mongoQuery];
				}
			}

			mongoPipelines[rsQuery.id || `${Date.now()}`] = finalMongoQuery;
		}
	});

	return mongoPipelines;
};
export const getFuzziness = (
	query: RSQuery<string>,
):
	| {
			fuzzy: {
				maxEdits: number;
			};
	  }
	| {} => {
	const queryLength = query?.value?.length || 0;
	let fuzziness: string | number | undefined = query.fuzziness;

	if (fuzziness === undefined) {
		return {};
	}

	if (typeof fuzziness === 'string') {
		if (fuzziness.toUpperCase() === FUZZINESS_AUTO) {
			if (queryLength > 5) {
				fuzziness = 2;
			} else if (queryLength >= 3) {
				fuzziness = 1;
			} else {
				fuzziness = 0;
			}
		} else {
			return {};
		}
	}
	if (fuzziness > 2) {
		throw new Error("Fuzziness value can't be greater than 2");
	}
	if (fuzziness === 0) {
		return {};
	}
	return {
		fuzzy: {
			maxEdits: fuzziness,
		},
	};
};

export const getSynonymsQuery = (query: RSQuery<string>): any => {
	const { fuzziness, enableSynonyms, synonymsField, value, dataField } = query;
	if (fuzziness && enableSynonyms) {
		throw new Error("Fuzziness and Synonyms can't be used together");
	}

	if (enableSynonyms) {
		const fields = getFieldsFromDataField(dataField);
		if (fields) {
			return {
				text: {
					query: value,
					path: fields,
					synonyms: synonymsField,
				},
			};
		}
	}
	return null;
};
