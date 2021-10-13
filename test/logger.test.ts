import * as process from 'node:process';
import * as Logger from '../src/logger';

test('Logger - silence', () => {
	process.env.NODE_ENV = 'foo';
	const logger = Logger.create();
	expect(logger.silent).toEqual(undefined);
});
