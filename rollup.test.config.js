const typescript = require('@rollup/plugin-typescript');

const input = `src/index.ts`;

export default [
	// cjs
	{
		input,
		plugins: [
			typescript({
				outDir: 'lib/cjs',
				tsconfigOverride: {
					compilerOptions: {
						module: 'commonjs',
					},
				},
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
