import firebase, { type ServiceAccount } from "firebase-admin";
import type { ProviderInterface } from "../provider-service.js";
import { AirhornProviderType } from "../provider-type.js";

export class FirebaseMessaging implements ProviderInterface {
	client: firebase.messaging.Messaging | undefined;
	name = "firebase-messaging";
	type = AirhornProviderType.MOBILE_PUSH;

	cert: string;

	constructor(cert: string) {
		this.cert = cert;

		if (firebase.apps.length === 0) {
			/* c8 ignore start */
			const certSource = !this.cert.endsWith(".json")
				? (JSON.parse(this.cert) as ServiceAccount)
				: this.cert;
			/* c8 ignore end */

			firebase.initializeApp({
				credential: firebase.credential.cert(certSource),
			});
			this.client = firebase.messaging();
		}
	}

	// biome-ignore lint/correctness/noUnusedFunctionParameters: allowing unused parameters for firebase
	public async send(to: string, from: string, message: string) {
		const { title, body } = JSON.parse(message);

		const parameters: firebase.messaging.Message = {
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
