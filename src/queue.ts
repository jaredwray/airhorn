
export enum AirhornQueueType {
	DELIVER = 'DELIVER',
	PUBLISH = 'PUBLISH',
}

export type AirhornQueueProvider = {
	name: string;
	uri: string;
};

export type AirhornQueueOptions = {
	provider: AirhornQueueProvider;
	type: AirhornQueueType;
};

export class AirhornQueue {
	public provider: AirhornQueueProvider;
	public type: AirhornQueueType;

	constructor(options: AirhornQueueOptions) {
		this.provider = options.provider;
		this.type = options.type;
	}
}
