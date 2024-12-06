/* eslint-disable unicorn/no-negated-condition */
import firebase, {type ServiceAccount} from 'firebase-admin';
import type {ProviderInterface} from '../provider-service.js';
import {AirhornProviderType} from '../provider-type.js';

export class FirebaseMessaging implements ProviderInterface {
	client: firebase.messaging.Messaging | undefined;
	name = 'firebase-messaging';
	type = AirhornProviderType.MOBILE_PUSH;

	// eslint-disable-next-line @typescript-eslint/parameter-properties
	cert: string;

	constructor(cert: string) {
		this.cert = cert;

		if (firebase.apps.length === 0) {
			const certSource = !this.cert.endsWith('.json') ? JSON.parse(this.cert) as ServiceAccount : this.cert;

			firebase.initializeApp({
				credential: firebase.credential.cert(certSource),
			});
			this.client = firebase.messaging();
		}
	}

	public async send(to: string, from: string, message: string) {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		const {title, body} = JSON.parse(message);

		const parameters: firebase.messaging.Message = {
			notification: {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
				title,
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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
