import {
	getHighlightQuery,
	getSearchSortByQuery,
} from '../../src/targets/search';

test('getSearchSortByQuery when no datafield is mentioned', () => {
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
