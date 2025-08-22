import type { AirhornProviderType } from "./provider.js";

export type AirhornStatisticsOptions = {
	enabled?: boolean;
};

export type ExecutionTimeEntry = {
	to: string;
	from: string;
	providerType: AirhornProviderType;
	startTime: Date;
	duration: number;
};

export class AirhornStatistics {
	private _totalSendSuccesses: number = 0;
	private _totalSendFailures: number = 0;
	private _executionTimes: ExecutionTimeEntry[] = [];
	private _totalExecutionTime: number = 0;
	private _minExecutionTime: number | null = null;
	private _maxExecutionTime: number | null = null;
	private _enabled: boolean = false;

	constructor(options?: AirhornStatisticsOptions) {
		if (options?.enabled !== undefined) {
			this._enabled = options.enabled;
		}
	}

	public get enabled(): boolean {
		return this._enabled;
	}

	public set enabled(enabled: boolean) {
		this._enabled = enabled;
	}

	public get totalSendSuccesses() {
		return this._totalSendSuccesses;
	}

	public get totalSendFailures() {
		return this._totalSendFailures;
	}

	public incrementSuccess() {
		this._totalSendSuccesses++;
	}

	public incrementFailure() {
		this._totalSendFailures++;
	}

	public get executionTimes(): ExecutionTimeEntry[] {
		return [...this._executionTimes];
	}

	public get averageExecutionTime(): number {
		if (this._executionTimes.length === 0) {
			return 0;
		}
		return this._totalExecutionTime / this._executionTimes.length;
	}

	public get minExecutionTime(): number | null {
		return this._minExecutionTime;
	}

	public get maxExecutionTime(): number | null {
		return this._maxExecutionTime;
	}

	public get totalExecutionTime(): number {
		return this._totalExecutionTime;
	}

	public get slowestExecutionTimes(): ExecutionTimeEntry[] {
		return [...this._executionTimes]
			.sort((a, b) => b.duration - a.duration)
			.slice(0, 10);
	}

	public get fastestExecutionTimes(): ExecutionTimeEntry[] {
		return [...this._executionTimes]
			.sort((a, b) => a.duration - b.duration)
			.slice(0, 10);
	}

	public submitExecutionTime(entry: ExecutionTimeEntry) {
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

	public clearExecutionTimes() {
		this._executionTimes = [];
		this._totalExecutionTime = 0;
		this._minExecutionTime = null;
		this._maxExecutionTime = null;
	}

	public reset() {
		this._totalSendSuccesses = 0;
		this._totalSendFailures = 0;
		this.clearExecutionTimes();
	}
}
