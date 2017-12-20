/**
 * 常用算法
 * @version 1.0
 * @author nodep
 */
class NodepUtil {

	/**
	 * 遍历数组中的项，依次循环添加到目标数组
	 * @param  {any[]} sList
	 * @param  {any[]} tos 二位数组
	 * @param  {boolean=true} reset
	 * @returns void
	 */
	public static listFillTo01(sList: any[], tos: any[], reset: boolean = true): void {
		var i: number = 0;
		if (reset) {
			for (i = 0; i < tos.length; i++) {
				var list: any[] = tos[i];
				while (list.length > 0)
					list.pop();
			}
		}
		for (i = 0; i < sList.length; i += tos.length) {
			for (var j: number = 0; j < tos.length; j++) {
				tos[j].push(sList[i + j]);
			}
		}
	}

	/**
	 * 利用cls类型填充list,也可能删减
	 * @param  {any[]} list
	 * @param  {any} cls
	 * @param  {any} count
	 * @returns void
	 */
	public static fill(list: any[], cls: any, count: number, removed: boolean = false, p: egret.DisplayObjectContainer = null): void {
		var t: any;
		while (list.length > count) {
			t = list.pop();
			if (removed && t.parent)
				t.parent.removeChild(t);
		}
		while (list.length < count) {
			t = new cls();
			list.push(t);
			if (removed && p != null)
				p.addChild(t);
		}
	}
}