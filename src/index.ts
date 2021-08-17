export type ConfigType = {
	url: string;
};

export class Realm {
	config: ConfigType;

	constructor(config: ConfigType) {
		this.config = config;
	}
}
