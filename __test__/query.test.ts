import { Realm } from '../src';

// Runs integration tests

const mongoURL = `mongodb//real-function-url1`;
const ref = new Realm({
	url: mongoURL,
});

describe(`generates search query correctly`, () => {
	const testQuery = [
		{
			id: `searchQuery`,
			value: `room`,
			dataField: [`name`],
			type: `search`,
		},
		{
			id: `searchQuerySize`,
			value: `room`,
			dataField: [`name`],
			type: `search`,
			size: 20,
			from: 10,
		},
	];
	const query = ref.query(testQuery);

	it(`should have correct mongo format for searchQuery`, () => {
		const expected = [
			{
				$search: { text: { query: `room`, path: [`name`] } },
			},
			{
				$limit: 10,
			},
			{
				$skip: 0,
			},
		];
		expect(query[0]).toStrictEqual(expected);
	});

	it(`should have user defined limit and skip`, () => {
		const expected = [
			{ $search: { text: { query: 'room', path: ['name'] } } },
			{ $limit: 20 },
			{ $skip: 10 },
		];
		expect(query[1]).toStrictEqual(expected);
	});
});

describe(`generate geo query correctly`, () => {
	const testQuery = [
		{
			id: `geoQuery`,
			value: {
				distance: 5,
				location: '50, 40',
				unit: 'mi',
			},
			dataField: [`location`],
			type: `geo`,
			size: 20,
			from: 10,
		},
		{
			id: `geoBoundingQuery`,
			value: {
				geoBoundingBox: {
					bottomRight: { lat: 40, long: 60 },
					topLeft: [20, 30],
				},
			},
			dataField: [`location`],
			type: `geo`,
			size: 20,
			from: 10,
		},
	];
	const query = ref.query(testQuery);
	it(`should have correct mongo format for geo query`, () => {
		const expected = [
			{
				$search: {
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
			},
			{
				$limit: 20,
			},
			{
				$skip: 10,
			},
		];
		expect(query[0]).toStrictEqual(expected);
	});
	it(`should have correct mongo format for geo bounding query`, () => {
		const expected = [
			{
				$search: {
					geoWithin: {
						box: {
							bottomLeft: {
								type: 'Point',
								coordinates: [20, 60],
							},
							topRight: {
								type: 'Point',
								coordinates: [40, 30],
							},
						},
						path: ['location'],
					},
				},
			},
			{
				$limit: 20,
			},
			{
				$skip: 10,
			},
		];
		expect(query[1]).toStrictEqual(expected);
	});
});

describe(`generates range query correctly`, () => {
	const testQuery = [
		{
			id: `rangeQuery`,
			value: {
				start: 1,
				end: 20,
				boost: 1,
			},
			dataField: [`accommodates`],
			type: `range`,
		},
		{
			id: `rangeQueryWithAggs`,
			value: {
				start: 1,
				end: 20,
				boost: 1,
			},
			aggregations: [`min`, `max`, `histogram`],
			interval: 2,
			dataField: [`accommodates`],
			type: `range`,
		},
		{
			id: `rangeQueryWithNull`,
			value: {
				start: 1,
				end: 20,
				boost: 1,
			},
			dataField: [`accommodates`],
			includeNullValues: true,
			type: `range`,
		},
	];
	const query = ref.query(testQuery);

	it(`should have correct mongo format for range query`, () => {
		const expected = [
			{
				$search: {
					range: {
						path: 'accommodates',
						gte: 1,
						lte: 20,
						score: {
							boost: 1,
						},
					},
				},
			},
			{
				$limit: 10,
			},
			{
				$skip: 0,
			},
		];
		expect(query[0]).toStrictEqual(expected);
	});

	it(`should have correct min and max query`, () => {
		expect(query[1][3]).toStrictEqual({
			$group: {
				_id: null,
				min: {
					$min: '$accommodates',
				},
			},
		});
		expect(query[1][4]).toStrictEqual({
			$group: { _id: null, max: { $max: '$accommodates' } },
		});
	});

	it(`should have correct histogram query`, () => {
		const expected = {
			$bucket: {
				groupBy: '$accommodates',
				boundaries: [1, 3, 5, 7, 9, 11, 13, 15, 17, 19],
				default: 'other',
			},
		};
		expect(query[1][5]).toStrictEqual(expected);
	});

	it(`should have compound query for includeNullValues `, () => {
		const expected = [
			{
				$search: {
					compound: {
						should: [
							{
								range: {
									path: 'accommodates',
									gte: 1,
									lte: 20,
									score: {
										boost: 1,
									},
								},
							},
							{
								compound: {
									mustNot: [
										{
											exists: {
												path: 'accommodates',
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
				$limit: 10,
			},
			{
				$skip: 0,
			},
		];
		expect(query[2]).toStrictEqual(expected);
	});
});

describe(`generate term query correctly`, () => {
	const testQuery = [
		{
			id: `term-query`,
			type: `term`,
			dataField: `property_type`,
			sortBy: `asc`,
			aggregationSize: 3,
		},
	];

	const query = ref.query(testQuery);
	it(`should have correct mongo format for term query`, () => {
		const expected = [
			{
				$facet: {
					aggs: [
						{ $unwind: '$property_type' },
						{ $sortByCount: '$property_type' },
						{ $sort: { _id: 1 } },
						{ $limit: 3 },
					],
				},
			},
		];
		expect(query[0]).toStrictEqual(expected);
	});
});
