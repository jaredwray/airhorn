
export class TemplateText {
	text = '';
	format = '';
	language = '';

	constructor(text?: string, format?: string, language?: string) {
		if (text !== undefined) {
			this.text = text;
		}

		if (format !== undefined) {
			this.format = format;
		}

		if (language !== undefined) {
			this.language = language;
		}
	}
}
