/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import * as firebase from 'firebase-admin';
import {Message} from 'firebase-admin/messaging';
import {ProviderInterface} from '../provider-interface';
import {ProviderType} from '../provider-type';

export class FirebaseMessaging implements ProviderInterface {
	client: firebase.messaging.Messaging;
	name = 'firebase-messaging';
	type = ProviderType.MOBILE_PUSH;

	private readonly cert: string;

	constructor(cert: string) {
		this.cert = cert;
		firebase.initializeApp({
			credential: firebase.credential.cert(JSON.parse(this.cert)),
		});
		this.client = firebase.messaging();
	}

	public async send(to: string, from: string, message: string) {
		const {title, body} = JSON.parse(message);

		const parameters: Message = {
			notification: {
				title,
				body,
			},
			token: to,
		};

		await this.client.send(parameters);
		return true;
	}
}
