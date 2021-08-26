import { RSQuery, GeoPoint, GeoInput } from 'src/types';

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

const convertLocation = (location: GeoPoint | string | [number, number]) => {
	let loc: [number, number] = [0, 0];
	if (typeof location === `string`) {
		const data = `${location}`.split(`,`);
		if (data.length !== 2) {
			throw new Error(`Invalid location`);
		}

		loc[0] = parseFloat(data[0]);
		loc[1] = parseFloat(data[1]);
	} else if (Array.isArray(location)) {
		if (location.length !== 2) {
			throw new Error(`Invalid location`);
		}
		loc = location;
	} else {
		loc = [location.lat, location.long];
	}

	if (isNaN(loc[0])) {
		throw new Error(`Invalid lat`);
	}
	if (isNaN(loc[1])) {
		throw new Error(`Invalid long`);
	}

	loc[0] = parseFloat(`${loc[0]}`);
	loc[1] = parseFloat(`${loc[1]}`);

	return loc;
};

// TODO set return type
//
// Target remains $search for geo query as well
// ref: https://docs.atlas.mongodb.com/reference/atlas-search/geoWithin/
export const getGeoQuery = (query: RSQuery): any => {
	try {
		const val = <GeoInput>{ ...query.value };
		let search: any = {};
		if (!val.location && !val.geoBoundingBox) {
			throw new Error(`Invalid object`);
		}

		// geo point query
		if (val.location) {
			val.location = convertLocation(val.location);

			if (!val.distance || isNaN(val.distance)) {
				throw new Error(`Distance is required in value`);
			}

			if (!val.unit) {
				val.unit = `m`;
			}

			if (val.unit !== `m`) {
				// convert data to meter as mongo only supports meter
				val.distance = convertToMeter(val.distance, val.unit);
			}

			search = {
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
		}

		// geo bounding box query
		if (val.geoBoundingBox) {
			// mongo geo bounding accepts bottomRight and topLeft
			// following is the conversion
			/**
			 * topLeft: {x1,y1}
				bottomRight: {x2,y2}

				topRight: {x2,y1}
				bottomLeft: {x1,y2}
			 */
			const bottomRight = convertLocation(val.geoBoundingBox.bottomRight);
			const topLeft = convertLocation(val.geoBoundingBox.topLeft);
			search = {
				geoWithin: {
					box: {
						bottomLeft: {
							type: 'Point',
							coordinates: [topLeft[0], bottomRight[1]],
						},
						topRight: {
							type: 'Point',
							coordinates: [bottomRight[0], topLeft[1]],
						},
					},
					path: query.dataField,
				},
			};
		}

		if (query.index) {
			search.index = query.index;
		}

		return {
			$search: search,
		};
	} catch (err) {
		throw err;
	}
};
