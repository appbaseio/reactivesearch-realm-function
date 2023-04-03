import {
	getHighlightQuery,
	getQueryStringQuery,
	getSearchAggregation,
	getSearchOrSuggestionQuery,
	getSearchSortByQuery,
} from '../../src/targets/search';
import { ConfigType } from '../../src/types/types';

const config: ConfigType = {
	database: 'sample_airbnb',
	collection: 'listingsAndReviews',
};

test('getSearchAggregation when dataField is a string', () => {
	const result = getSearchAggregation({
		value: 'valueField',
		dataField: 'data',
	});
	const expected = {
		compound: {
			must: [
				{
					text: {
						query: 'valueField',
						path: 'data',
						score: { boost: { value: 1 } },
					},
				},
			],
		},
	};
	// Snapshot demo
	expect(result).toStrictEqual(expected);
});

test('getSearchAggregation when autocompleteField is an array of string', () => {
	const result = getSearchAggregation({
		dataField: ['data1', 'data2'],
		value: 'valueField',
	});
	const expected = {
		compound: {
			must: [
				{
					text: {
						query: 'valueField',
						path: 'data1',
						score: { boost: { value: 1 } },
					},
				},
				{
					text: {
						query: 'valueField',
						path: 'data2',
						score: { boost: { value: 1 } },
					},
				},
			],
		},
	};
	// Snapshot demo
	expect(result).toStrictEqual(expected);
});

test('getSearchAggregation when autocompleteField is an array of DataField', () => {
	const result = getSearchAggregation({
		dataField: [
			{ field: 'data1', weight: 3 },
			{ field: 'data2', weight: 1.5 },
			{ field: 'data3', weight: 1 },
		],
		value: 'valueField',
	});
	const expected = {
		compound: {
			must: [
				{
					text: {
						query: 'valueField',
						path: 'data1',
						score: { boost: { value: 3 } },
					},
				},
				{
					text: {
						query: 'valueField',
						path: 'data2',
						score: { boost: { value: 1.5 } },
					},
				},
				{
					text: {
						query: 'valueField',
						path: 'data3',
						score: { boost: { value: 1 } },
					},
				},
			],
		},
	};
	// Snapshot demo
	expect(result).toStrictEqual(expected);
});

test('getSearchSortByQuery when no dataField is mentioned', () => {
	const result = getSearchSortByQuery({});
	const expected = {
		$sort: { score: { $meta: 'textScore' }, _id: -1 },
	};
	// Snapshot demo
	expect(result).toStrictEqual(expected);
});

test('getSearchSortByQuery when no datafield is mentioned by sort by is ascending', () => {
	const result = getSearchSortByQuery({
		sortBy: 'asc',
	});
	const expected = {
		$sort: { score: { $meta: 'textScore' }, _id: 1 },
	};
	// Snapshot demo
	expect(result).toStrictEqual(expected);
});

test('getSearchSortByQuery when datafield is a string and no order by is mentioned', () => {
	const result = getSearchSortByQuery({
		dataField: 'column1',
	});
	const expected = {
		$sort: {
			column1: -1,
		},
	};
	// Snapshot demo
	expect(result).toStrictEqual(expected);
});

test('getSearchSortByQuery when datafield is a string and order by ascending', () => {
	const result = getSearchSortByQuery({
		dataField: 'column1',
		sortBy: `asc`,
	});
	const expected = {
		$sort: {
			column1: 1,
		},
	};
	// Snapshot demo
	expect(result).toStrictEqual(expected);
});

test('getSearchSortByQuery when datafield is a string and order by descending', () => {
	const result = getSearchSortByQuery({
		dataField: 'column1',
		sortBy: `desc`,
	});
	const expected = {
		$sort: {
			column1: -1,
		},
	};
	// Snapshot demo
	expect(result).toStrictEqual(expected);
});

test('getSearchSortByQuery when datafield is an empty array and order by is descending', () => {
	const result = getSearchSortByQuery({
		dataField: [],
		sortBy: `desc`,
	});
	const expected = {
		$sort: { score: { $meta: 'textScore' }, _id: -1 },
	};
	// Snapshot demo
	expect(result).toStrictEqual(expected);
});

test('getSearchSortByQuery when datafield is a string array and order by is ascending', () => {
	const result = getSearchSortByQuery({
		dataField: ['data1', 'data2', 'data3'],
		sortBy: `desc`,
	});
	const expected = {
		$sort: {
			data1: -1,
		},
	};
	// Snapshot demo
	expect(result).toStrictEqual(expected);
});

