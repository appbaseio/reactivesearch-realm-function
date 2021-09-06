import { getIncludeExcludeFields } from '../../src/targets/common';

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
