/**
 * 在此数组中存放的值对象的某个值是唯一的
 * 例如在这里存放一个结构为{"name":xxx,"value":xxxx}的对象数组，我们需要name是唯一的，那么构造为
 * new ArraySole<T> = new ArraySole(TClass,"name");
 * @author nodep
 * @version 1.0
 */
class ArraySole<T>{

	private _cls: any;
	private _key: string;
	public datas: Array<T> = [];

	/**
	 * @param  {any} cls 该值对象的构造函数
	 */
	public constructor(cls: any, key: string) {
		this._key = key;
		this._cls = cls;
	}

	/**
	 * 更新数据
	 * @param  {any} obj
	 * @returns void
	 */
	public addOrUpdate(obj: any): void {
		var vo: T = null;
		for (var i: number = 0; i < this.datas.length; i++) {
			if (this.datas[i][this._key] == obj[this._key]) {
				vo = this.datas[i];
				break;
			}
		}
		if (!vo) {//构造新的
			vo = new this._cls();
			this.datas.push(vo);
		}
		ObjUtil.copyTo(obj, vo);
	}

	/**
	 * 批量更新
	 * @param  {any} objs
	 * @returns void
	 */
	public addOrUpdateDatas(objs: any[]): void {
		while (objs.length > 0) {
			this.addOrUpdate(objs.pop());
		}
	}

	/**
	 * 根据单一条件获取一个新的数组
	 * @param  {string} key key值
	 * @param  {any} value 属性
	 * @returns T
	 */
	public getSubBy(key: string, value: any): T[] {
		var rst: T[] = [];
		for (var i: number = 0; i < this.datas.length; i++) {
			if (this.datas[i][key] == value) {
				rst.push(this.datas[i]);
			}
		}
		return rst;
	}
}