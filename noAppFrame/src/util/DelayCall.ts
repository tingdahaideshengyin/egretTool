/**
 * 延迟调用函数
 * @author nodep
 * @version 1.1
 */
class DelayCall implements IRender {

	protected key: string = "";
	protected delayTime: number = 0;
	protected repeatCount: number = 0;
	private _costTime: number = 0;
	private _callBack: Function;
	private _thisObject: any;
	private _args: Array<any>;
	private static _delayMap: Map<string, DelayCall> = new Map();

	private constructor(callBack: Function, thisObject: any, args: Array<any> = null) {
		this._callBack = callBack;
		this._thisObject = thisObject;
		this._args = args;
	}

	/**
	 * 延迟回调函数
	 * @param  {number} delayTime 延迟时间毫秒
	 * @param  {Function} callBack 回调函数
	 * @param  {any} thisObject 函数父节点
	 * @param  {Array<any>=null} args 返回给函数的参数集合
	 * @param  {number=1} repeat 重复次数，默认为1次。<=0为无限次循环
	 * @param  {string=""} key 该延迟函数封装体的Key。会覆盖一样的Key，导致上一个Key不能手动停止
	 */
	public static call(delayTime: number, callBack: Function, thisObject: any, args: Array<any> = null, repeat: number = 1, key: string = "", autoClear: boolean = false): DelayCall {
		if (autoClear)
			this.removeCall(key);
		var dcall: DelayCall = new DelayCall(callBack, thisObject, args);
		dcall.delayTime = delayTime;
		dcall.repeatCount = repeat;
		dcall.key = key;
		RenderManager.getIns().registRender(dcall);
		if (key && key != "") {
			DelayCall._delayMap.set(key, dcall);
		}
		return dcall;
	}

	/**
	 * 根据构造时给的key,来移除和停止一个延迟函数
	 * @param  {string} key
	 */
	public static removeCall(key: string): boolean {
		if (!key || key == "")
			return false;
		var dc: DelayCall = this._delayMap.get(key);
		if (dc)
			RenderManager.getIns().unregistRender(dc);
		this._delayMap.delete(key);
		return dc != null;
	}

	public renderUpdate(interval: number): void {
		this._costTime += interval;
		while (this._costTime >= this.delayTime) {
			this._costTime = this._costTime - this.delayTime;
			if (this.repeatCount > 0) {
				this.repeatCount -= 1;
				if (this.repeatCount <= 0) {
					DelayCall.removeCall(this.key);
					RenderManager.getIns().unregistRender(this);
					if (null != this._callBack)
						this._callBack.apply(this._thisObject, this._args);
					this._callBack = null;
					this._thisObject = null;
					this._args = null;
					break;
				}
				else {
					if (null != this._callBack)
						this._callBack.apply(this._thisObject, this._args);
				}
			}
			else {
				if (null != this._callBack)
					this._callBack.apply(this._thisObject, this._args);
				break;
			}
		}
	}
}