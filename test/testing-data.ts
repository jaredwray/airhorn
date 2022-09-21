/* eslint-disable n/prefer-global/process */
import dotenv from 'dotenv';

dotenv.config();

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

export function getFirebaseCert(): string {
	if (!process.env.FIREBASE_CERT) {
		throw new Error('FIREBASE_CERT not defined. Please refer to the README.md under Testing Integrations.');
	}

	return process.env.FIREBASE_CERT;
}

export function getSendgridAPIKey(): string {
	if (!process.env.TWILIO_SENDGRID_API_KEY) {
		throw new Error('TWILIO_SENDGRID_API_KEY not defined. Please refer to the README.md under Testing Integrations.');
	}

	return process.env.TWILIO_SENDGRID_API_KEY;
}
