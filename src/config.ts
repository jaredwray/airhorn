/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable node/prefer-global/process */
export class Config {
	templatePath = './templates';
	defaultTemplateLanguage = 'en';
	environment = 'development';

	constructor(options?: any) {
		if (options) {
			this.parse(options);
		}

		/* Set the node environment */
		if (process.env.NODE_ENV !== undefined) {
			this.environment = process.env.NODE_ENV;
		}
	}

	parse(options: any) {
		if (options.templatePath) {
			this.templatePath = options.templatePath.toString();
		}

		if (options.defaultTemplateLanguage) {
			this.defaultTemplateLanguage = options.defaultTemplateLanguage.toString();
		}
	}
}
