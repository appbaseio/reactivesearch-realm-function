import {
	ALL_FIELDS,
	EXCLUDE_FIELD,
	FUZZINESS_AUTO,
	INCLUDE_FIELD,
} from '../constants';

import { RSQuery } from 'src/types/types';

export const getIncludeExcludeFields = (query: RSQuery<any>): any => {
	let { includeFields = [], excludeFields = [] } = query;

	if (includeFields.length === 0 && excludeFields.length === 0) {
		return null;
	}

	if (excludeFields.includes(ALL_FIELDS)) {
		return {
			$project: {
				_0923biu3g4h: INCLUDE_FIELD,
			},
		};
	}

	if (includeFields.includes(ALL_FIELDS)) {
		if (excludeFields.length === 0) {
			// Don't run the pipeline
			return null;
		} else {
			includeFields = includeFields.filter((item) => item !== ALL_FIELDS);
		}
	}

	// Exclude pipeline should be run before include
	let excludeAggregation = {},
		includeAggregation = {};
	if (excludeFields.length > 0) {
		excludeAggregation = Object.assign(
			{},
			...Array.from(excludeFields, (field) => ({ [field]: EXCLUDE_FIELD })),
		);
	}

	if (includeFields.length > 0) {
		includeAggregation = Object.assign(
			{},
			...Array.from(includeFields, (field) => ({ [field]: INCLUDE_FIELD })),
		);
	}

	const res = {
		$project: { ...excludeAggregation, ...includeAggregation },
	};

	if (Object.keys(res).length) {
		return res;
	}

	return null;
};

export const getFuzziness = (
	query: RSQuery<string>,
):
	| {
			fuzzy: {
				maxEdits: number;
			};
	  }
	| {} => {
	const queryLength = query?.value?.length || 0;
	let fuzziness: string | number | undefined = query.fuzziness;

	if (fuzziness === undefined) {
		return {};
	}

	if (typeof fuzziness === 'string') {
		if (fuzziness.toUpperCase() === FUZZINESS_AUTO) {
			if (queryLength > 5) {
				fuzziness = 2;
			} else if (queryLength >= 3) {
				fuzziness = 1;
			} else {
				fuzziness = 0;
			}
		} else {
			return {};
		}
	}
	if (fuzziness > 2) {
		throw new Error("Fuzziness value can't be greater than 2");
	}
	return {
		fuzzy: {
			maxEdits: fuzziness,
		},
	};
};

test('getFuzziness when fuzziness is undefined', () => {
	const result = getFuzziness({
		value: 'query',
	});
	const expected = {};
	expect(result).toStrictEqual(expected);
});

test('getFuzziness when fuzziness is a string other than AUTO', () => {
	const result = getFuzziness({
		value: 'query',
		fuzziness: 'fuzziness',
	});
	const expected = {};
	expect(result).toStrictEqual(expected);
});

test('getFuzziness when fuzziness is a number', () => {
	const result = getFuzziness({
		value: 'query',
		fuzziness: 1,
	});
	const expected = {
		fuzzy: {
			maxEdits: 1,
		},
	};
	expect(result).toStrictEqual(expected);
});

test('getFuzziness when fuzziness is auto and query length is greater than 5', () => {
	const result = getFuzziness({
		value: '123456',
		fuzziness: 'AUTO',
	});
	const expected = {
		fuzzy: {
			maxEdits: 2,
		},
	};
	expect(result).toStrictEqual(expected);
});

test('getFuzziness when fuzziness is auto and query length is between 3 and 5', () => {
	const result = getFuzziness({
		value: '1234',
		fuzziness: 'AUTO',
	});
	const expected = {
		fuzzy: {
			maxEdits: 1,
		},
	};
	expect(result).toStrictEqual(expected);
});

test('getFuzziness when fuzziness is auto and query length is 3', () => {
	const result = getFuzziness({
		value: '123',
		fuzziness: 'AUTO',
	});
	const expected = {
		fuzzy: {
			maxEdits: 1,
		},
	};
	expect(result).toStrictEqual(expected);
});

test('getFuzziness when fuzziness is auto and query length is less than 3', () => {
	const result = getFuzziness({
		value: '12',
		fuzziness: 'AUTO',
	});
	const expected = {
		fuzzy: {
			maxEdits: 0,
		},
	};
	expect(result).toStrictEqual(expected);
});
