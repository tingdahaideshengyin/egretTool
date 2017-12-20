/**
 * 淡出淡入效果,tween的替代实验类
 * @author nodep
 * @version 1.0
 */
class FadeEffect implements IRender {

	private _from: number;
	private _to: number;
	private _bt: number;
	private _target: egret.DisplayObject;
	private _callBack: Function;
	private _thisObj: any;
	private _turnT: number;
	private _durT: number;

	private constructor(target: egret.DisplayObject, durT: number, callBack: Function, thisObj: any, to: number = 0) {
		this._target = target;
		this._from = this._target.alpha;
		this._to = to;
		this._bt = this._to - this._from;
		this._callBack = callBack;
		this._thisObj = thisObj;
		this._durT = durT;
		this._turnT = 0;
		RenderManager.getIns().registRender(this);
	}

	public renderUpdate(interval: number): void {
		this._turnT += interval;
		this._target.alpha = this._from + this._bt * this._turnT / this._durT;
		if (this._turnT >= this._durT) {
			this._target.alpha = this._to;
			RenderManager.getIns().unregistRender(this);
			if (this._callBack != null && this._thisObj != null)
				this._callBack.apply(this._thisObj);
		}
	}

	/**
	 * 淡入
	 * @param  {egret.DisplayObject} target 显示对象
	 * @param  {number} durT 总时间毫秒
	 * @param  {Function} callBack 完成时的回调函数
	 * @param  {any} thisObj
	 * @returns void
	 */
	public static fadeIn(target: egret.DisplayObject, durT: number, callBack: Function, thisObj: any): void {
		new FadeEffect(target, durT, callBack, thisObj, 1);
	}

	/**
	 * 淡出
	 * @param  {egret.DisplayObject} target 显示对象
	 * @param  {number} durT 总时间毫秒
	 * @param  {Function} callBack 完成时的回调函数
	 * @param  {any} thisObj
	 * @returns void
	 */
	public static fadeOut(target: egret.DisplayObject, durT: number, callBack: Function, thisObj: any): void {
		new FadeEffect(target, durT, callBack, thisObj, 0);
	}
}