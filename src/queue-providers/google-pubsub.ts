/* eslint-disable @typescript-eslint/class-literal-property-style  */
import { PubSub } from '@google-cloud/pubsub';
import { type AirhornNotification } from '../notification.js';
import { type AirhornQueueProvider } from '../queue.js';

export type GooglePubSubQueueOptions = {
	projectId?: string;
	uri?: string;
	queueName?: string;
	subscriptionName?: string;
};

export class GooglePubSubQueue {
	private readonly _name: string = 'google-pubsub';
	private _uri = 'google-pubsub://localhost';
	private _queueName = 'airhorn-queue';
	private _subscriptionName = 'airhorn-subscription';
	private readonly _pubsub: PubSub;

	private _projectId = 'airhorn-project';

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

	set uri(value: string) {
		this._uri = value;
	}

	get queueName(): string {
		return this._queueName;
	}

	set queueName(value: string) {
		this._queueName = value;
	}

	get subscriptionName(): string {
		return this._subscriptionName;
	}

	set subscriptionName(value: string) {
		this._subscriptionName = value;
	}

	get projectId(): string {
		return this._projectId;
	}

	set projectId(value: string) {
		this._projectId = value;
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
		try {
			const queueExists = await this.queueExists();
			if (!queueExists) {
				await this.setQueue();
			}
			const subscriptionExists = await this.subscriptionExists();
			if (!subscriptionExists) {
				const topic = await this.getQueue();
				await topic.createSubscription(this._subscriptionName);
			}
			const topic = await this.getQueue();
			const subscription = topic.subscription(this._subscriptionName);
			subscription.on('message', async message => {
				const notification = JSON.parse(message.data.toString());
				const acknowledge = () => {
					message.ack();
				};
				callback(notification, acknowledge);
			});
		} catch (error) {
			/* c8 ignore next */
			console.error('Error creating subscription', error);
		}
	}

	async subscriptionExists(): Promise<boolean> {
		let result = false;
		try {
			const topic = await this.getQueue();
			if (topic) {
				const subscription = topic.subscription(this._subscriptionName);
				const exists = await subscription.exists();
				if (exists.length > 0) {
					result = exists[0];
				}
			}
		} catch {
			/* c8 ignore next 2 */
			result = false;
		}

		return result;
	}

	async unsubscribe(): Promise<void> {
		const topic = await this.getQueue();
		const subscription = topic.subscription(this._subscriptionName);

		const [exists] = await subscription.exists();
		if (exists) {
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
