/**
 * 对象池
 * @author nodep
 * @version 1.0
 */
class ObjPool {

	private static _poolMap: Map<string, any[]> = new Map();

	/**
	 * 通过class获取一个实例
	 * @param  {any} cls
	 * @returns any
	 */
	public static create(cls: any): any {
		var key: string = egret.getQualifiedClassName(cls);
		if (!this._poolMap.has(key))
			this._poolMap.set(key, []);
		var cs: any[] = this._poolMap.get(key);
		if (cs.length == 0)
			cs.push(new cls());
		return cs.pop();
	}

	/**
	 * 释放一个
	 * @param  {any} c
	 * @returns void
	 */
	public static release(c: any): void {
		var key: string = egret.getQualifiedClassName(c);
		var cs: any[] = this._poolMap.get(key);
		if (cs)
			cs.push(c);
	}
}