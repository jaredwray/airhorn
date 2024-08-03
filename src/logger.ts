import process from 'node:process';

export class Logger {
	silent = false;

	constructor() {
		if (process.env.NODE_ENV === 'test') {
			this.silent = true;
		}
	}

	public error(message: string) {
		if (!this.silent) {
			console.error(message);
		}
	}

	public warn(message: string) {
		if (!this.silent) {
			console.warn(message);
		}
	}

	public info(message: string) {
		if (!this.silent) {
			console.info(message);
		}
	}
}

export const log = new Logger();
