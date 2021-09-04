import {
	getIncludeExcludeFields,
	getQueriesMap,
	buildQueryPipeline,
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

test('buildQueryPipeline get mongo compound queries', () => {
	const testQuery: RSQuery<any>[] = [
		{
			id: `searchQuery`,
			value: `room`,
			dataField: [`name`],
			type: `search`,
		},
		{
			id: `geoQuery`,
			value: {
				distance: 5,
				location: '50, 40',
				unit: 'mi',
			},
			dataField: [`location`],
			type: `geo`,
			react: {
				and: 'searchQuery',
			},
		},
	];

	const expected = {
		$search: {
			compound: {
				must: [
					{
						geoWithin: {
							circle: {
								center: {
									type: 'Point',
									coordinates: [50, 40],
								},
								radius: 8046.7,
							},
							path: ['location'],
						},
					},
				],
				should: [
					{
						geoWithin: {
							circle: {
								center: {
									type: 'Point',
									coordinates: [50, 40],
								},
								radius: 8046.7,
							},
							path: ['location'],
						},
					},
				],
			},
		},
	};

	const qmap = getQueriesMap(testQuery);
	const result = buildQueryPipeline(qmap);
	console.log(JSON.stringify(result));
	expect(result.geoQuery.mongoQuery[0]).toStrictEqual(expected);
});
