import {
	buildQueryPipeline,
	getQueriesMap,
} from '../../src/searchFunction/index';
import {
	getAutoCompleteQuery,
	getFuzziness,
	getIncludeExcludeFields,
	getSynonymsQuery,
} from '../../src/targets/common';

import { RSQuery } from '../../src/types/types';

test('getIncludeExcludeFields when * is in excludeFields', () => {
	const result = getIncludeExcludeFields({
		excludeFields: ['*'],
		includeFields: ['*'],
	});
	const expected = {
		$project: {
			_0923biu3g4h: 1,
		},
	};

	expect(result).toStrictEqual(expected);
});

test('getIncludeExcludeFields when * is in includeFields and excludeFields is empty', () => {
	const result = getIncludeExcludeFields({
		excludeFields: [],
		includeFields: ['*'],
	});
	const expected = null;

	expect(result).toStrictEqual(expected);
});

test('getIncludeExcludeFields when * is in includeFields and excludeFields contains some column', () => {
	const result = getIncludeExcludeFields({
		excludeFields: ['test'],
		includeFields: ['*'],
	});
	const expected: any = {
		$project: {
			test: 0,
		},
	};

	expect(result).toStrictEqual(expected);
});

test('getIncludeExcludeFields when * is in excludeFields and includeFields contains some column', () => {
	const result = getIncludeExcludeFields({
		excludeFields: ['*'],
		includeFields: ['test'],
	});
	const expected: any = {
		$project: {
			_0923biu3g4h: 1,
		},
	};

	expect(result).toStrictEqual(expected);
});

test('getIncludeExcludeFields when includeFields and excludeFields contains some column', () => {
	const result = getIncludeExcludeFields({
		excludeFields: ['test'],
		includeFields: ['test1', 'test2'],
	});
	const expected: { $project: {} } = {
		$project: {
			test: 0,
			test1: 1,
			test2: 1,
		},
	};

	expect(result).toStrictEqual(expected);
});

test('getFuzziness when fuzziness is undefined', () => {
	const result = getFuzziness({
		value: 'query',
	});
	const expected = {};
	expect(result).toStrictEqual(expected);
});

test('getFuzziness when fuzziness is a string other than AUTO', () => {
	const result = getFuzziness({
		value: 'query',
		fuzziness: 'fuzziness',
	});
	const expected = {};
	expect(result).toStrictEqual(expected);
});

test('getFuzziness when fuzziness is a number', () => {
	const result = getFuzziness({
		value: 'query',
		fuzziness: 1,
	});
	const expected = {
		fuzzy: {
			maxEdits: 1,
		},
	};
	expect(result).toStrictEqual(expected);
});

test('getFuzziness when fuzziness is auto and query length is greater than 5', () => {
	const result = getFuzziness({
		value: '123456',
		fuzziness: 'AUTO',
	});
	const expected = {
		fuzzy: {
			maxEdits: 2,
		},
	};
	expect(result).toStrictEqual(expected);
});

test('getFuzziness when fuzziness is auto and query length is between 3 and 5', () => {
	const result = getFuzziness({
		value: '1234',
		fuzziness: 'AUTO',
	});
	const expected = {
		fuzzy: {
			maxEdits: 1,
		},
	};
	expect(result).toStrictEqual(expected);
});

test('getFuzziness when fuzziness is auto and query length is 3', () => {
	const result = getFuzziness({
		value: '123',
		fuzziness: 'AUTO',
	});
	const expected = {
		fuzzy: {
			maxEdits: 1,
		},
	};
	expect(result).toStrictEqual(expected);
});

test('getFuzziness when fuzziness is auto and query length is less than 3', () => {
	const result = getFuzziness({
		value: '12',
		fuzziness: 'AUTO',
	});
	const expected = {};
	expect(result).toStrictEqual(expected);
});

test('getFuzziness when fuzziness is 0', () => {
	const result = getFuzziness({
		value: '12',
		fuzziness: 0,
	});
	const expected = {};
	expect(result).toStrictEqual(expected);
});

test('getFuzziness when both fuzziness and synonym is enabled', () => {
	const result = getFuzziness({
		enableSynonyms: true,
		synonymsField: 'mySynonyms',
		value: 'valueField',
		dataField: 'data1',
		fuzziness: 'AUTO',
	});
	const expected = {
		fuzzy: {
			maxEdits: 2,
		},
	};
	expect(result).toStrictEqual(expected);
});

test('getFuzziness when fuzziness is greater than 2', () => {
	expect(() => {
		getFuzziness({
			value: '12',
			fuzziness: 3,
		});
	}).toThrowError();
});

