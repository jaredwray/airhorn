import { Cacheable } from 'cacheable';
import { type AirhornTemplate } from './template.js';
import { type AirhornStore } from './store.js';

export class AirhornTemplateService {
	private readonly _cache = new Cacheable();
	private readonly _store: AirhornStore;

	constructor(store: AirhornStore) {
		this._store = store;
	}

	public async get(templateName: string): Promise<AirhornTemplate | undefined> {
		if (await this._cache.has(templateName)) {
			return this._cache.get(templateName);
		}

		const template = await this._store.getTemplateById(templateName);

		if (template) {
			await this._cache.set(templateName, template);
		}

		return template;
	}
}