test('getSearchSortByQuery when datafield is an object array and order by is ascending', () => {
	const result = getSearchSortByQuery({
		dataField: [
			{ field: 'data1', weight: 1 },
			{ field: 'data2', weight: 1 },
			{ field: 'data3', weight: 1 },
		],
		sortBy: `desc`,
	});
	const expected = {
		$sort: {
			data1: -1,
		},
	};
	// Snapshot demo
	expect(result).toStrictEqual(expected);
});

test('getQueryStringQuery when datafield is a string and queryString is false', () => {
	const result = getQueryStringQuery({
		dataField: 'column1',
		value: 'value',
		queryString: false,
	});
	const expected = {};
	// Snapshot demo
	expect(result).toStrictEqual(expected);
});

test('getQueryStringQuery when datafield is a string and queryString is true', () => {
	const result = getQueryStringQuery({
		dataField: 'column1',
		value: 'value',
		queryString: true,
	});
	const expected = {
		queryString: {
			defaultPath: 'column1',
			query: 'value',
		},
	};
	// Snapshot demo
	expect(result).toStrictEqual(expected);
});

test('getQueryStringQuery when datafield is an empty array and queryString is true', () => {
	const result = getQueryStringQuery({
		dataField: [],
		value: 'value',
		queryString: true,
	});
	const expected = {};
	// Snapshot demo
	expect(result).toStrictEqual(expected);
});

test('getQueryStringQuery when datafield is a string array and queryString is true', () => {
	const result = getQueryStringQuery({
		dataField: ['data1', 'data2', 'data3'],
		value: 'value',
		queryString: true,
	});
	const expected = {
		queryString: {
			defaultPath: 'data1',
			query: 'value',
		},
	};
	// Snapshot demo
	expect(result).toStrictEqual(expected);
});

test('getQueryStringQuery when datafield is an object array and queryString is true', () => {
	const result = getQueryStringQuery({
		dataField: [
			{ field: 'data1', weight: 1 },
			{ field: 'data2', weight: 1 },
			{ field: 'data3', weight: 1 },
		],
		value: 'value',
		queryString: true,
	});
	const expected = {
		queryString: {
			defaultPath: 'data1',
			query: 'value',
		},
	};
	// Snapshot demo
	expect(result).toStrictEqual(expected);
});

test('getHighlightQuery when highlight is missing', () => {
	const result = getHighlightQuery({
		dataField: [
			{ field: 'data1', weight: 1 },
			{ field: 'data2', weight: 1 },
			{ field: 'data3', weight: 1 },
		],
		sortBy: `desc`,
	});
	const expected = {};
	// Snapshot demo
	expect(result).toStrictEqual(expected);
});

test('getHighlightQuery when highlight is false', () => {
	const result = getHighlightQuery({
		dataField: [
			{ field: 'data1', weight: 1 },
			{ field: 'data2', weight: 1 },
			{ field: 'data3', weight: 1 },
		],
		sortBy: `desc`,
		highlight: false,
	});
	const expected = {};
	// Snapshot demo
	expect(result).toStrictEqual(expected);
});

test('getHighlightQuery when highlight is true and datafield is an array of DataField', () => {
	const result = getHighlightQuery({
		dataField: [
			{ field: 'data1', weight: 1 },
			{ field: 'data2', weight: 1 },
			{ field: 'data3', weight: 1 },
		],
		sortBy: `desc`,
		highlight: true,
	});
	const expected = {
		highlight: {
			path: ['data1', 'data2', 'data3'],
			maxCharsToExamine: 500000,
			maxNumPassages: 5,
		},
	};
	// Snapshot demo
	expect(result).toStrictEqual(expected);
});

test('getHighlightQuery when highlight is true and datafield is an array of DataField', () => {
	const result = getHighlightQuery({
		dataField: [
			{ field: 'data1', weight: 1 },
			{ field: 'data2', weight: 1 },
			{ field: 'data3', weight: 1 },
		],
		sortBy: `desc`,
		highlight: true,
	});
	const expected = {
		highlight: {
			path: ['data1', 'data2', 'data3'],
			maxCharsToExamine: 500000,
			maxNumPassages: 5,
		},
	};
	// Snapshot demo
	expect(result).toStrictEqual(expected);
});

