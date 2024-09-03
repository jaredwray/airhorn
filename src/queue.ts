import { type AirhornNotification } from './notification.js';

export type AirhornQueueProvider = {
	name: string;
	uri: string;
	publishNotification(notification: AirhornNotification): Promise<void>;
	acknowledgeNotification(notification: AirhornNotification): Promise<void>;
	listenForNotifications(queueName: string, callback: (notification: AirhornNotification) => void): Promise<void>;
};

export type AirhornQueueOptions = {
	provider: AirhornQueueProvider;
};

export class AirhornQueue {
	public provider: AirhornQueueProvider;

	constructor(options: AirhornQueueOptions) {
		this.provider = options.provider;
	}

	public async publishNotification(notification: AirhornNotification) {
		await this.provider.publishNotification(notification);
	}

	public async acknowledgeNotification(notification: AirhornNotification) {
		await this.provider.acknowledgeNotification(notification);
	}

	public async listenForNotifications(queueName: string, callback: (notification: AirhornNotification) => void) {
		await this.provider.listenForNotifications(queueName, callback);
	}
}
