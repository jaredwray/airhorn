import * as winston from 'winston';
import {Config} from './config';

export function create() {
	const log = winston.createLogger({transports: [new winston.transports.Console()]});
	const config = new Config();
	if (config.ENVIRONMENT === 'test') {
		log.silent = true;
	}

	return log;
}
