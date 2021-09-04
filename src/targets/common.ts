import { ALL_FIELDS, EXCLUDE_FIELD, INCLUDE_FIELD } from '../constants';

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
