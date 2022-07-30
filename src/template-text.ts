export class TemplateText {
	text = '';
	format = '';
	language = '';
	properties = new Map<string, string>();

	constructor(text?: string, format?: string, language?: string, properties?: any) {
		if (text !== undefined) {
			this.text = text;
		}

		if (format !== undefined) {
			this.format = format;
		}

		if (language !== undefined) {
			this.language = language;
		}

		if (properties !== undefined) {
			for (const key in properties) {
				if (properties[key] !== undefined) {
					this.properties.set(key, properties[key].toString());
				}
			}
		}
	}
}
