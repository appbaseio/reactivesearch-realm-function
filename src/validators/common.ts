import { SingleDataField } from 'src/types/types';

export const validateSingleDataField = (field: SingleDataField) => {
	if (typeof field !== 'string' && !Array.isArray(field)) {
		throw new Error(`invalid dataField value`);
	}

	if (Array.isArray(field) && field.length > 1) {
		throw new Error(`only one dataField is allowed`);
	}
};
