const { Realm } = require('../lib/cjs');

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

	console.log(`text search query: `, JSON.stringify(query));
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
	];
	const query = ref.query(testQuery);

	console.log(`range query: `, JSON.stringify(query));

	it(`creates object with passed url`, () => {
		expect(ref.config.url).toEqual(mongoURL);
	});
});
