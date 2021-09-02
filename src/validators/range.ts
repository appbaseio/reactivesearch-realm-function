import { RangeValue } from 'src/types';

export const validateRangeValue = (value?: RangeValue) => {
	if (value) {
		if (value.start === undefined && value.end === undefined) {
			throw new Error(`invalid data`);
		}

		if (typeof value.start !== 'string' && typeof value.start !== 'number') {
			throw new Error(`invalid start value`);
		}

		if (typeof value.end !== 'string' && typeof value.end !== 'number') {
			throw new Error(`invalid end value`);
		}

		if (value.boost && typeof value.boost !== 'number') {
			throw new Error(`invalid boost value`);
		}
	}
};
