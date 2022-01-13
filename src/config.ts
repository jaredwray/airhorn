/* eslint-disable node/prefer-global/process */
export class Config {
	TEMPLATE_PATH = './templates';
	DEFAULT_TEMPLATE_LANGUAGE = 'en';
	ENVIRONMENT = 'development';

	TWILIO_SMS_ACCOUNT_SID = '';
	TWILIO_SMS_AUTH_TOKEN = '';
	TWILIO_SENDGRID_API_KEY = '';
	AWS_SES_REGION = '';
	AWS_SMS_REGION = '';

	constructor(options?: any) {
		if (options) {
			this.parse(options);
		}

		/* Set the node environment */
		if (process.env.NODE_ENV !== 'undefined' && process.env.NODE_ENV !== undefined) {
			this.ENVIRONMENT = process.env.NODE_ENV;
		}
	}

	parse(options: any) {
		this.TEMPLATE_PATH = this.getValueFromOptionsOrEnv(options, 'TEMPLATE_PATH', this.TEMPLATE_PATH);

		this.DEFAULT_TEMPLATE_LANGUAGE = this.getValueFromOptionsOrEnv(options, 'DEFAULT_TEMPLATE_LANGUAGE', this.DEFAULT_TEMPLATE_LANGUAGE);

		this.TWILIO_SMS_ACCOUNT_SID = this.getValueFromOptionsOrEnv(options, 'TWILIO_SMS_ACCOUNT_SID', this.TWILIO_SMS_ACCOUNT_SID);

		this.TWILIO_SMS_AUTH_TOKEN = this.getValueFromOptionsOrEnv(options, 'TWILIO_SMS_AUTH_TOKEN', this.TWILIO_SMS_AUTH_TOKEN);

		this.TWILIO_SENDGRID_API_KEY = this.getValueFromOptionsOrEnv(options, 'TWILIO_SENDGRID_API_KEY', this.TWILIO_SENDGRID_API_KEY);

		this.AWS_SES_REGION = this.getValueFromOptionsOrEnv(options, 'AWS_SES_REGION', this.AWS_SES_REGION);

		this.AWS_SMS_REGION = this.getValueFromOptionsOrEnv(options, 'AWS_SMS_REGION', this.AWS_SMS_REGION);
	}

	public cleanValue(value?: string) {
		if (value) {
			return value.toString().trim();
		}

		return '';
	}

	public getValueFromOptionsOrEnv(options: any, env: string, defaultValue: string): string {
		if (options[env]) {
			return this.cleanValue(options[env]);
		}

		if (process.env[env]) {
			return this.cleanValue(process.env[env]);
		}

		return defaultValue;
	}
}
