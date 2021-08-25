import { RSQuery } from 'src/types';

const UNITS = [`mi`, `yd`, `ft`, `km`, `m`, `cm`, `mm`, `nmi`];

const convertToMeter = (distance: number, unit: string): number => {
	switch (unit) {
		case `mi`:
			return distance * 1609.34;
		case `yd`:
			return distance / 1.094;
		case `ft`:
			return distance / 3.281;
		case `km`:
			return distance * 1000;
		case `cm`:
			return distance / 100;
		case `mm`:
			return distance / 1000;
		// https://en.wikipedia.org/wiki/Nautical_mile
		case `nmi`:
			return distance * 1852;
		default:
			return distance;
	}
};

// TODO set return type
//
// Target remains $search for geo query as well
// ref: https://docs.atlas.mongodb.com/reference/atlas-search/geoWithin/
export const getGeoQuery = (query: RSQuery): any => {
	const val = query.value;
	let loc = [];
	if (typeof val !== `object` || !val.location) {
		throw new Error(`Invalid object`);
	}

	if (typeof val.location === `string`) {
		const data = `${val.location}`.split(`,`);
		if (data.length !== 2) {
			throw new Error(`Invalid location`);
		}

		loc.push(parseFloat(data[0]));
		loc.push(parseFloat(data[1]));
	}

	if (Array.isArray(val.location)) {
		if (val.length !== 2) {
			throw new Error(`Invalid location`);
		}
		loc = val;
	}

	if (
		typeof val.location === `object` &&
		val.location.lat &&
		val.location.long
	) {
		loc = [val.location.lat, val.location.long];
	}

	if (isNaN(loc[0])) {
		throw new Error(`Invalid lat`);
	}
	if (isNaN(loc[1])) {
		throw new Error(`Invalid long`);
	}

	loc[0] = parseFloat(loc[0]);
	loc[1] = parseFloat(loc[1]);
	val.location = loc;

	if (!val.distance || isNaN(val.distance)) {
		throw new Error(`Distance is required in value`);
	}

	if (!val.unit) {
		val.unit = `m`;
	}

	if (!UNITS.includes(val.unit)) {
		throw new Error(`${val.unit} is not supported`);
	}

	if (val.unit !== `m`) {
		// convert data to meter as mongo only supports meter
		val.distance = convertToMeter(val.distance, val.unit);
	}

	const search: any = {
		geoWithin: {
			circle: {
				center: {
					type: 'Point',
					coordinates: val.location,
				},
				radius: val.distance,
			},
			path: query.dataField,
		},
	};

	if (query.index) {
		search.index = query.index;
	}

	return {
		$search: search,
	};
};
