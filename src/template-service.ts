import { CacheableMemory } from 'cacheable';
import { type AirhornTemplate } from './template.js';

export class AirhornTemplateService {
	private readonly _cache = new CacheableMemory();

	public get(templateName: string): AirhornTemplate | undefined {
		return this._cache.get<AirhornTemplate>(templateName);
	}
}
