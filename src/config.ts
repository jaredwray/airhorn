/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
export class Config {
	templatePath = './templates';
	defaultTemplateLanguage = 'en';

	constructor(options?: any) {
		if (options) {
			this.parse(options);
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
