import { type AirhornTemplate } from './template.js';
import { type AirhornStore } from './store.js';

export class AirhornTemplateService {
	private readonly _store: AirhornStore;

	constructor(store: AirhornStore) {
		this._store = store;
	}

	public get store(): AirhornStore {
		return this._store;
	}

	public async get(templateName: string): Promise<AirhornTemplate | undefined> {
		const template = await this._store.getTemplateById(templateName);

		return template;
	}
}
