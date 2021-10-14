var config = require('./jest.config');
config.testRegex = '.unit.test.ts$';
config.collectCoverageFrom = [
	...config.collectCoverageFrom,
	'!src/searchFunction/index.ts',
];
module.exports = config;
