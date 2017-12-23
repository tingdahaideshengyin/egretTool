/**
 * 服务器时间
 * @version 1.0
 * @author nodep
 */
class ServerTime {

	private static _stime: number = 0;
	private static _startT: number = 0;

	public static initBySec(s: number): void {
		DelayCall.removeCall("framework_servertime");
		DelayCall.call(1000, this.enterframe, this, null, 0, "framework_servertime");
		this._stime = s * 1000;
		this._startT = egret.getTimer();
	}

	public static getTime(): number {
		return this._stime + (egret.getTimer() - this._startT);
	}

	private static _groupMap: Map<string, any[]> = new Map();
	private static _groupNames: string[] = [];

	/**
	 * 注册一个依赖于服务器时间的函数
	 * @param  {string} key 所属组
	 * @param  {Function} handler 监听函数
	 * @param  {any} thisObj 回执
	 * @param  {any[]} args 参数
	 * @param  {number} t 时间
	 * @returns void
	 */
	public static regist(key: string, handler: Function, thisObj: any, args: any[], t: number): void {
		if (this._groupNames.indexOf(key) < 0)
			this._groupNames.push(key);
		if (!this._groupMap.has(key))
			this._groupMap.set(key, []);
		var list: any[] = this._groupMap.get(key);
		var one: any = { "callBack": handler, "time": t, "thisObj": thisObj, "arg": args };
		list.push(one);
		list.sort(function (a, b) {//从大到小排列
			return b.time - a.time;
		});
	}

	public static delGroup(key: string): void {
		var index: number = this._groupNames.indexOf(key);
		if (index < 0)
			return;
		this._groupNames.splice(index, 1);
		var list: any[] = this._groupMap.get(key);
		while (list.length > 0)
			list.pop();
		this._groupMap.delete(key);
	}

	/**
	 * 判断两天是否为同一天
	 * @param  {number} ms
	 * @returns boolean
	 */
	public static isToday(ms: number): boolean {
		var t: number = this.getTime();
		return TimeUtil.getTimeStr_1(t) == TimeUtil.getTimeStr_1(ms);
	}

	private static enterframe(): void {
		var i: number = 0;
		var st: number = this.getTime();
		for (i; i < this._groupNames.length; i++) {
			var key: string = this._groupNames[i];
			var list: any[] = this._groupMap.get(key);
			for (var j: number = list.length - 1; j >= 0; j--) {
				var arg: any = list[j];
				if (st >= arg.time) {//达到执行条件
					(arg.callBack as Function).apply(arg.thisObj, arg.arg);
					list.splice(j, 1);
				}
			}
		}
	}
}