test('getIncludeExcludeFields when includeFields, excludeFields contains some column and highlight is true', () => {
	const result = getIncludeExcludeFields({
		excludeFields: ['test'],
		includeFields: ['test1', 'test2'],
		highlight: true,
	});
	const expected = {
		$project: {
			test: 0,
			test1: 1,
			test2: 1,
			highlights: { $meta: 'searchHighlights' },
		},
	};

	expect(result).toStrictEqual(expected);
});

test('getSynonymsQuery when both fuzziness and synonym is enabled', () => {
	const result = getSynonymsQuery({
		enableSynonyms: true,
		synonymsField: 'mySynonyms',
		value: 'valueField',
		dataField: 'data1',
		fuzziness: 'AUTO',
	});
	const expected = {
		text: {
			query: 'valueField',
			path: ['data1'],
			synonyms: 'mySynonyms',
		},
	};

	expect(result).toStrictEqual(expected);
});

test('getSynonymsQuery when synonym is enabled but synonymsField is missing', () => {
	const result = getSynonymsQuery({
		enableSynonyms: true,
		value: 'valueField',
		dataField: 'data1',
	});
	const expected = null;

	expect(result).toStrictEqual(expected);
});

test('getSynonymsQuery when synonym is enabled', () => {
	const result = getSynonymsQuery({
		enableSynonyms: true,
		synonymsField: 'mySynonyms',
		value: 'valueField',
		dataField: 'data1',
	});
	const expected = {
		text: {
			query: 'valueField',
			path: ['data1'],
			synonyms: 'mySynonyms',
		},
	};

	expect(result).toStrictEqual(expected);
});

test('getAutoCompleteQuery when autocompleteField is missing', () => {
	const result = getAutoCompleteQuery({
		enableSynonyms: true,
		value: 'valueField',
		dataField: 'data1',
	});
	const expected = null;

	expect(result).toStrictEqual(expected);
});

test('getAutoCompleteQuery when autocompleteField is a string', () => {
	const result = getAutoCompleteQuery({
		autocompleteField: 'autocomplete',
		value: 'valueField',
		dataField: ['data1', 'data2'],
	});
	const expected = {
		compound: {
			should: [
				{
					autocomplete: {
						query: 'valueField',
						path: 'autocomplete',
						score: { boost: { value: 1 } },
					},
				},
			],
		},
	};

	expect(result).toStrictEqual(expected);
});

test('getAutoCompleteQuery when autocompleteField is a string and fuzziness is present', () => {
	const result = getAutoCompleteQuery({
		autocompleteField: 'autocomplete',
		value: 'valueField',
		dataField: 'data2',
		fuzziness: 1,
	});
	const expected = {
		compound: {
			should: [
				{
					autocomplete: {
						query: 'valueField',
						path: 'autocomplete',
						score: { boost: { value: 1 } },
						fuzzy: {
							maxEdits: 1,
						},
					},
				},
			],
		},
	};

	expect(result).toStrictEqual(expected);
});

test('getAutoCompleteQuery when autocompleteField is an array of string and fuzziness is present', () => {
	const result = getAutoCompleteQuery({
		autocompleteField: ['autocomplete', 'autocomplete1'],
		value: 'valueField',
		dataField: 'data2',
		fuzziness: 1,
	});
	const expected = {
		compound: {
			should: [
				{
					autocomplete: {
						query: 'valueField',
						path: 'autocomplete',
						score: { boost: { value: 1 } },
						fuzzy: {
							maxEdits: 1,
						},
					},
				},
				{
					autocomplete: {
						query: 'valueField',
						path: 'autocomplete1',
						score: { boost: { value: 1 } },
						fuzzy: {
							maxEdits: 1,
						},
					},
				},
			],
		},
	};

	expect(result).toStrictEqual(expected);
});

test('getAutoCompleteQuery when autocompleteField is an array of DataField and fuzziness is present', () => {
	const result = getAutoCompleteQuery({
		autocompleteField: [
			{ field: 'autocomplete', weight: 3 },
			{ field: 'autocomplete1', weight: 1.5 },
			{ field: 'autocomplete2', weight: 1 },
		],
		value: 'valueField',
		dataField: 'data2',
		fuzziness: 1,
	});
	const expected = {
		compound: {
			should: [
				{
					autocomplete: {
						query: 'valueField',
						path: 'autocomplete',
						score: { boost: { value: 3 } },
						fuzzy: {
							maxEdits: 1,
						},
					},
				},
				{
					autocomplete: {
						query: 'valueField',
						path: 'autocomplete1',
						score: { boost: { value: 1.5 } },
						fuzzy: {
							maxEdits: 1,
						},
					},
				},
				{
					autocomplete: {
						query: 'valueField',
						path: 'autocomplete2',
						score: { boost: { value: 1 } },
						fuzzy: {
							maxEdits: 1,
						},
					},
				},
			],
		},
	};

	expect(result).toStrictEqual(expected);
});

