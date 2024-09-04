import type { ProviderInterface } from './provider-interface.js';
import { AirhornProviderType } from './provider-type.js';
import { WebHook } from './providers/webhook.js';
import { TwilioSMS } from './providers/twilio-sms.js';
import { TwilioSendgrid } from './providers/twilio-sendgrid.js';
import { AWSSES } from './providers/aws-ses.js';
import { AWSSMS } from './providers/aws-sms.js';
import { FirebaseMessaging } from './providers/firebase-messaging.js';
import { AWSSNS } from './providers/aws-sns.js';
import { type AirhornOptions } from './airhorn.js';

export class ProviderService {
	options: AirhornOptions = {};
	private readonly _providers = new Array<ProviderInterface>();

	constructor(options?: any) {
		if (options) {
			this.options = { ...this.options, ...options };
		}

		this.loadProviders();
	}

	public get providers(): ProviderInterface[] {
		return this._providers;
	}

	public get sms(): ProviderInterface[] {
		return this.getProviderByType(AirhornProviderType.SMS);
	}

	public get smtp(): ProviderInterface[] {
		return this.getProviderByType(AirhornProviderType.SMTP);
	}

	public get webhook(): ProviderInterface[] {
		return this.getProviderByType(AirhornProviderType.WEBHOOK);
	}

	public get mobilePush(): ProviderInterface[] {
		return this.getProviderByType(AirhornProviderType.MOBILE_PUSH);
	}

	public getProviderByType(type: AirhornProviderType): ProviderInterface[] {
		let result: ProviderInterface[] = [];
		const provider = this._providers.filter(provider => provider.type === type);

		if (provider.length > 0) {
			result = provider;
		}

		return result;
	}

	public removeProvider(name: string) {
		const index = this._providers.findIndex(provider => provider.name === name);

		if (index > -1) {
			this._providers.splice(index, 1);
		}
	}

	public addProvider(provider: ProviderInterface) {
		if (this.providerExists(provider.name)) {
			throw new Error(`Provider ${String(provider.name)} already exists`);
		} else {
			this._providers.push(provider);
		}
	}

	public providerExists(name: string): boolean {
		return this.getProvider(name) !== undefined;
	}

	public updateProvider(provider: ProviderInterface) {
		if (this.providerExists(provider.name)) {
			this.removeProvider(provider.name);
		}

		this.addProvider(provider);
	}

	public getProvider(name: string): ProviderInterface | undefined {
		let result: ProviderInterface | undefined;

		for (const provider of this._providers) {
			if (provider.name === name) {
				result = provider;
				break;
			}
		}

		return result;
	}

	public loadProviders() {
		this._providers.push(new WebHook());

		if (this.options.TWILIO_SMS_ACCOUNT_SID !== undefined && this.options.TWILIO_SMS_AUTH_TOKEN !== undefined) {
			this._providers.push(new TwilioSMS(this.options.TWILIO_SMS_ACCOUNT_SID, this.options.TWILIO_SMS_AUTH_TOKEN));
		}

		if (this.options.TWILIO_SENDGRID_API_KEY) {
			this._providers.push(new TwilioSendgrid(this.options.TWILIO_SENDGRID_API_KEY));
		}

		if (this.options.AWS_SES_REGION) {
			this._providers.push(new AWSSES(this.options.AWS_SES_REGION));
		}

		if (this.options.AWS_SMS_REGION) {
			this._providers.push(new AWSSMS(this.options.AWS_SMS_REGION));
		}

		if (this.options.AWS_SNS_REGION) {
			this._providers.push(new AWSSNS(this.options.AWS_SNS_REGION));
		}

		if (this.options.FIREBASE_CERT) {
			this._providers.push(new FirebaseMessaging(this.options.FIREBASE_CERT));
		}
	}
}
