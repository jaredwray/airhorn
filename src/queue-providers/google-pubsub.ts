/* eslint-disable @typescript-eslint/class-literal-property-style  */
import { PubSub } from '@google-cloud/pubsub';
import { type AirhornNotification } from '../notification.js';
import { type AirhornQueueProvider } from '../queue.js';

export class GooglePubSubQueue implements AirhornQueueProvider {
	private readonly _name: string;
	private readonly _uri: string;
	private readonly _topicName: string;
	private readonly _subscriptionName: string;
	private readonly _pubsub: PubSub;
	private _topicCreated = false;
	private readonly _projectId = 'airhorn-project';

	constructor() {
		this._name = 'google-pubsub';
		this._uri = 'google-pubsub://localhost';
		this._topicName = 'airhorn-delivery-queue';
		this._subscriptionName = this._topicName + '-subscription';

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

	async publish(notification: AirhornNotification): Promise<void> {
		await this.createTopic();
		const topic = await this.getTopic();
		const data = Buffer.from(JSON.stringify({ message: 'Hello, Pub/Sub emulator!' }));
		const publishId = await topic.publishMessage({ data });
		console.log(`Message published with ID: ${publishId} to topic: ${topic.name}`);
	}

	async subscribe(callback: (notification: AirhornNotification, acknowledge: () => void) => void): Promise<void> {
		await this.createTopic();
		const topic = await this.getTopic();
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
				const airhornNotification = JSON.parse(message.data.toString());
				console.log('Received message:', message);
				const acknowledge = () => {
					message.ack();
				};

				// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
				callback(airhornNotification, acknowledge);
			});
		}
	}

	async clearSubscription(): Promise<void> {
		const topic = await this.getTopic();
		const subscription = topic.subscription(this._subscriptionName);

		const [exists] = await subscription.exists();
		if (exists) {
			await subscription.close();
		}
	}

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
