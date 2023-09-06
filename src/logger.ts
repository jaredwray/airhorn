import * as winston from 'winston';
import {Options} from './options.js';

export function create() {
	const log = winston.createLogger({transports: [new winston.transports.Console()]});
	const options = new Options();
	if (options.ENVIRONMENT === 'test') {
		log.silent = true;
	}

	return log;
}
