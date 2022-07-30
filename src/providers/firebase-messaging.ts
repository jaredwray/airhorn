/* eslint-disable n/file-extension-in-import */
import firebase, { ServiceAccount } from 'firebase-admin';
import {Message} from 'firebase-admin/messaging';
import {ProviderInterface} from '../provider-interface.js';
import {ProviderType} from '../provider-type.js';

export class FirebaseMessaging implements ProviderInterface {
	client: firebase.messaging.Messaging | undefined;
	name = 'firebase-messaging';
	type = ProviderType.MOBILE_PUSH;

	private readonly cert: string | ServiceAccount;

	constructor(cert: string | ServiceAccount) {
		this.cert = cert;

		if (firebase.apps.length === 0) {
			firebase.initializeApp({
				credential: firebase.credential.cert(this.cert),
			});
			this.client = firebase.messaging();
		}
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

		if (this.client) {
			await this.client.send(parameters);
			return true;
		}

		return false;
	}
}
