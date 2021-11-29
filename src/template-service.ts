import * as fs from 'fs-extra';
import {Config} from './config';
import {Template} from './template';
import * as logger from './logger';

const log = logger.create();

export class TemplateService {
	config = new Config();
	templates = new Array<Template>();

	constructor(options?: any) {
		this.config = new Config(options);
		this.loadTemplates();
	}

	public loadTemplates() {
		if (fs.pathExistsSync(this.config.TEMPLATE_PATH)) {
			const templateDirs = fs.readdirSync(this.config.TEMPLATE_PATH);

			for (const templateDirPath of templateDirs) {
				const template = new Template(this.config.TEMPLATE_PATH + '/' + templateDirPath);

				this.templates.push(template);
			}
		} else {
			log.error('The template path does not exist: ' + this.config.TEMPLATE_PATH);
		}
	}

	public getTemplate(templateName: string): Template | undefined {
		for (const template of this.templates) {
			if (template.name === templateName) {
				return template;
			}
		}

		return undefined;
	}
}
