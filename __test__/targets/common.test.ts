import {
	getIncludeExcludeFields,
	getFuzziness,
	getSynonymsQuery,
} from '../../src/targets/common';

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
	// Snapshot demo
	expect(result).toStrictEqual(expected);
});

test('getIncludeExcludeFields when * is in includeFields and excludeFields is empty', () => {
	const result = getIncludeExcludeFields({
		excludeFields: [],
		includeFields: ['*'],
	});
	const expected = null;
	// Snapshot demo
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
	// Snapshot demo
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
	// Snapshot demo
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
	// Snapshot demo
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
	// Snapshot demo
	expect(result).toStrictEqual(expected);
});

test('getSynonymsQuery when both fuzziness and synonyms are enabled', () => {
	// Snapshot demo
	expect(() => {
		getSynonymsQuery({
			fuzziness: 'AUTO',
			enableSynonyms: true,
			synonymsField: 'mySynonyms',
			value: 'valueField',
			dataField: 'data1',
		});
	}).toThrowError();
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
	// Snapshot demo
	expect(result).toStrictEqual(expected);
});

// test('buildQueryPipeline get mongo compound queries', () => {
// 	const testQuery: RSQuery<any>[] = [
// 		{
// 			id: `searchQuery`,
// 			value: `room`,
// 			dataField: [`name`],
// 			type: `search`,
// 		},
// 		{
// 			id: `geoQuery`,
// 			value: {
// 				distance: 5,
// 				location: '50, 40',
// 				unit: 'mi',
// 			},
// 			dataField: [`location`],
// 			type: `geo`,
// 			react: {
// 				and: 'searchQuery',
// 			},
// 		},
// 	];

// 	const expected = {
// 		$search: {
// 			compound: {
// 				must: [
// 					{
// 						geoWithin: {
// 							circle: {
// 								center: {
// 									type: 'Point',
// 									coordinates: [50, 40],
// 								},
// 								radius: 8046.7,
// 							},
// 							path: ['location'],
// 						},
// 					},
// 				],
// 				should: [
// 					{
// 						geoWithin: {
// 							circle: {
// 								center: {
// 									type: 'Point',
// 									coordinates: [50, 40],
// 								},
// 								radius: 8046.7,
// 							},
// 							path: ['location'],
// 						},
// 					},
// 				],
// 			},
// 		},
// 	};

// 	const qmap = getQueriesMap(testQuery);
// 	const result = buildQueryPipeline(qmap);
// 	console.log(JSON.stringify(result));
// 	expect(result[1][0]).toStrictEqual(expected);
// });
