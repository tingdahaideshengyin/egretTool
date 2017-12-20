/**
 * 横向滚动容器控制器
 * egret.getQualifiedClassName(this)
 */
class HViewStack {

	private static _pageMaker: Map<string, any> = new Map();
	private static _pageMap: Map<string, GameComp> = new Map();
	private _keys: string[] = [];
	private _box: eui.Group;
	private _focus: GameComp;
	private _focusIndex: number = 0;

	public constructor(box: eui.Group) {
		this._box = box;
	}

	public update(key: number, args: any) {
		for (var i: number = 0; i < this._box.numChildren; i++) {
			(this._box.getChildAt(i) as GameComp).update(key, args);
		}
	}

	/**
	 * 设置一组构造函数,必须是继承于GameComp的
	 * @param  {any[]} cls
	 * @returns void
	 */
	public setPages(cls: any[]): void {
		for (var i: number = 0; i < cls.length; i++) {
			var k: string = egret.getQualifiedClassName(cls[i]);
			this._keys.push(k);
			HViewStack._pageMaker.set(k, cls[i]);
		}
	}

	public removeAll(): void {
		this._focus = null;
		this._box.removeChildren();
	}

	/**
	 * 瞬间反页到
	 * @param  {number} index
	 * @param  {any} data
	 * @returns void
	 */
	public initPageTo(index: number, data: any): void {
		var comp: GameComp = HViewStack.getPage(this._keys[index]);
		egret.Tween.removeTweens(comp);
		comp.data = data;
		if (this._focus) {
			this._box.removeChild(this._focus);
			this._focus = null;
		}
		this._focusIndex = index;
		this._focus = comp;
		comp.x = comp.y = 0;
		this._box.addChild(comp);
	}

	/**
	 * 渐变的方式到达
	 * @param  {number} index
	 * @param  {any} data
	 * @returns void
	 */
	public changeToPage(index: number, data: any): void {
		if (!this._focus) {
			this.initPageTo(index, data);
			return;
		}
		var comp: GameComp = HViewStack.getPage(this._keys[index]);
		DelayCall.removeCall("hviewDelayRemove_" + comp.hashCode);
		var tar: GameComp = this._focus;
		var toX: number = 0;
		var idx: number = this._focusIndex;
		if (index > this._focusIndex) {//向左翻
			egret.Tween.removeTweens(comp);
			comp.x = this._box.width;
			egret.Tween.get(comp).to({ x: 0 }, 400);
			comp.data = data;
			this._box.addChild(comp);
			toX = -this._box.width;
			this._focus = comp;
			this._focusIndex = index;
		} else if (index < this._focusIndex) {//向右翻
			egret.Tween.removeTweens(comp);
			comp.x = -this._box.width;
			egret.Tween.get(comp).to({ x: 0 }, 400);
			comp.data = data;
			this._box.addChild(comp);
			toX = this._box.width;
			this._focus = comp;
			this._focusIndex = index;
		} else {//就在当前页
			this.initPageTo(index, data);
		}
		if (toX != 0 && this._focus != tar) {
			egret.Tween.removeTweens(tar);
			egret.Tween.get(tar).to({ x: toX }, 300);
			DelayCall.call(300, this.removeHandler, this, [tar], 1, "hviewDelayRemove_" + tar.hashCode);
		}
	}

	private removeHandler(tg: GameComp): void {
		if (tg.parent)
			tg.parent.removeChild(tg);
	}

	private static getPage(key: string): GameComp {
		var cls: any = this._pageMaker.get(key);
		if (!this._pageMap.has(key))
			this._pageMap.set(key, new cls());
		return this._pageMap.get(key);
	}
}