import fs from 'fs-extra';
import {Options} from './options.js';
import {Template} from './template.js';
import * as logger from './logger.js';

const log = logger.create();

export class TemplateService {
	options = new Options();
	templates = new Array<Template>();

	constructor(options?: any) {
		this.options = new Options(options);
		this.loadTemplates();
	}

	public loadTemplates() {
		this.templates = new Array<Template>();
		if (fs.pathExistsSync(this.options.TEMPLATE_PATH)) {
			const templateDirs = fs.readdirSync(this.options.TEMPLATE_PATH);

			for (const templateDirPath of templateDirs) {
				const templatePath = `${String(this.options.TEMPLATE_PATH)}/${String(templateDirPath)}`;
				const template = new Template(templatePath);

				this.templates.push(template);
			}
		} else {
			log.error(`The template path does not exist: ${String(this.options.TEMPLATE_PATH)}`);
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
