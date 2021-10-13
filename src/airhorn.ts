import {Config} from './config';
import * as Logger from './logger';

const logger = Logger.create();

export class Airhorn {
	config = new Config();

	constructor() {
		logger.error('This is an init project. DO NOT USE. Please follow along at https://github.com/jaredwray/airhorn');
	}
}
