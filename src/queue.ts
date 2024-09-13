import { type AirhornNotification } from './notification.js';

export type AirhornQueueProvider = {
	name: string;
	uri: string;
	publish(notification: AirhornNotification): Promise<void>;
	subscribe(callback: (notification: AirhornNotification, acknowledge: () => void) => void): Promise<void>;
	clearSubscription(): Promise<void>;
};

export class AirhornQueue {
	public provider: AirhornQueueProvider;

	constructor(provider: AirhornQueueProvider) {
		this.provider = provider;
	}

	public async publishNotification(notification: AirhornNotification) {
		await this.provider.publish(notification);
	}

	public async subscribe(callback: (notification: AirhornNotification, acknowledge: () => void) => void) {
		await this.provider.subscribe(callback);
	}

	public async clearSubscription() {
		await this.provider.clearSubscription();
	}
}
