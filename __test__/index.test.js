const { ReactiveSearchRealm } = require('../lib/cjs');

const mongoURL = `mongodb//real-function-url1`;
const ref = new ReactiveSearchRealm({
	url: mongoURL,
});

describe(`object creation tests`, () => {
	it(`creates object with passed url`, () => {
		expect(ref.config.url).toEqual(mongoURL);
	});
});
