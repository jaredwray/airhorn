import { describe, test, expect } from "vitest";
import { AirhornStatistics } from "../src/statistics";

describe("AirhornStatistics", () => {
	test("should initialize with default values", () => {
		const stats = new AirhornStatistics({ enabled: true });
		expect(stats.totalSendSuccesses).toBe(0);
		expect(stats.totalSendFailures).toBe(0);
	});

	test("should increment success count", () => {
		const stats = new AirhornStatistics();
		stats.incrementSuccess();
		expect(stats.totalSendSuccesses).toBe(1);
	});

	test("should increment failure count", () => {
		const stats = new AirhornStatistics();
		stats.incrementFailure();
		expect(stats.totalSendFailures).toBe(1);
	});

	test("should track execution times", () => {
		const stats = new AirhornStatistics();
		
		// Initially should have no execution times
		expect(stats.executionTimes).toEqual([]);
		expect(stats.averageExecutionTime).toBe(0);
		expect(stats.minExecutionTime).toBeNull();
		expect(stats.maxExecutionTime).toBeNull();
		expect(stats.totalExecutionTime).toBe(0);
		
		// Submit first execution time
		stats.submitExecutionTime(100);
		expect(stats.executionTimes).toEqual([100]);
		expect(stats.averageExecutionTime).toBe(100);
		expect(stats.minExecutionTime).toBe(100);
		expect(stats.maxExecutionTime).toBe(100);
		expect(stats.totalExecutionTime).toBe(100);
		
		// Submit second execution time
		stats.submitExecutionTime(200);
		expect(stats.executionTimes).toEqual([100, 200]);
		expect(stats.averageExecutionTime).toBe(150);
		expect(stats.minExecutionTime).toBe(100);
		expect(stats.maxExecutionTime).toBe(200);
		expect(stats.totalExecutionTime).toBe(300);
		
		// Submit third execution time
		stats.submitExecutionTime(50);
		expect(stats.executionTimes).toEqual([100, 200, 50]);
		expect(stats.averageExecutionTime).toBeCloseTo(116.67, 1);
		expect(stats.minExecutionTime).toBe(50);
		expect(stats.maxExecutionTime).toBe(200);
		expect(stats.totalExecutionTime).toBe(350);
	});

	test("should clear execution times", () => {
		const stats = new AirhornStatistics();
		
		// Submit some execution times
		stats.submitExecutionTime(100);
		stats.submitExecutionTime(200);
		stats.submitExecutionTime(150);
		
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
		const stats = new AirhornStatistics();
		
		stats.submitExecutionTime(100);
		stats.submitExecutionTime(200);
		
		const times = stats.executionTimes;
		times.push(300); // Modify the returned array
		
		// Original array should not be modified
		expect(stats.executionTimes).toEqual([100, 200]);
	});

	test("should return slowest execution times in descending order", () => {
		const stats = new AirhornStatistics();
		
		// Test with fewer than 10 times
		stats.submitExecutionTime(100);
		stats.submitExecutionTime(300);
		stats.submitExecutionTime(200);
		expect(stats.slowestExecutionTimes).toEqual([300, 200, 100]);
		
		// Clear and test with exactly 10 times
		stats.clearExecutionTimes();
		const times = [150, 250, 50, 350, 450, 100, 200, 300, 400, 500];
		times.forEach(time => stats.submitExecutionTime(time));
		expect(stats.slowestExecutionTimes).toEqual([500, 450, 400, 350, 300, 250, 200, 150, 100, 50]);
		
		// Add more than 10 times
		stats.submitExecutionTime(600);
		stats.submitExecutionTime(25);
		stats.submitExecutionTime(375);
		
		// Should only return slowest 10
		const slowest = stats.slowestExecutionTimes;
		expect(slowest).toHaveLength(10);
		expect(slowest).toEqual([600, 500, 450, 400, 375, 350, 300, 250, 200, 150]);
		
		// Verify it returns a copy and doesn't modify original
		slowest.push(999);
		expect(stats.slowestExecutionTimes).toHaveLength(10);
	});

	test("should return fastest execution times in ascending order", () => {
		const stats = new AirhornStatistics();
		
		// Test with fewer than 10 times
		stats.submitExecutionTime(100);
		stats.submitExecutionTime(300);
		stats.submitExecutionTime(200);
		expect(stats.fastestExecutionTimes).toEqual([100, 200, 300]);
		
		// Clear and test with exactly 10 times
		stats.clearExecutionTimes();
		const times = [150, 250, 50, 350, 450, 100, 200, 300, 400, 500];
		times.forEach(time => stats.submitExecutionTime(time));
		expect(stats.fastestExecutionTimes).toEqual([50, 100, 150, 200, 250, 300, 350, 400, 450, 500]);
		
		// Add more than 10 times
		stats.submitExecutionTime(600);
		stats.submitExecutionTime(25);
		stats.submitExecutionTime(375);
		
		// Should only return fastest 10
		const fastest = stats.fastestExecutionTimes;
		expect(fastest).toHaveLength(10);
		expect(fastest).toEqual([25, 50, 100, 150, 200, 250, 300, 350, 375, 400]);
		
		// Verify it returns a copy and doesn't modify original
		fastest.push(999);
		expect(stats.fastestExecutionTimes).toHaveLength(10);
	});
});
