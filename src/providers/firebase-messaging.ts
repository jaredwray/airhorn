import * as firebase from 'firebase-admin';
import {ProviderInterface} from '../provider-interface';
import {ProviderType} from '../provider-type';

export class FirebaseMessaging implements ProviderInterface {
	client: firebase.messaging.Messaging;
	name = 'firebase-messaging';
	type = ProviderType.MOBILE_PUSH;

	private readonly certPath: string;

	constructor(certPath: string) {
		this.certPath = certPath;
		firebase.initializeApp({
			credential: firebase.credential.cert(this.certPath),
		});
		this.client = firebase.messaging();
	}

	public async send(to: string, from: string, message: string, subject?: string) {
		const notification = JSON.parse(message);

		const params = {
			notification,
			token: to
		}

		/*{
			title: subject,
				body: message,
		},*/

		await this.client.send(params);
		return true;
	}
}