test(`getQueriesMap should return the map of given rs query array`, () => {
	const queries: RSQuery<any>[] = [
		{
			id: 'search',
			value: 'room',
			dataField: 'name',
			type: 'search',
			defaultQuery: [
				{
					$search: {
						compound: {
							should: [
								{
									text: {
										query: 'Private',
										path: 'name',
									},
								},
							],
						},
					},
				},
				{
					$limit: 30,
				},
			],
		},
		{
			id: 'term',
			value: 'Apartment',
			dataField: 'property_type',
			type: 'term',
			size: 20,
			react: {
				and: ['search'],
			},
		},
		{
			execute: true,
			react: {
				or: ['search'],
				and: ['term'],
			},
			id: 'accommodates_range',
			dataField: ['accommodates'],
			type: 'range',
			value: {
				start: 1,
				end: 10,
			},
			aggregations: ['min', 'max', 'histogram'],
			interval: 2,
		},
		{
			id: 'result',
			type: 'search',
			size: 10,
			includeFields: ['name'],
			react: {
				and: ['term', 'search'],
			},
		},
	];
	const result = getQueriesMap(queries);
	const expected = {
		search: {
			rsQuery: {
				id: 'search',
				value: 'room',
				dataField: 'name',
				type: 'search',
				defaultQuery: [
					{
						$search: {
							compound: {
								should: [{ text: { query: 'Private', path: 'name' } }],
							},
						},
					},
					{ $limit: 30 },
				],
			},
			mongoQuery: [
				{
					$search: {
						compound: {
							should: [
								{
									compound: {
										must: [
											{
												text: {
													path: 'name',
													query: 'room',
													score: { boost: { value: 1 } },
												},
											},
										],
									},
								},
							],
						},
					},
				},
				{ $facet: { hits: [{ $limit: 10 }], total: [{ $count: 'count' }] } },
			],
		},
		term: {
			rsQuery: {
				id: 'term',
				value: 'Apartment',
				dataField: 'property_type',
				type: 'term',
				size: 20,
				react: { and: ['search'] },
			},
			mongoQuery: [
				{
					$facet: {
						aggregations: [
							{ $unwind: '$property_type' },
							{ $sortByCount: '$property_type' },
						],
					},
				},
			],
		},
		accommodates_range: {
			rsQuery: {
				execute: true,
				react: { or: ['search'], and: ['term'] },
				id: 'accommodates_range',
				dataField: ['accommodates'],
				type: 'range',
				value: { start: 1, end: 10 },
				aggregations: ['min', 'max', 'histogram'],
				interval: 2,
			},
			mongoQuery: [
				{
					$search: {
						compound: {
							should: [{ range: { path: 'accommodates', gte: 1, lte: 10 } }],
						},
					},
				},
				{
					$facet: {
						hits: [{ $limit: 10 }],
						total: [{ $count: 'count' }],
						min: [{ $group: { _id: null, min: { $min: '$accommodates' } } }],
						max: [{ $group: { _id: null, max: { $max: '$accommodates' } } }],
						histogram: [
							{
								$bucket: {
									groupBy: '$accommodates',
									boundaries: [1, 3, 5, 7, 9],
									default: 'other',
								},
							},
						],
					},
				},
			],
		},
		result: {
			rsQuery: {
				id: 'result',
				type: 'search',
				dataField: '*',
				size: 10,
				includeFields: ['name'],
				react: { and: ['term', 'search'] },
			},
			mongoQuery: [
				{ $project: { name: 1 } },
				{ $facet: { hits: [{ $limit: 10 }], total: [{ $count: 'count' }] } },
			],
		},
	};
	expect(result).toStrictEqual(expected);
});

