export type ConfigType = {
	url: string;
};

export class ReactiveSearchRealm {
	config: ConfigType;

	constructor(config: ConfigType) {
		this.config = config;
	}
}
