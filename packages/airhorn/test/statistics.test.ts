import { describe, expect, test } from "vitest";
import { AirhornSendType } from "../src/index.js";
import { AirhornStatistics, type SendStatistic } from "../src/statistics";

describe("AirhornStatistics", () => {
	test("should initialize with default values", () => {
		const stats = new AirhornStatistics({ enabled: true });
		expect(stats.enabled).toBe(true);
		expect(stats.totalSends).toBe(0);
		expect(stats.totalSendSuccesses).toBe(0);
		expect(stats.totalSendFailures).toBe(0);
	});

	test("should not submit statistics when disabled", () => {
		const stats = new AirhornStatistics({ enabled: false });

		// Try to submit when disabled
		stats.submit({
			to: "user@example.com",
			from: "sender@example.com",
			providerType: AirhornSendType.Email,
			startTime: new Date(),
			duration: 100,
			success: true,
		});

		// Nothing should be recorded
		expect(stats.executionTimes).toHaveLength(0);
		expect(stats.totalSends).toBe(0);
		expect(stats.totalSendSuccesses).toBe(0);
		expect(stats.totalSendFailures).toBe(0);
		expect(stats.totalExecutionTime).toBe(0);
		expect(stats.minExecutionTime).toBeNull();
		expect(stats.maxExecutionTime).toBeNull();

		// Enable and submit
		stats.enabled = true;
		stats.submit({
			to: "user@example.com",
			from: "sender@example.com",
			providerType: AirhornSendType.Email,
			startTime: new Date(),
			duration: 100,
			success: true,
		});

		// Now it should be recorded
		expect(stats.executionTimes).toHaveLength(1);
		expect(stats.totalSends).toBe(1);
		expect(stats.totalSendSuccesses).toBe(1);
	});

	test("should track success count through execution times", () => {
		const stats = new AirhornStatistics({ enabled: true });

		// Initially no successes
		expect(stats.totalSendSuccesses).toBe(0);

		// Submit a successful execution
		stats.submit({
			to: "user@example.com",
			from: "sender@example.com",
			providerType: AirhornSendType.Email,
			startTime: new Date(),
			duration: 100,
			success: true,
		});
		expect(stats.totalSendSuccesses).toBe(1);
	});

	test("should track failure count through execution times", () => {
		const stats = new AirhornStatistics({ enabled: true });

		// Initially no failures
		expect(stats.totalSendFailures).toBe(0);

		// Submit a failed execution
		stats.submit({
			to: "user@example.com",
			from: "sender@example.com",
			providerType: AirhornSendType.SMS,
			startTime: new Date(),
			duration: 50,
			success: false,
		});
		expect(stats.totalSendFailures).toBe(1);
	});

	test("should track execution times", () => {
		const stats = new AirhornStatistics({ enabled: true });

		// Initially should have no execution times
		expect(stats.executionTimes).toEqual([]);
		expect(stats.averageExecutionTime).toBe(0);
		expect(stats.minExecutionTime).toBeNull();
		expect(stats.maxExecutionTime).toBeNull();
		expect(stats.totalExecutionTime).toBe(0);

		// Submit first execution time
		const entry1: SendStatistic = {
			to: "user1@example.com",
			from: "sender@example.com",
			providerType: AirhornSendType.Email,
			startTime: new Date(),
			duration: 100,
			success: true,
		};
		stats.submit(entry1);
		expect(stats.executionTimes).toHaveLength(1);
		expect(stats.executionTimes[0]).toEqual(entry1);
		expect(stats.averageExecutionTime).toBe(100);
		expect(stats.minExecutionTime).toBe(100);
		expect(stats.maxExecutionTime).toBe(100);
		expect(stats.totalExecutionTime).toBe(100);

		// Submit second execution time
		const entry2: SendStatistic = {
			to: "user2@example.com",
			from: "sender@example.com",
			providerType: AirhornSendType.SMS,
			startTime: new Date(),
			duration: 200,
			success: true,
		};
		stats.submit(entry2);
		expect(stats.executionTimes).toHaveLength(2);
		expect(stats.averageExecutionTime).toBe(150);
		expect(stats.minExecutionTime).toBe(100);
		expect(stats.maxExecutionTime).toBe(200);
		expect(stats.totalExecutionTime).toBe(300);

		// Submit third execution time
		const entry3: SendStatistic = {
			to: "https://webhook.example.com",
			from: "app@example.com",
			providerType: AirhornSendType.Webhook,
			startTime: new Date(),
			duration: 50,
			success: false,
		};
		stats.submit(entry3);
		expect(stats.executionTimes).toHaveLength(3);
		expect(stats.averageExecutionTime).toBeCloseTo(116.67, 1);
		expect(stats.minExecutionTime).toBe(50);
		expect(stats.maxExecutionTime).toBe(200);
		expect(stats.totalExecutionTime).toBe(350);
	});

	test("should clear execution times", () => {
		const stats = new AirhornStatistics({ enabled: true });

		// Submit some execution times
		const createEntry = (duration: number): SendStatistic => ({
			to: "test@example.com",
			from: "sender@example.com",
			providerType: AirhornSendType.Email,
			startTime: new Date(),
			duration,
			success: true,
		});

		stats.submit(createEntry(100));
		stats.submit(createEntry(200));
		stats.submit(createEntry(150));

		expect(stats.executionTimes).toHaveLength(3);
		expect(stats.totalExecutionTime).toBe(450);

		// Clear execution times
		stats.clearExecutionTimes();

		expect(stats.executionTimes).toEqual([]);
		expect(stats.averageExecutionTime).toBe(0);
		expect(stats.minExecutionTime).toBeNull();
		expect(stats.maxExecutionTime).toBeNull();
		expect(stats.totalExecutionTime).toBe(0);
	});

	test("should return copy of execution times array", () => {
		const stats = new AirhornStatistics({ enabled: true });

		const entry1: SendStatistic = {
			to: "user1@example.com",
			from: "sender@example.com",
			providerType: AirhornSendType.Email,
			startTime: new Date(),
			duration: 100,
			success: true,
		};
		const entry2: SendStatistic = {
			to: "user2@example.com",
			from: "sender@example.com",
			providerType: AirhornSendType.SMS,
			startTime: new Date(),
			duration: 200,
			success: false,
		};

		stats.submit(entry1);
		stats.submit(entry2);

		const times = stats.executionTimes;
		times.push({
			to: "user3@example.com",
			from: "sender@example.com",
			providerType: AirhornSendType.Webhook,
			startTime: new Date(),
			duration: 300,
			success: true,
		}); // Modify the returned array

		// Original array should not be modified
		expect(stats.executionTimes).toHaveLength(2);
	});

	test("should return slowest execution times in descending order", () => {
		const stats = new AirhornStatistics({ enabled: true });

		const createEntry = (duration: number): SendStatistic => ({
			to: `user${duration}@example.com`,
			from: "sender@example.com",
			providerType: AirhornSendType.Email,
			startTime: new Date(),
			duration,
			success: true,
		});

		// Test with fewer than 10 times
		stats.submit(createEntry(100));
		stats.submit(createEntry(300));
		stats.submit(createEntry(200));
		const slowest3 = stats.slowestExecutionTimes;
		expect(slowest3).toHaveLength(3);
		expect(slowest3[0].duration).toBe(300);
		expect(slowest3[1].duration).toBe(200);
		expect(slowest3[2].duration).toBe(100);

		// Clear and test with exactly 10 times
		stats.clearExecutionTimes();
		const times = [150, 250, 50, 350, 450, 100, 200, 300, 400, 500];
		// biome-ignore lint/suspicious/useIterableCallbackReturn: test
		times.forEach((time) => stats.submit(createEntry(time)));
		const slowest10 = stats.slowestExecutionTimes;
		expect(slowest10).toHaveLength(10);
		expect(slowest10.map((e) => e.duration)).toEqual([
			500, 450, 400, 350, 300, 250, 200, 150, 100, 50,
		]);

		// Add more than 10 times
		stats.submit(createEntry(600));
		stats.submit(createEntry(25));
		stats.submit(createEntry(375));

		// Should only return slowest 10
		const slowest = stats.slowestExecutionTimes;
		expect(slowest).toHaveLength(10);
		expect(slowest.map((e) => e.duration)).toEqual([
			600, 500, 450, 400, 375, 350, 300, 250, 200, 150,
		]);

		// Verify it returns a copy and doesn't modify original
		slowest.push(createEntry(999));
		expect(stats.slowestExecutionTimes).toHaveLength(10);
	});

	test("should reset all statistics", () => {
		const stats = new AirhornStatistics({ enabled: true });

		const createEntry = (duration: number): SendStatistic => ({
			to: `user${duration}@example.com`,
			from: "sender@example.com",
			providerType: AirhornSendType.Email,
			startTime: new Date(),
			duration,
			success: true,
		});

		// Add some data
		stats.submit(createEntry(100));
		stats.submit(createEntry(200));
		stats.submit({
			to: "failed@example.com",
			from: "sender@example.com",
			providerType: AirhornSendType.Email,
			startTime: new Date(),
			duration: 150,
			success: false,
		});

		// Verify data exists
		expect(stats.totalSendSuccesses).toBe(2);
		expect(stats.totalSendFailures).toBe(1);
		expect(stats.executionTimes).toHaveLength(3);
		expect(stats.totalExecutionTime).toBe(450);
		expect(stats.minExecutionTime).toBe(100);
		expect(stats.maxExecutionTime).toBe(200);

		// Reset all statistics
		stats.reset();

		// Verify everything is reset
		expect(stats.totalSendSuccesses).toBe(0);
		expect(stats.totalSendFailures).toBe(0);
		expect(stats.executionTimes).toEqual([]);
		expect(stats.averageExecutionTime).toBe(0);
		expect(stats.minExecutionTime).toBeNull();
		expect(stats.maxExecutionTime).toBeNull();
		expect(stats.totalExecutionTime).toBe(0);
	});

	test("should return fastest execution times in ascending order", () => {
		const stats = new AirhornStatistics({ enabled: true });

		const createEntry = (duration: number): SendStatistic => ({
			to: `user${duration}@example.com`,
			from: "sender@example.com",
			providerType: AirhornSendType.Email,
			startTime: new Date(),
			duration,
			success: true,
		});

		// Test with fewer than 10 times
		stats.submit(createEntry(100));
		stats.submit(createEntry(300));
		stats.submit(createEntry(200));
		const fastest3 = stats.fastestExecutionTimes;
		expect(fastest3).toHaveLength(3);
		expect(fastest3[0].duration).toBe(100);
		expect(fastest3[1].duration).toBe(200);
		expect(fastest3[2].duration).toBe(300);

		// Clear and test with exactly 10 times
		stats.clearExecutionTimes();
		const times = [150, 250, 50, 350, 450, 100, 200, 300, 400, 500];
		// biome-ignore lint/suspicious/useIterableCallbackReturn: test
		times.forEach((time) => stats.submit(createEntry(time)));
		const fastest10 = stats.fastestExecutionTimes;
		expect(fastest10).toHaveLength(10);
		expect(fastest10.map((e) => e.duration)).toEqual([
			50, 100, 150, 200, 250, 300, 350, 400, 450, 500,
		]);

		// Add more than 10 times
		stats.submit(createEntry(600));
		stats.submit(createEntry(25));
		stats.submit(createEntry(375));

		// Should only return fastest 10
		const fastest = stats.fastestExecutionTimes;
		expect(fastest).toHaveLength(10);
		expect(fastest.map((e) => e.duration)).toEqual([
			25, 50, 100, 150, 200, 250, 300, 350, 375, 400,
		]);

		// Verify it returns a copy and doesn't modify original
		fastest.push(createEntry(999));
		expect(stats.fastestExecutionTimes).toHaveLength(10);

		// Verify the entries contain all expected fields
		const firstEntry = fastest[0];
		expect(firstEntry.to).toBe("user25@example.com");
		expect(firstEntry.from).toBe("sender@example.com");
		expect(firstEntry.providerType).toBe(AirhornSendType.Email);
		expect(firstEntry.startTime).toBeInstanceOf(Date);
		expect(firstEntry.duration).toBe(25);
	});
});
