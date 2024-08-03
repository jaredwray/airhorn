/* eslint-disable n/prefer-global/process */
import {
	test, expect, afterEach, vi,
} from 'vitest';
import {log, Logger} from '../src/logger.js';

afterEach(() => {
	vi.restoreAllMocks(); // This will restore all spied-on methods
});

test('Logger - silence with foo env', () => {
	process.env.NODE_ENV = 'foo';
	const logger = new Logger();
	expect(logger.silent).toEqual(false);
});

test('Logger - silence with test env', () => {
	process.env.NODE_ENV = 'test';
	expect(log.silent).toEqual(true);
});

test('log.error', () => {
	const spy = vi.spyOn(console, 'error');
	process.env.NODE_ENV = 'foo';
	const logger = new Logger();
	logger.error('error message');
	expect(spy).toHaveBeenCalledWith('error message');
});

test('log.info', () => {
	const spy = vi.spyOn(console, 'info');
	process.env.NODE_ENV = 'foo';
	const logger = new Logger();
	logger.info('info message');
	expect(spy).toHaveBeenCalledWith('info message');
});

test('log.warn', () => {
	const spy = vi.spyOn(console, 'warn');
	process.env.NODE_ENV = 'foo';
	const logger = new Logger();
	logger.warn('warn message');
	expect(spy).toHaveBeenCalledWith('warn message');
});
