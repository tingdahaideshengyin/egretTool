/**
 * 一些不常用但必须有的功能集合的临时位置
 * 针对tip进行自动化与国际化预留
 * @author nodep
 * @version 1.1
 */
class NodepManager {

	/**当前是否激活,已由Render控制,也可通过对active事件监听并进行控制 */
	public isActive: boolean = true;

	private static _ins: NodepManager;

	private _colorFlilter: egret.ColorMatrixFilter = new egret.ColorMatrixFilter([
		0.3, 0.6, 0, 0, 0,
		0.3, 0.6, 0, 0, 0,
		0.3, 0.6, 0, 0, 0,
		0, 0, 0, 1, 0
	]);
	private _colorFlilter2: egret.ColorMatrixFilter = new egret.ColorMatrixFilter([
		0.15, 0.3, 0, 0, 0,
		0.15, 0.3, 0, 0, 0,
		0.15, 0.3, 0, 0, 0,
		0, 0, 0, 1, 0
	]);

	private constructor() {
	}

	public static getIns(): NodepManager {
		if (NodepManager._ins == null)
			NodepManager._ins = new NodepManager();
		return NodepManager._ins;
	}

	private _okHandler: Function;
	private _errorHandler: Function;
	private _ht: any;
	private _infoTMap: Map<string, number> = new Map();

	public regsitErrorOkHandler(okHandler: Function, errorHandler: Function, ht: any): void {
		this._okHandler = okHandler;
		this._errorHandler = errorHandler;
		this._ht = ht;
	}

	/**
	 * 粗暴的错误信息提示
	 * @param  {string} str
	 * @returns void
	 */
	public errorInfo(str: string): void {
		if (this._infoTMap.get(str) != null && egret.getTimer() < this._infoTMap.get(str))
			return;
		if (this._errorHandler != null) {
			this._infoTMap.set(str, egret.getTimer() + 500);
			this._errorHandler.apply(this._ht, [str]);
		}
	}

	/**
	 * 未实现
	 * @param  {string} str
	 * @returns void
	 */
	public okInfo(str: string): void {
		if (this._okHandler != null)
			this._okHandler.apply(this._ht, [str]);
	}

	/**
	 * 设置为灰色或重置
	 * @param  {egret.DisplayObject} target
	 * @param  {boolean} flag
	 */
	public setGrey(target: egret.DisplayObject, flag: boolean): void {
		if (flag)
			target.filters = [this._colorFlilter];
		else
			target.filters = null;
	}

	/**
	 * 设置为半灰色或重置
	 * @param  {egret.DisplayObject} target
	 * @param  {boolean} flag
	 */
	public setGreyHalf(target: egret.DisplayObject, flag: boolean): void {
		if (flag)
			target.filters = [this._colorFlilter2];
		else
			target.filters = null;
	}

	private _tipInit: boolean = false;
	private _tipObj: any;
	private _tipCallBack: Function;
	private _tipThisObj: any;
	private _tipJsonName: string;

	/**
	 * 注册tip的回调函数
	 * @param  {Function} callBack
	 * @param  {any} thisObj
	 * @returns void
	 */
	public registTipHandler(callBack: Function, thisObj: any, tipJsonName: string = "description_json"): void {
		this._tipCallBack = callBack;
		this._tipThisObj = thisObj;
		this._tipJsonName = tipJsonName;
		if (!this._tipInit) {
			this._tipInit = true;
			this._tipObj = RES.getRes(this._tipJsonName);
		}
	}

	/**获取tip,必须以helpTip_n的方式从description_json的help对象中获取数组.
	 * @param  {string} name
	 */
	public getTip(name: string): string {
		if (!this._tipInit) {
			this._tipInit = true;
			this._tipObj = RES.getRes(this._tipJsonName);
		}
		if (name.indexOf("helpTip_") >= 0) {
			return this._tipObj[name.split("_")[1]];
		}
		return "";
	}

	/**
	 * 为某个对象添加help点击事件
	 * @param  {egret.DisplayObject} target
	 */
	public addHelpTipHandler(target: egret.DisplayObject): void {
		target.addEventListener(egret.TouchEvent.TOUCH_TAP, this.helpTapHandler, this);
	}

	private helpTapHandler(evt: egret.TouchEvent): void {
		var tname: string = evt.target.name;
		var tipStr: string = this.getTip(tname);
		if (this._tipCallBack != null && this._tipThisObj != null)
			this._tipCallBack.apply(this._tipThisObj, [tipStr, evt.target]);
	}
}