test(`buildQueryPipeline should return mongo query pipeline map`, () => {
	const queries: RSQuery<any>[] = [
		{
			id: 'custom',
			execute: false,
			customQuery: {
				$search: {
					compound: {
						should: [
							{
								text: {
									query: 'Private',
									path: 'name',
								},
							},
						],
					},
				},
			},
		},
		{
			id: 'search',
			value: 'room',
			dataField: 'name',
			type: 'search',
			size: 20,
			defaultQuery: [
				{
					$search: {
						compound: {
							should: [
								{
									text: {
										query: 'Private',
										path: 'name',
									},
								},
							],
						},
					},
				},
				{
					$limit: 30,
				},
			],
		},
		{
			id: 'term',
			value: 'Apartment',
			dataField: 'property_type',
			type: 'term',
			size: 20,
			react: {
				and: ['search'],
			},
		},
		{
			execute: true,
			react: {
				or: ['search'],
				and: ['term'],
			},
			id: 'accommodates_range',
			dataField: ['accommodates'],
			type: 'range',
			value: {
				start: 1,
				end: 10,
			},
			aggregations: ['min', 'max', 'histogram'],
			interval: 2,
		},
		{
			id: 'result',
			type: 'search',
			size: 10,
			includeFields: ['name'],
			react: {
				and: ['term', 'search'],
			},
		},
	];

	const qMap = getQueriesMap(queries);
	const result = buildQueryPipeline(qMap);
	const expected = {
		search: [
			{
				$search: {
					compound: { should: [{ text: { query: 'Private', path: 'name' } }] },
				},
			},
			{ $facet: { hits: [{ $limit: 30 }], total: [{ $count: 'count' }] } },
		],
		term: [
			{
				$search: {
					compound: {
						must: [
							{
								compound: {
									should: [
										{
											compound: {
												must: [
													{
														text: {
															path: 'name',
															query: 'room',
															score: { boost: { value: 1 } },
														},
													},
												],
											},
										},
									],
								},
							},
						],
					},
				},
			},
			{
				$facet: {
					aggregations: [
						{ $unwind: '$property_type' },
						{ $sortByCount: '$property_type' },
					],
				},
			},
		],
		accommodates_range: [
			{
				$search: {
					compound: {
						must: [
							{
								compound: {
									should: [
										{ range: { path: 'accommodates', gte: 1, lte: 10 } },
									],
								},
							},
							{
								compound: {
									must: [
										{
											compound: {
												filter: {
													phrase: {
														query: ['Apartment'],
														path: 'property_type',
													},
												},
											},
										},
										{
											compound: {
												should: [
													{
														compound: {
															should: [
																{
																	compound: {
																		must: [
																			{
																				text: {
																					path: 'name',
																					query: 'room',
																					score: { boost: { value: 1 } },
																				},
																			},
																		],
																	},
																},
															],
														},
													},
												],
											},
										},
									],
								},
							},
						],
					},
				},
			},
			{
				$facet: {
					hits: [{ $limit: 10 }],
					total: [{ $count: 'count' }],
					min: [{ $group: { _id: null, min: { $min: '$accommodates' } } }],
					max: [{ $group: { _id: null, max: { $max: '$accommodates' } } }],
					histogram: [
						{
							$bucket: {
								groupBy: '$accommodates',
								boundaries: [1, 3, 5, 7, 9],
								default: 'other',
							},
						},
					],
				},
			},
		],
		result: [
			{
				$search: {
					compound: {
						must: [
							{
								compound: {
									filter: {
										phrase: { query: ['Apartment'], path: 'property_type' },
									},
								},
							},
							{
								compound: {
									should: [
										{
											compound: {
												must: [
													{
														text: {
															path: 'name',
															query: 'room',
															score: { boost: { value: 1 } },
														},
													},
												],
											},
										},
									],
								},
							},
						],
					},
				},
			},
			{ $project: { name: 1 } },
			{ $facet: { hits: [{ $limit: 10 }], total: [{ $count: 'count' }] } },
		],
	};

	expect(result).toStrictEqual(expected);
});

test(`getQueriesMap should return the correct map of given rs query where type and dataField is missing, highlight is true`, () => {
	const queries: RSQuery<any>[] = [
		{
			id: 'search',
			index: 'default',
			highlight: true,
			includeFields: ['name'],
			value: 'apartment',
		},
	];
	const result = getQueriesMap(queries);
	const expected = {
		search: {
			rsQuery: {
				id: 'search',
				index: 'default',
				highlight: true,
				includeFields: ['name'],
				value: 'apartment',
				dataField: '*',
				type: 'search',
			},
			mongoQuery: [
				{
					$search: {
						compound: {
							should: [
								{
									compound: {
										must: [
											{
												text: {
													path: {
														wildcard: '*',
													},
													query: 'apartment',
													score: {
														boost: {
															value: 1,
														},
													},
												},
											},
										],
									},
								},
							],
						},
						highlight: {
							path: {
								wildcard: '*',
							},
							maxCharsToExamine: 500000,
							maxNumPassages: 5,
						},
						index: 'default',
					},
				},
				{
					$project: {
						name: 1,
						highlights: {
							$meta: 'searchHighlights',
						},
					},
				},
				{
					$facet: {
						hits: [
							{
								$limit: 10,
							},
						],
						total: [
							{
								$count: 'count',
							},
						],
					},
				},
			],
		},
	};
	expect(result).toStrictEqual(expected);
});
