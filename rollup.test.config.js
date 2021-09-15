const typescript = require('@rollup/plugin-typescript');

const input = `src/searchFunction/index.ts`;

export default [
	// cjs
	{
		input,
		plugins: [typescript({ outDir: 'lib/cjs', module: 'esnext' })],
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
