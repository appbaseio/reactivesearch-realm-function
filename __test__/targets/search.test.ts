import { getSearchSortByQuery } from '../../src/targets/search';

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