test('getHighlightQuery when highlight is true and datafield is an array of string', () => {
	const result = getHighlightQuery({
		dataField: ['data1', 'data2', 'data3'],
		sortBy: `desc`,
		highlight: true,
	});
	const expected = {
		highlight: {
			path: ['data1', 'data2', 'data3'],
			maxCharsToExamine: 500000,
			maxNumPassages: 5,
		},
	};
	// Snapshot demo
	expect(result).toStrictEqual(expected);
});

test('getHighlightQuery when highlight is true and highlightField is a string', () => {
	const result = getHighlightQuery({
		dataField: 'data',
		sortBy: `desc`,
		highlight: true,
		highlightField: 'field1',
	});
	const expected = {
		highlight: {
			path: ['field1'],
			maxCharsToExamine: 500000,
			maxNumPassages: 5,
		},
	};
	// Snapshot demo
	expect(result).toStrictEqual(expected);
});

test('getHighlightQuery when highlight is true and highlightField is an array', () => {
	const result = getHighlightQuery({
		dataField: 'data',
		sortBy: `desc`,
		highlight: true,
		highlightField: ['field1', 'field2'],
	});
	const expected = {
		highlight: {
			path: ['field1', 'field2'],
			maxCharsToExamine: 500000,
			maxNumPassages: 5,
		},
	};
	// Snapshot demo
	expect(result).toStrictEqual(expected);
});

test('getHighlightQuery when highlight is true and highlightConfig is passed', () => {
	const result = getHighlightQuery({
		dataField: 'data',
		sortBy: `desc`,
		highlight: true,
		highlightField: ['field1', 'field2'],
		highlightConfig: {
			maxCharsToExamine: 250000,
			maxNumPassages: 10,
		},
	});
	const expected = {
		highlight: {
			path: ['field1', 'field2'],
			maxCharsToExamine: 250000,
			maxNumPassages: 10,
		},
	};
	// Snapshot demo
	expect(result).toStrictEqual(expected);
});

test('getHighlightQuery when highlight is true, dataField is a wildcard and highlight fields are missing', () => {
	const result = getHighlightQuery({
		dataField: '*',
		sortBy: `desc`,
		highlight: true,
		highlightConfig: {
			maxCharsToExamine: 250000,
			maxNumPassages: 10,
		},
	});
	const expected = {
		highlight: {
			path: { wildcard: '*' },
			maxCharsToExamine: 250000,
			maxNumPassages: 10,
		},
	};
	// Snapshot demo
	expect(result).toStrictEqual(expected);
});

test('getSearchOrSuggestionQuery when highlight is true', () => {
	const result = getSearchOrSuggestionQuery(
		{
			value: 'Apart',
			dataField: 'data',
			sortBy: `desc`,
			highlight: true,
			highlightField: ['field1', 'field2'],
			highlightConfig: {
				maxCharsToExamine: 250000,
				maxNumPassages: 10,
			},
		},
		config,
	);
	const expected = [
		{
			$search: {
				compound: {
					should: [
						{
							compound: {
								must: [
									{
										text: {
											path: 'data',
											query: 'Apart',
											score: { boost: { value: 1 } },
										},
									},
								],
							},
						},
					],
				},
				highlight: {
					maxCharsToExamine: 250000,
					maxNumPassages: 10,
					path: ['field1', 'field2'],
				},
			},
		},
		{ $sort: { data: -1 } },
		{ $facet: { hits: [{ $limit: 10 }], total: [{ $count: 'count' }] } },
	];
	// Snapshot demo
	expect(result).toStrictEqual(expected);
});

test('getSearchOrSuggestionQuery when highlight is true and performing wildcard highlight', () => {
	const result = getSearchOrSuggestionQuery(
		{
			value: 'Apart',
			dataField: 'data',
			sortBy: `desc`,
			highlight: true,
			highlightField: 'field*',
			highlightConfig: {
				maxCharsToExamine: 250000,
				maxNumPassages: 10,
			},
		},
		config,
	);
	const expected = [
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
												wildcard: 'field*',
											},
											query: 'Apart',
											score: { boost: { value: 1 } },
										},
									},
								],
							},
						},
					],
				},
				highlight: {
					maxCharsToExamine: 250000,
					maxNumPassages: 10,
					path: {
						wildcard: 'field*',
					},
				},
			},
		},
		{ $sort: { data: -1 } },
		{ $facet: { hits: [{ $limit: 10 }], total: [{ $count: 'count' }] } },
	];
	// Snapshot demo
	expect(result).toStrictEqual(expected);
});
