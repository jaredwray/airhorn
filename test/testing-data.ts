/* eslint-disable @typescript-eslint/parameter-properties */
import {AirhornTemplate, AirhornTemplateText} from '../src/template.js';

export class TestingData {
	public users = new Array<TestingUser>();

	constructor() {
		this.users = [
			new TestingUser('John', 'Doe', 'john@gmail.com', ['https://download1.com', 'https://download2.com']),
			new TestingUser('Mary', 'Anne', 'mary@gmail.com', ['https://download1ma.com', 'https://download2ma.com']),
			new TestingUser('Steve', 'Smith', 'steve@gmail.com', ['https://download1ss.com', 'https://download2ss.com', 'https://download3ss.com']),
		];
	}
}

export class TestingDataTwo {
	public userOne = new TestingUser('John', 'Doe', 'john@gmail.com', ['https://download1.com', 'https://download2.com']);
	public userTwo = new TestingUser('Mary', 'Anne', 'mary@gmail.com', ['https://download1ma.com', 'https://download2ma.com']);
	public userThree = new TestingUser('Steve', 'Smith', 'steve@gmail.com', ['https://download1ss.com', 'https://download2ss.com', 'https://download3ss.com']);
}

export class TestingUser {
	firstName: string;
	lastName: string;
	email: string;
	downloads: string[];
	constructor(firstName: string, lastName: string, email: string, downloads: string[]) {
		this.firstName = firstName;
		this.lastName = lastName;
		this.email = email;
		this.downloads = downloads;
	}
}

export const airhornTestTemplateText = new AirhornTemplateText();
airhornTestTemplateText.langCode = 'en';
airhornTestTemplateText.properties.set('subject', 'Test Subject');
airhornTestTemplateText.templateFormat = 'handlebars';
airhornTestTemplateText.text = 'Test Text';

export const airhornTestTemplate = new AirhornTemplate('airhorn-test-template');
airhornTestTemplate.text.push(airhornTestTemplateText);
