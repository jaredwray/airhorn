import * as firebase from 'firebase-admin';
import {Message} from 'firebase-admin/messaging';
import {ProviderInterface} from '../provider.interface';
import {ProviderType} from '../provider-type';

export class FirebaseMessaging implements ProviderInterface {
	client: firebase.messaging.Messaging;
	name = 'firebase-messaging';
	type = ProviderType.MOBILE_PUSH;

	constructor(certPath: string) {
		firebase.initializeApp({
			credential: firebase.credential.cert(certPath),
		});
		this.client = firebase.messaging();
	}

	public async send(request: Message) {
		await this.client.send(request);
		return true;
	}
}
