/* eslint-disable node/prefer-global/process */
export class Config {
	TEMPLATE_PATH = './templates';
	DEFAULT_TEMPLATE_LANGUAGE = 'en';
	ENVIRONMENT = 'development';

	TWILIO_SMS_ACCOUNT_SID = '';
	TWILIO_SMS_AUTH_TOKEN = '';
	TWILIO_SENDGRID_API_KEY = '';
	AWS_SES_REGION = '';

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
		if (options.TEMPLATE_PATH) {
			this.TEMPLATE_PATH = this.cleanValue(options.TEMPLATE_PATH);
		}

		if (options.DEFAULT_TEMPLATE_LANGUAGE) {
			this.DEFAULT_TEMPLATE_LANGUAGE = this.cleanValue(options.DEFAULT_TEMPLATE_LANGUAGE);
		}

		if (options.TWILIO_SMS_ACCOUNT_SID) {
			this.TWILIO_SMS_ACCOUNT_SID = this.cleanValue(options.TWILIO_SMS_ACCOUNT_SID);
		} else if (process.env.TWILIO_SMS_ACCOUNT_SID) {
			this.TWILIO_SMS_ACCOUNT_SID = process.env.TWILIO_SMS_ACCOUNT_SID;
		}

		if (options.TWILIO_SMS_AUTH_TOKEN) {
			this.TWILIO_SMS_AUTH_TOKEN = this.cleanValue(options.TWILIO_SMS_AUTH_TOKEN);
		} else if (process.env.TWILIO_SMS_AUTH_TOKEN) {
			this.TWILIO_SMS_AUTH_TOKEN = process.env.TWILIO_SMS_AUTH_TOKEN;
		}

		if (options.TWILIO_SENDGRID_API_KEY) {
			this.TWILIO_SENDGRID_API_KEY = this.cleanValue(options.TWILIO_SENDGRID_API_KEY);
		} else if (process.env.TWILIO_SENDGRID_API_KEY) {
			this.TWILIO_SENDGRID_API_KEY = process.env.TWILIO_SENDGRID_API_KEY;
		}

		if (options.AWS_SES_REGION) {
			this.AWS_SES_REGION = this.cleanValue(options.AWS_SES_REGION);
		} else if (process.env.AWS_SES_REGION) {
			this.AWS_SES_REGION = process.env.AWS_SES_REGION;
		}
	}

	private cleanValue(value: string) {
		return value.toString().trim();
	}
}
