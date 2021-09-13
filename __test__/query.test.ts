import { DataField, GeoValue, RSQuery, RangeValue } from '../src/types/types';

import { ReactiveSearch } from '../src/searchFunction';

// Runs integration tests

const ref = new ReactiveSearch({
	database: 'sample_airbnb',
	documentCollection: '',
});

describe(`generates search query correctly`, () => {
	const testQuery: RSQuery<string | string[] | DataField[]>[] = [
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
	const query = ref.translate(testQuery);
	console.log(`search query:`, JSON.stringify(query));
	it(`should have correct mongo format for searchQuery`, () => {
		const expected = [
			{
				$search: {
					compound: {
						should: [
							{
								compound: {
									must: [
										{
											text: {
												query: `room`,
												path: `name`,
												score: { boost: { value: 1 } },
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
				$facet: {
					hits: [
						{
							$limit: 10,
						},
					],
					total: [
						{
							$count: 'count',
						},
					],
				},
			},
		];
		expect(query.searchQuery).toStrictEqual(expected);
	});

	it(`should have user defined limit and skip`, () => {
		const expected = [
			{
				$search: {
					compound: {
						should: [
							{
								compound: {
									must: [
										{
											text: {
												query: `room`,
												path: `name`,
												score: { boost: { value: 1 } },
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
				$facet: {
					hits: [
						{
							$skip: 10,
						},
						{
							$limit: 20,
						},
					],
					total: [
						{
							$count: 'count',
						},
					],
				},
			},
		];
		expect(query.searchQuerySize).toStrictEqual(expected);
	});
});

describe(`generate geo query correctly`, () => {
	const testQuery: RSQuery<GeoValue>[] = [
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
	const query = ref.translate(testQuery);
	console.log(`geo query:`, JSON.stringify(query));
	it(`should have correct mongo format for geo query`, () => {
		const expected = [
			{
				$search: {
					compound: {
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
			},
			{
				$facet: {
					hits: [
						{
							$skip: 10,
						},
						{
							$limit: 20,
						},
					],
					total: [
						{
							$count: 'count',
						},
					],
				},
			},
		];
		expect(query.geoQuery).toStrictEqual(expected);
	});
	it(`should have correct mongo format for geo bounding query`, () => {
		const expected = [
			{
				$search: {
					compound: {
						should: [
							{
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
						],
					},
				},
			},
			{
				$facet: {
					hits: [
						{
							$skip: 10,
						},
						{
							$limit: 20,
						},
					],
					total: [
						{
							$count: 'count',
						},
					],
				},
			},
		];
		expect(query.geoBoundingQuery).toStrictEqual(expected);
	});
});

describe(`generates range query correctly`, () => {
	const testQuery: RSQuery<RangeValue>[] = [
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
	const query = ref.translate(testQuery);
	console.log(`range query:`, JSON.stringify(query));
	it(`should have correct mongo format for range query`, () => {
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
						],
					},
				},
			},
			{
				$facet: {
					hits: [
						{
							$limit: 10,
						},
					],
					total: [
						{
							$count: 'count',
						},
					],
				},
			},
		];
		expect(query.rangeQuery).toStrictEqual(expected);
	});

	it(`should have correct min and max query and histogram`, () => {
		expect(query.rangeQueryWithAggs).toStrictEqual([
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
						],
					},
				},
			},
			{
				$facet: {
					hits: [
						{
							$limit: 10,
						},
					],
					total: [
						{
							$count: 'count',
						},
					],
					min: [
						{
							$group: {
								_id: null,
								min: {
									$min: '$accommodates',
								},
							},
						},
					],
					max: [
						{
							$group: {
								_id: null,
								max: {
									$max: '$accommodates',
								},
							},
						},
					],
					histogram: [
						{
							$bucket: {
								groupBy: '$accommodates',
								boundaries: [1, 3, 5, 7, 9, 11, 13, 15, 17, 19],
								default: 'other',
							},
						},
					],
				},
			},
		]);
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
				$facet: {
					hits: [
						{
							$limit: 10,
						},
					],
					total: [
						{
							$count: 'count',
						},
					],
				},
			},
		];
		expect(query.rangeQueryWithNull).toStrictEqual(expected);
	});
});

describe(`generate term query correctly`, () => {
	const testQuery: RSQuery<string | string[]>[] = [
		{
			id: `termQuery`,
			type: `term`,
			dataField: `property_type`,
			sortBy: `asc`,
			aggregationSize: 3,
		},
	];

	const query = ref.translate(testQuery);
	console.log(`term query:`, JSON.stringify(query));
	it(`should have correct mongo format for term query`, () => {
		const expected = [
			{
				$facet: {
					aggregations: [
						{ $unwind: '$property_type' },
						{ $sortByCount: '$property_type' },
						{ $sort: { _id: 1 } },
						{ $limit: 3 },
					],
				},
			},
		];
		expect(query.termQuery).toStrictEqual(expected);
	});
});
