/* eslint-disable @typescript-eslint/no-empty-function,@typescript-eslint/class-literal-property-style  */
import { PubSub } from '@google-cloud/pubsub';
import { type AirhornNotification } from '../notification.js';
import { type AirhornQueueProvider } from '../queue.js';

export class GooglePubSubQueue implements AirhornQueueProvider {
	private readonly _name: string;
	private readonly _uri: string;
	private readonly _topicName: string;
	private readonly _pubsub: PubSub;
	private _topicCreated = false;
	private readonly _projectId = 'airhorn-project';

	constructor() {
		this._name = 'google-pubsub';
		this._uri = 'google-pubsub://localhost';
		this._topicName = 'airhorn-delivery-queue';

		this._pubsub = new PubSub({ projectId: this._projectId });
	}

	get name(): string {
		return this._name;
	}

	get uri(): string {
		return this._uri;
	}

	get topicName(): string {
		return this._topicName;
	}

	get topicCreated(): boolean {
		return this._topicCreated;
	}

	async topicExists(): Promise<boolean> {
		let result = false;
		try {
			const topic = this._pubsub.topic(this.topicName);
			const exists = await topic.exists();
			if (exists.length > 0) {
				result = exists[0];
			}
		} catch {
			/* c8 ignore next 2 */
			result = false;
		}

		return result;
	}

	async getTopic() {
		return this._pubsub.topic(this.topicName);
	}

	async publishNotification(notification: AirhornNotification): Promise<void> {}

	async acknowledgeNotification(notification: AirhornNotification): Promise<void> {}

	async listenForNotifications(queueName: string, callback: (notification: AirhornNotification) => void): Promise<void> {}

	async createTopic(): Promise<void> {
		if (this._topicCreated) {
			return;
		}

		const topicExists = await this.topicExists();
		if (topicExists) {
			this._topicCreated = true;
		} else {
			await this._pubsub.createTopic(this._topicName);
			this._topicCreated = true;
		}
	}
}
