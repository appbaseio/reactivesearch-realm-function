import {
	ALL_FIELDS,
	EXCLUDE_FIELD,
	FUZZINESS_AUTO,
	INCLUDE_FIELD,
} from '../constants';

import { RSQuery } from 'src/types/types';

export const getIncludeExcludeFields = (query: RSQuery<any>): any[] => {
	let { includeFields = [], excludeFields = [] } = query;

	if (excludeFields.includes(ALL_FIELDS)) {
		return [
			{
				$project: {
					_0923biu3g4h: INCLUDE_FIELD,
				},
			},
		];
	}

	if (includeFields.includes(ALL_FIELDS)) {
		if (excludeFields.length === 0) {
			// Don't run the pipeline
			return [];
		} else {
			includeFields = includeFields.filter((item) => item !== ALL_FIELDS);
		}
	}

	const aggPipeline: any = [];

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
	aggPipeline.push({
		$project: { ...excludeAggregation, ...includeAggregation },
	});
	return aggPipeline;
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
