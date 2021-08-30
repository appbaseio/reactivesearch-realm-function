export const validateSingleDataField = (field: string | string[]): void => {
	if (Array.isArray(field) && field.length > 1) {
		throw new Error(`only one data field is allowed`);
	}
};
