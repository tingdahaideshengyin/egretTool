/**
 * Alpha闪烁效果
 * @author nodep
 * @version 1.2 增加自动山所事件
 */
class AlphaRender implements IRender {

	private static _stepId: number = 0;
	private _id: number = 0;
	private _target: egret.DisplayObject;
	private _startArg: number;
	private _arg: number;
	private _durTime: number;
	private _lastDurT: number = 0;
	private static _rds: Map<any, AlphaRender> = new Map();

	private static createApr(target: egret.DisplayObject, durTime: number = 50, arg: number = 0.1): void {
		if (this._rds.has(target))
			return;
		var rd: AlphaRender = new AlphaRender(target, durTime, arg);
		this._rds.set(target, rd);
	}

	/**
	 * 开始对某个对象进行闪烁
	 * @param  {egret.DisplayObject} target
	 * @param  {number=0} autoStop
	 * @returns void
	 */
	public static startStatic(target: egret.DisplayObject, autoStop: number = 0, durTime: number = 50, arg: number = 0.1): void {
		this.createApr(target, durTime, arg);
		var apr: AlphaRender = this._rds.get(target);
		apr.start(autoStop);
	}

	/**
	 * 停止某个对象的闪烁
	 * @param  {egret.DisplayObject} target
	 * @returns void
	 */
	public static stopStatic(target: egret.DisplayObject): void {
		var apr: AlphaRender = this._rds.get(target);
		if (apr)
			apr.stop();
	}

	/**
	 * @param  {egret.DisplayObject} dis 目标显示对象
	 * @param  {number=50} durTime 多少毫秒变化一次
	 * @param  {number=0.1} arg 一次变化多少透明度
	 */
	public constructor(dis: egret.DisplayObject, durTime: number = 50, arg: number = 0.1) {
		this._id = AlphaRender._stepId;
		AlphaRender._stepId++;
		this._target = dis;
		this._startArg = dis.alpha;
		this._arg = arg;
		this._durTime = durTime;
	}

	public renderUpdate(interval: number): void {
		this._lastDurT += interval;
		if (this._lastDurT < this._durTime)
			return;
		this._lastDurT = 0;
		if (this._arg > 0 && this._target.alpha > 1)
			this._arg = -this._arg;
		else if (this._arg < 0 && this._target.alpha <= 0)
			this._arg = -this._arg;
		this._target.alpha += this._arg;
	}

	/**
	 * 开始闪烁,需要手动调用
	 * @returns void
	 */
	public start(autoStop: number = 0): void {
		RenderManager.getIns().registRender(this);
		if (autoStop > 0) {
			DelayCall.call(autoStop, this.stopSelf, this, null, 1, "framework_nodep_aloharender_" + this._id, true);
		}
	}

	private stopSelf(): void {
		this.stop();
	}

	/**
	 * 暂停闪烁并将透明度改变为最初的状态
	 * @returns void
	 */
	public stop(): void {
		DelayCall.removeCall("framework_nodep_aloharender_" + this._id);
		RenderManager.getIns().unregistRender(this);
		this._target.alpha = this._startArg;
	}

	/**
	 * 停止闪烁并销毁并将透明度改变为最初的状态
	 * @returns void
	 */
	public dispose(): void {
		RenderManager.getIns().unregistRender(this);
		this._target.alpha = this._startArg;
		this._target = null;
	}
}