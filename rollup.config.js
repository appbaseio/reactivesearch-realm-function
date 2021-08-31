const typescript = require('@rollup/plugin-typescript');
const filesize = require('rollup-plugin-filesize');
const { terser } = require('rollup-plugin-terser');

const input = `src/index.ts`;

module.exports = [
	{
		// UMD
		input,
		plugins: [typescript(), filesize(), terser()],
		output: {
			file: `lib/reactivesearch-realm.min.js`,
			format: 'umd',
			name: 'reactivesearch', // this is the name of the global object
			esModule: false,
			sourcemap: true,
		},
	},
	// ESM
	{
		input,
		plugins: [typescript({ outDir: 'lib/esm' })],
		output: [
			{
				dir: 'lib/esm',
				format: 'esm',
				exports: 'named',
				sourcemap: true,
			},
		],
	},
	// cjs
	{
		input,
		plugins: [
			typescript({
				outDir: 'lib/cjs',
				module: 'es6',
			}),
		],
		output: [
			{
				dir: 'lib/cjs',
				format: 'cjs',
				exports: 'named',
				sourcemap: true,
			},
		],
	},
];
