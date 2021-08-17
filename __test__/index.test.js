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

describe(`generates search query correctly`, () => {
	const query = ref.query(testQuery);
	it(`should have correct mongo format for searchQuery`, () => {
		const expected = {
			$search: { index: `default`, text: { query: `room`, path: [`name`] } },
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
