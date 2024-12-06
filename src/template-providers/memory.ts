import {type AirhornTemplate} from '../template.js';
import {type AirhornTemplateProvider} from '../template-service.js';

export class MemoryTemplateProvider implements AirhornTemplateProvider {
	private _name = 'memory';
	private _uri = 'memory://localhost';
	private readonly _templates: Map<string, AirhornTemplate> = new Map<string, AirhornTemplate>();

	public get name(): string {
		return this._name;
	}

	public set name(value: string) {
		this._name = value;
	}

	public get uri(): string {
		return this._uri;
	}

	public set uri(value: string) {
		this._uri = value;
	}

	public generateId(): string {
		return Math.random().toString(36).slice(7);
	}

	async createTemplate(template: AirhornTemplate): Promise<AirhornTemplate> {
		this._templates.set(template.name, template);
		return template;
	}

	async updateTemplate(template: AirhornTemplate): Promise<AirhornTemplate> {
		this._templates.set(template.name, template);
		return template;
	}

	async deleteTemplateById(id: string): Promise<void> {
		this._templates.delete(id);
	}

	async getTemplates(): Promise<AirhornTemplate[]> {
		return [...this._templates.values()];
	}

	async getTemplateById(name: string): Promise<AirhornTemplate | undefined> {
		return this._templates.get(name);
	}
}
