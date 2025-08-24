import type { AirhornSendType } from "./index.js";

/**
 * Configuration options for AirhornStatistics
 */
export type AirhornStatisticsOptions = {
	/** Whether statistics collection is enabled */
	enabled?: boolean;
};

/**
 * Represents statistics for a single message send operation
 */
export type SendStatistic = {
	/** The recipient of the message */
	to: string;
	/** The sender of the message */
	from: string;
	/** The type of provider used for sending */
	providerType: AirhornSendType;
	/** The timestamp when the operation started */
	startTime: Date;
	/** The duration of the operation in milliseconds */
	duration: number;
	/** Whether the send operation was successful */
	success: boolean;
};

/**
 * Manages statistics for Airhorn message sending operations
 */
export class AirhornStatistics {
	/** Array of send statistics */
	private _executionTimes: SendStatistic[] = [];
	/** Sum of all execution times in milliseconds */
	private _totalExecutionTime: number = 0;
	/** Minimum execution time recorded in milliseconds */
	private _minExecutionTime: number | null = null;
	/** Maximum execution time recorded in milliseconds */
	private _maxExecutionTime: number | null = null;
	/** Whether statistics collection is enabled */
	private _enabled: boolean = false;

	/**
	 * Creates a new AirhornStatistics instance
	 * @param {AirhornStatisticsOptions} options - Configuration options for statistics collection
	 */
	constructor(options?: AirhornStatisticsOptions) {
		if (options?.enabled !== undefined) {
			this._enabled = options.enabled;
		}
	}

	/**
	 * Gets whether statistics collection is enabled
	 * @returns {boolean} True if statistics collection is enabled, false otherwise
	 */
	public get enabled(): boolean {
		return this._enabled;
	}

	/**
	 * Sets whether statistics collection is enabled
	 * @param enabled - Whether to enable statistics collection
	 */
	public set enabled(enabled: boolean) {
		this._enabled = enabled;
	}

	/**
	 * Gets the total number of send operations (successful + failed)
	 * @returns The total number of send operations
	 */
	public get totalSends(): number {
		return this._executionTimes.length;
	}

	/**
	 * Gets the total number of successful send operations
	 * @returns The number of successful sends
	 */
	public get totalSendSuccesses() {
		return this._executionTimes.filter((entry) => entry.success).length;
	}

	/**
	 * Gets the total number of failed send operations
	 * @returns The number of failed sends
	 */
	public get totalSendFailures() {
		return this._executionTimes.filter((entry) => !entry.success).length;
	}

	/**
	 * Gets a copy of all send statistics
	 * @returns Array of send statistics
	 */
	public get executionTimes(): SendStatistic[] {
		return [...this._executionTimes];
	}

	/**
	 * Calculates and returns the average execution time
	 * @returns The average execution time in milliseconds, or 0 if no entries exist
	 */
	public get averageExecutionTime(): number {
		if (this._executionTimes.length === 0) {
			return 0;
		}
		return this._totalExecutionTime / this._executionTimes.length;
	}

	/**
	 * Gets the minimum execution time recorded
	 * @returns The minimum execution time in milliseconds, or null if no entries exist
	 */
	public get minExecutionTime(): number | null {
		return this._minExecutionTime;
	}

	/**
	 * Gets the maximum execution time recorded
	 * @returns The maximum execution time in milliseconds, or null if no entries exist
	 */
	public get maxExecutionTime(): number | null {
		return this._maxExecutionTime;
	}

	/**
	 * Gets the sum of all execution times
	 * @returns The total execution time in milliseconds
	 */
	public get totalExecutionTime(): number {
		return this._totalExecutionTime;
	}

	/**
	 * Gets the 10 slowest send statistics
	 * @returns Array of the 10 slowest send statistics, sorted by duration descending
	 */
	public get slowestExecutionTimes(): SendStatistic[] {
		return [...this._executionTimes]
			.sort((a, b) => b.duration - a.duration)
			.slice(0, 10);
	}

	/**
	 * Gets the 10 fastest send statistics
	 * @returns Array of the 10 fastest send statistics, sorted by duration ascending
	 */
	public get fastestExecutionTimes(): SendStatistic[] {
		return [...this._executionTimes]
			.sort((a, b) => a.duration - b.duration)
			.slice(0, 10);
	}

	/**
	 * Records a new send statistic and updates statistics
	 * @param entry - The send statistic to record
	 */
	public submit(entry: SendStatistic) {
		if (!this._enabled) {
			return;
		}

		this._executionTimes.push(entry);
		this._totalExecutionTime += entry.duration;

		if (
			this._minExecutionTime === null ||
			entry.duration < this._minExecutionTime
		) {
			this._minExecutionTime = entry.duration;
		}

		if (
			this._maxExecutionTime === null ||
			entry.duration > this._maxExecutionTime
		) {
			this._maxExecutionTime = entry.duration;
		}
	}

	/**
	 * Clears all send statistics and resets related statistics
	 */
	public clearExecutionTimes() {
		this._executionTimes = [];
		this._totalExecutionTime = 0;
		this._minExecutionTime = null;
		this._maxExecutionTime = null;
	}

	/**
	 * Resets all statistics to their initial state
	 */
	public reset() {
		this.clearExecutionTimes();
	}
}
