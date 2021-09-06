import {
	getFuzziness,
	getIncludeExcludeFields,
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
	const expected = {
		fuzzy: {
			maxEdits: 0,
		},
	};
	expect(result).toStrictEqual(expected);
});
