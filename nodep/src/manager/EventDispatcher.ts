/**
 * 事件调度
 * @author nodep
 * @version 1.0
 */
class EventDispatcher {

	private static _lis: Map<number, any[]> = new Map<number, any[]>();

	public static regist(type: number, handler: Function, thisObj: any): void {
		if (!this._lis.has(type))
			this._lis.set(type, []);
		var lis: any[] = this._lis.get(type);
		lis.push([handler, thisObj]);
	}

	public static unregist(type: number, handler: Function, thisObj: any): void {
		var lis: any[] = this._lis.get(type);
		if (!lis)
			return;
		for (var i: number = 0; i < lis.length; i++) {
			if (lis[i][0] == handler && lis[i][1] == thisObj) {
				lis.splice(i, 1);
				break;
			}
		}
	}

	public static dispatch(type: number, args: any[] = null): void {
		var lis: any[] = this._lis.get(type);
		if (!lis)
			return;
		for (var i: number = 0; i < lis.length; i++) {
			(lis[i][0] as Function).apply(lis[i][1], args);
		}
	}
}