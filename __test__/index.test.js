const { Realm } = require('../');

const mongoURL = `mongodb//real-function-url1`;
const ref = new Realm({
	url: mongoURL,
});

describe(`object creation tests`, () => {
	it(`creates object with passed url`, () => {
		expect(ref.config.url).toEqual(mongoURL);
	});
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

	console.log(`text query: `, JSON.stringify(query));
	it(`should have correct mongo format for searchQuery`, () => {
		const expected = {
			$search: { text: { query: `room`, path: [`name`] } },
		};
		expect(query[0]).toStrictEqual(expected);
	});

	it(`should have default limit`, () => {
		const limitObj = query.find((item) => item.$limit !== undefined);
		expect(limitObj.$limit).toEqual(10);
	});

	it(`should have default skip`, () => {
		const skipObj = query.find((item) => item.$skip !== undefined);
		expect(skipObj.$skip).toEqual(0);
	});

	it(`should have user defined limit`, () => {
		const skipObj = query.find((item) => item.$limit === testQuery[1].size);
		expect(skipObj.$limit).toEqual(20);
	});

	it(`should have user defined skip`, () => {
		const skipObj = query.find((item) => item.$skip === testQuery[1].from);
		expect(skipObj.$skip).toEqual(10);
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
	console.log(`geo query: `, JSON.stringify(query));
	it(`should have correct mongo format for geo query`, () => {
		const expected = {
			$search: {
				geoWithin: {
					circle: {
						center: {
							type: 'Point',
							coordinates: [50, 40],
						},
						radius: 8046.7,
					},
					path: [`location`],
				},
			},
		};
		expect(query[0]).toStrictEqual(expected);
	});
	it(`should have correct mongo format for geo bounding query`, () => {
		const expected = {
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
					path: [`location`],
				},
			},
		};
		expect(query[3]).toStrictEqual(expected);
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

	console.log(`range query: `, JSON.stringify(query));

	it(`should have correct mongo format for range query`, () => {
		const expected = {
			$search: {
				range: { path: 'accommodates', gte: 1, lte: 20, score: { boost: 1 } },
			},
		};
		expect(query[0]).toStrictEqual(expected);
	});

	it(`should have correct min query`, () => {
		const expected = {
			$group: { _id: null, min: { $min: '$accommodates' } },
		};
		expect(query[6]).toStrictEqual(expected);
	});

	it(`should have correct max query`, () => {
		const expected = { $group: { _id: null, max: { $max: '$accommodates' } } };
		expect(query[7]).toStrictEqual(expected);
	});

	it(`should have correct histogram query`, () => {
		const expected = {
			$bucket: {
				groupBy: '$accommodates',
				boundaries: [1, 3, 5, 7, 9, 11, 13, 15, 17, 19],
				default: 'other',
			},
		};
		expect(query[8]).toStrictEqual(expected);
	});

	it(`should have compound query for includeNullValues `, () => {
		const expected = {
			$search: {
				compound: {
					should: [
						{
							range: {
								path: 'accommodates',
								gte: 1,
								lte: 20,
								score: { boost: 1 },
							},
						},
						{ compound: { mustNot: [{ exists: { path: 'accommodates' } }] } },
					],
				},
			},
		};
		expect(query[9]).toStrictEqual(expected);
	});
});
