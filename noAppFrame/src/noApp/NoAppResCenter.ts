/**
 * 不定模块模式的资源管理器
 * @author nodep
 * @version 1.0
 */
class NoAppResCenter {

	private static _cfg: Map<string, string[]> = new Map();
	private static _getted: string[] = [];
	/**
	 * 初始化NoAppResCenter的配置文件
	 * @param  {string} jsonName 配置文件的Res名称
	 * @returns void
	 */
	public static initConfig(jsonName: string): void {
		//{skinList:["a","b","c"],res:{"a":["","",""]}}
		var cfgObj: any = RES.getRes(jsonName);
		if (!cfgObj || cfgObj["skinList"] == null || cfgObj["res"] == null)
			return;
		var keyList: string[] = cfgObj.skinList;
		var res: any = cfgObj.res;
		while (keyList.length > 0) {
			var key: string = keyList.pop();
			this._cfg.set(key, res[key]);
		}
	}

	/**
	 * 获取类的名称,同时如果没有设置过这个类的资源列表,则进行设置
	 * @param  {any} cls
	 */
	public static getGroupName(cls: any): string {
		var winName: string = egret.getQualifiedClassName(cls);
		var reses: string[] = this._cfg.get(winName);
		if (reses == null) {
			LogTrace.log("winName=" + winName + " is emt");
			return null;
		}
		if (this._getted.indexOf(winName) < 0) {
			RES.createGroup(winName, reses, true);
		}
		return winName;
	}
}