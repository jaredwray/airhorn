/* eslint-disable n/prefer-global/process */
import * as Logger from '../src/logger.js';

test('Logger - silence with foo env', () => {
	process.env.NODE_ENV = 'foo';
	const logger = Logger.create();
	expect(logger.silent).toEqual(undefined);
});

test('Logger - silence with test env', () => {
	process.env.NODE_ENV = 'test';
	const logger = Logger.create();
	expect(logger.silent).toEqual(true);
});
