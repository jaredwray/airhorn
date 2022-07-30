import fs from 'fs-extra';
import {Config} from './config.js';
import {Template} from './template.js';
import * as logger from './logger.js';

const log = logger.create();

export class TemplateService {
	config = new Config();
	templates = new Array<Template>();

	constructor(options?: any) {
		this.config = new Config(options);
		this.loadTemplates();
	}

	public loadTemplates() {
		this.templates = new Array<Template>();
		if (fs.pathExistsSync(this.config.TEMPLATE_PATH)) {
			const templateDirs = fs.readdirSync(this.config.TEMPLATE_PATH);

			for (const templateDirPath of templateDirs) {
				const templatePath = `${String(this.config.TEMPLATE_PATH)}/${String(templateDirPath)}`;
				const template = new Template(templatePath);

				this.templates.push(template);
			}
		} else {
			log.error(`The template path does not exist: ${String(this.config.TEMPLATE_PATH)}`);
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
