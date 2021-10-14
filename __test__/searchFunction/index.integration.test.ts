import { MongoClient } from 'mongodb';
import { ReactiveSearch } from '../../src/searchFunction/index';
import { RSQuery } from '../../src/types/types';
require('dotenv').config();

const cleanData = (data: any) => {
	delete data?.settings?.took;
	delete data?.termQuery?.took;
	delete data?.term?.took;
	delete data?.result?.took;
	delete data?.range?.took;
	delete data?.geoQuery?.took;
	return data;
};

describe('Reactive Search integration test', () => {
	let client: MongoClient;
	const db = 'sample_airbnb',
		collection = 'listingsAndReviews';
	beforeAll(async () => {
		client = new MongoClient(process.env.DB_URL || `mongodb://localhost:27017`);
		await client.connect();
	});

	afterAll(async () => {
		await client.close();
	});

	test('Aggregation Size query', async () => {
		const ref = new ReactiveSearch({
			client,
			database: <string>db,
			collection: <string>collection,
		});
		const query: RSQuery<any>[] = [
			{
				id: 'termQuery',
				type: 'term',
				dataField: 'property_type',
				aggregationSize: 5,
			},
		];

		const data = await ref.query(query);
		expect(cleanData(data)).toMatchSnapshot();
	});

	test('Sorting query', async () => {
		const ref = new ReactiveSearch({
			client,
			database: <string>db,
			collection: <string>collection,
		});
		const query: RSQuery<any>[] = [
			{
				id: 'termQuery',
				type: 'term',
				dataField: 'property_type',
				sortBy: 'asc',
			},
		];

		const data = await ref.query(query);
		expect(cleanData(data)).toMatchSnapshot();
	});

	test('Find any item, or query', async () => {
		const ref = new ReactiveSearch({
			client,
			database: <string>db,
			collection: <string>collection,
		});
		const query: RSQuery<any>[] = [
			{
				id: 'term',
				value: 'Apartment',
				dataField: 'property_type',
				type: 'term',
				size: 3,
			},
			{
				id: 'result',
				type: 'search',
				size: 100,
				includeFields: ['name', 'property_type'],
				react: {
					or: ['term'],
				},
			},
		];

		const data = await ref.query(query);
		data.term.aggregations.property_type.buckets =
			data.term.aggregations.property_type.buckets.sort((a: any, b: any) =>
				a.key.localeCompare(b.key),
			);
		expect(cleanData(data)).toMatchSnapshot();
	});

	test('Find any item, and query', async () => {
		const ref = new ReactiveSearch({
			client,
			database: <string>db,
			collection: <string>collection,
		});
		const query: RSQuery<any>[] = [
			{
				id: 'term',
				value: 'Apartment',
				dataField: 'property_type',
				type: 'term',
				size: 5,
			},
			{
				id: 'result',
				type: 'search',
				size: 10,
				includeFields: ['name', 'property_type'],
				react: {
					and: ['term'],
				},
			},
		];

		const data = await ref.query(query);
		data.term.aggregations.property_type.buckets =
			data.term.aggregations.property_type.buckets.sort((a: any, b: any) =>
				a.key.localeCompare(b.key),
			);
		expect(cleanData(data)).toMatchSnapshot();
	});

	test('Range query', async () => {
		const ref = new ReactiveSearch({
			client,
			database: <string>db,
			collection: <string>collection,
		});
		const query: RSQuery<any>[] = [
			{
				id: 'range',
				dataField: ['accommodates'],
				type: 'range',
				value: {
					start: 1,
					end: 10,
				},
				includeFields: ['accommodates', 'name'],
			},
		];

		const data = await ref.query(query);
		expect(cleanData(data)).toMatchSnapshot();
	});

	test('Range query min, max and histogram', async () => {
		const ref = new ReactiveSearch({
			client,
			database: <string>db,
			collection: <string>collection,
		});
		const query: RSQuery<any>[] = [
			{
				id: 'range',
				dataField: ['accommodates'],
				type: 'range',
				value: {
					start: 1,
					end: 10,
				},
				aggregations: ['min', 'max', 'histogram'],
				interval: 2,
				includeFields: ['accommodates', 'name'],
			},
		];

		const data = await ref.query(query);
		expect(cleanData(data)).toMatchSnapshot();
	});

	test('Radius Geo Query', async () => {
		const ref = new ReactiveSearch({
			client,
			database: <string>db,
			collection: <string>collection,
		});
		const query: RSQuery<any>[] = [
			{
				id: 'geoQuery',
				value: {
					distance: 500,
					location: [114.17158, 22.30469],
					unit: 'mi',
				},
				dataField: ['address.location'],
				index: 'custom',
				type: 'geo',
				size: 5,
				includeFields: ['listing_url'],
			},
		];

		const data = await ref.query(query);
		expect(cleanData(data)).toMatchSnapshot();
	});

	test('Bounding box Geo Query', async () => {
		const ref = new ReactiveSearch({
			client,
			database: <string>db,
			collection: <string>collection,
		});
		const query: RSQuery<any>[] = [
			{
				id: 'geoQuery',
				value: {
					geoBoundingBox: {
						bottomRight: {
							long: 40.01,
							lat: -71.12,
						},
						topLeft: {
							long: 40.73,
							lat: -74.1,
						},
					},
				},
				dataField: ['address.location'],
				index: 'custom',
				type: 'geo',
				size: 5,
				includeFields: ['listing_url'],
			},
		];

		const data = await ref.query(query);
		expect(cleanData(data)).toMatchSnapshot();
	});

	test('Highlight Query', async () => {
		const ref = new ReactiveSearch({
			client,
			database: <string>db,
			collection: <string>collection,
		});
		const query: RSQuery<any>[] = [
			{
				id: 'result',
				index: 'default',
				dataField: 'name',
				highlight: true,
				value: 'apartment',
			},
		];

		const data = await ref.query(query);
		expect(cleanData(data)).toMatchSnapshot();
	});

	test('Validate database and collection', async () => {
		const ref = new ReactiveSearch({
			client,
			database: <string>db,
			collection: <string>collection,
		});

		const data = await ref.validateCollection();
		expect(cleanData(data)).toMatchSnapshot();
	});

	test('Validate database and collection. when database is incorrect', async () => {
		const ref = new ReactiveSearch({
			client,
			database: <string>db + 'i',
			collection: <string>collection,
		});

		const data = await ref.validateCollection();
		expect(cleanData(data)).toMatchSnapshot();
	});

	test('Validate database and collection. when collection is incorrect', async () => {
		const ref = new ReactiveSearch({
			client,
			database: <string>db,
			collection: <string>collection + 'i',
		});

		const data = await ref.validateCollection();
		expect(cleanData(data)).toMatchSnapshot();
	});
});
