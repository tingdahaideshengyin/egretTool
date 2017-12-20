/**
 * 回调对象
 */
class CallBackVO {

	public callBack: Function;
	public thisObj: any;
	public args: Array<any> = null;

	/**
	 * 构造一个存放回调函数的对象
	 * @param  {Function} callBack
	 * @param  {any} thisObj
	 * @param  {any[]=null} args
	 */
	public constructor(callBack: Function, thisObj: any, args: any[] = null) {
		this.callBack = callBack;
		this.thisObj = thisObj;
		this.args = args;
	}

	/**
	 * 执行调用
	 * @param  {boolean=true} clear
	 * @returns void
	 */
	public call(clear: boolean = true): void {
		if (this.callBack != null && this.thisObj != null) {
			this.callBack.apply(this.thisObj, this.args)
		}
		if (clear) {
			this.callBack = null;
			this.thisObj = null;
		}
	}
}