/* eslint-disable node/prefer-global/process */
import * as Logger from '../src/logger';

test('Logger - silence', () => {
	process.env.NODE_ENV = 'foo';
	const logger = Logger.create();
	expect(logger.silent).toEqual(undefined);
});
