export type AirhornStatisticsOptions = {
	enabled?: boolean;
};

export class AirhornStatistics {
	private _totalSendSuccesses: number = 0;
	private _totalSendFailures: number = 0;
	private _executionTimes: number[] = [];
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

	public get executionTimes(): number[] {
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

	public submitExecutionTime(executionTime: number) {
		this._executionTimes.push(executionTime);
		this._totalExecutionTime += executionTime;

		if (
			this._minExecutionTime === null ||
			executionTime < this._minExecutionTime
		) {
			this._minExecutionTime = executionTime;
		}

		if (
			this._maxExecutionTime === null ||
			executionTime > this._maxExecutionTime
		) {
			this._maxExecutionTime = executionTime;
		}
	}

	public clearExecutionTimes() {
		this._executionTimes = [];
		this._totalExecutionTime = 0;
		this._minExecutionTime = null;
		this._maxExecutionTime = null;
	}
}
