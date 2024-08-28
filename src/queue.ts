import { type AirhornNotification } from './notification.js';

export type AirhornQueueProvider = {
	name: string;
	uri: string;
	createQueue(queueName: string): Promise<void>;
	queueExists(queueName: string): Promise<boolean>;
	deleteQueue(queueName: string): Promise<void>;
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
}
