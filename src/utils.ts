const nativeCeil = Math.ceil,
	nativeMax = Math.max;

export const range = (
	start: number,
	end: number,
	step: number = 1,
	fromRight?: boolean,
): number[] => {
	var index = -1,
		length = nativeMax(nativeCeil((end - start) / (step || 1)), 0),
		result = Array(length);

	while (length--) {
		result[fromRight ? length : ++index] = start;
		start += step;
	}
	return result;
};
