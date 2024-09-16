/* eslint-disable @typescript-eslint/class-literal-property-style  */
import { PubSub } from '@google-cloud/pubsub';
import { type AirhornNotification } from '../notification.js';
import { type AirhornQueueProvider } from '../queue.js';

export class GooglePubSubQueueOptions {
	projectId?: string;
	uri?: string;
	queueName?: string;
	subscriptionName?: string;
}

export class GooglePubSubQueue {
	private readonly _name: string = 'google-pubsub';
	private readonly _uri = 'google-pubsub://localhost';
	private readonly _queueName = 'airhorn-queue';
	private readonly _subscriptionName = 'airhorn-subscription';
	private readonly _pubsub: PubSub;

	private readonly _projectId = 'airhorn-project';

	constructor(options?: GooglePubSubQueueOptions) {
		if (options?.projectId) {
			this._projectId = options.projectId;
		}

		if (options?.uri) {
			this._uri = options.uri;
		}

		if (options?.queueName) {
			this._queueName = options.queueName;
		}

		if (options?.subscriptionName) {
			this._subscriptionName = options.subscriptionName;
		}

		this._pubsub = new PubSub({ projectId: this._projectId });
	}

	get name(): string {
		return this._name;
	}

	get uri(): string {
		return this._uri;
	}

	get queueName(): string {
		return this._queueName;
	}

	get subscriptionName(): string {
		return this._subscriptionName;
	}

	get projectId(): string {
		return this._projectId;
	}

	async queueExists(): Promise<boolean> {
		let result = false;
		try {
			const topic = this._pubsub.topic(this._queueName);
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

	async getQueue() {
		return this._pubsub.topic(this._queueName);
	}

	async publish(notification: AirhornNotification): Promise<void> {
		await this.setQueue();
		const topic = await this.getQueue();
		const data = Buffer.from(JSON.stringify(notification));
		await topic.publishMessage({ data });
	}

	async subscribe(callback: (notification: AirhornNotification, acknowledge: () => void) => void): Promise<void> {
		await this.setQueue();
		const topic = await this.getQueue();
		let subscription = topic.subscription(this._subscriptionName);

		const [exists] = await subscription.exists();
		if (!exists) {
			await topic.createSubscription(this._subscriptionName, {
				retryPolicy: {
					minimumBackoff: {
						seconds: 60,
					},
					maximumBackoff: {
						seconds: 600,
					},
				},
			});

			subscription = topic.subscription(this._subscriptionName);
		}

		const listeners = subscription.listenerCount('message');
		if (listeners === 0) {
			subscription.on('message', message => {
				const airhornNotification = JSON.parse(message.data.toString()) as AirhornNotification;
				const acknowledge = () => {
					message.ack();
				};

				callback(airhornNotification, acknowledge);
			});
		}
	}

	async clearSubscription(): Promise<void> {
		const topic = await this.getQueue();
		const subscription = topic.subscription(this._subscriptionName);

		const [exists] = await subscription.exists();
		if (exists) {
			await subscription.close();
			await subscription.delete();
		}
	}

	async deleteQueue(): Promise<void> {
		const topic = await this.getQueue();
		const [subscriptions] = await topic.getSubscriptions();
		await Promise.all(subscriptions.map(async subscription => {
			await subscription.delete();
		}));
		await topic.delete();
	}

	async setQueue(): Promise<void> {
		const topicExists = await this.queueExists();
		if (!topicExists) {
			await this._pubsub.createTopic(this._queueName);
		}
	}
}
