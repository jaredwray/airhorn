import * as process from 'node:process';
import * as winston from 'winston';

export function create() {
	const log = winston.createLogger({transports: [new winston.transports.Console()]});
	if (process.env.NODE_ENV === 'test') {
		log.silent = true;
	}

	return log;
}
