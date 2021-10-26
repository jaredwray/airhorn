import {Ecto} from 'ecto';
import {Config} from './config';

export class Template {
	config = new Config();
	ecto = new Ecto();
	name = '';
	filePath = '';
	language = 'en'; // Default to en

	constructor(filePath?: string) {
		if (filePath !== undefined) {
			this.filePath = filePath;
		}
	}

	public getFileName(): string {
		let result = '';

		if (this.filePath !== undefined) {
			const name = this.filePath.split('/').pop();
			if (name !== undefined) {
				result = name;
			}
		}

		return result;
	}

	public async render(): Promise<string> {
		return '';
	}
}
