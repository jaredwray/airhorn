export class AirhornStatistics {
	private _totalSendSuccesses: number = 0;
	private _totalSendFailure: number = 0;
	private _enabled: boolean = false;

	constructor() {}

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
		return this._totalSendFailure;
	}
}
