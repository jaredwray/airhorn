import { describe, test, expect } from "vitest";
import { AirhornStatistics } from "../src/statistics";

describe("AirhornStatistics", () => {
	test("should initialize with default values", () => {
		const stats = new AirhornStatistics();
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
});
