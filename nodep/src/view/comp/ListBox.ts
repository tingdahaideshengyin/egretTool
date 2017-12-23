/**
 * 列表
 */
class ListBox {

	private _box: eui.Group;
	private _cls: any;
	private _spY: number = 0;
	private _everyH: number = 0;
	private _upH: Function;
	private _downH: Function;
	private _mh: Function;
	private _thisObj: any;
	private _datas: any[] = [];
	private _items: ItemRender[] = [];
	private _gcItemds: ItemRender[] = [];
	public _autoBottom: boolean = true;
	private _bottomH: number = 0;
	private _bottomRect: eui.Rect;
	private _autoB: Function;
	private _autoT: Function;
	private _over: boolean = false;
	public toBottomSpeed: number = 800;
	public maxLen: number = 0;

	/**
	 * 通过一个容器与显示组件来构造一个List
	 * @param  {eui.Group} box
	 * @param  {any} cls
	 */
	public constructor(box: eui.Group, cls: any, spY: number = 0, everyH: number = 0, bottomH: number = 0, over: boolean = false) {
		this._over = over;
		this._box = box;
		this._cls = cls;
		this._spY = spY;
		this._everyH = everyH;
		this._bottomH = bottomH;
		if (this._bottomH > 0) {
			this._bottomRect = new eui.Rect(1, this._bottomH, 0);
			this._bottomRect.alpha = 0.01;
			this._box.addChild(this._bottomRect);
		}
		this._box.parent.addEventListener(eui.UIEvent.CHANGE, this.moveHandler, this);
		this._box.parent.addEventListener(eui.UIEvent.CHANGE_END, this.outHandler, this);
	}

	/**
	 * 初始化响应函数
	 * @param  {Function} upHandler 向上反弹时是否响应函数
	 * @param  {Function} downHandler 向下反弹时是否相应函数
	 * @param  {any} thisObj
	 * @returns void
	 */
	public initHandler(upHandler: Function, downHandler: Function, thisObj: any, autoB: Function = null, autoT: Function = null): void {
		this._upH = upHandler;
		this._downH = downHandler;
		this._thisObj = thisObj;
		this._autoB = autoB;
		this._autoT = autoT;
	}

	public initMoveHandler(mh: Function): void {
		this._mh = mh;
	}

	public toTop(delayc: boolean = true, move: boolean = false): void {
		var toy: number = 0;
		TweenTs.removeTweens(this._box);
		if (!move)
			this._box.scrollV = toy;
		else {
			TweenTs.get(this._box).to({ scrollV: toy }, this.toBottomSpeed);
		}
		if (delayc)
			DelayCall.call(50, this.toTop, this, [false]);
	}

	/**
	 * 滚动到最底部
	 * @param  {boolean=true} delayc
	 * @returns void
	 */
	public toBottom(delayc: boolean = true, move: boolean = false): void {
		var toy: number = this._box.getBounds().height - this._box.scrollRect.height;
		if (toy < 0)
			toy = 0;
		if (toy >= 0 && toy < this._box.getBounds().height) {
			TweenTs.removeTweens(this._box);
			if (!move)
				this._box.scrollV = toy;
			else {
				TweenTs.get(this._box).to({ scrollV: toy }, this.toBottomSpeed);
			}
		}
		if (delayc)
			DelayCall.call(50, this.toBottom, this, [false]);
	}

	private _needUp: boolean = false;
	private _needDown: boolean = false;

	//触碰移动
	private moveHandler(evt: eui.UIEvent): void {
		this._autoBottom = false;
		if (this._box.scrollV < -100) {
			this._needUp = true;
		}
		if (this._box.scrollV + this._box.scrollRect.height > this._box.getBounds().height + 100) {
			this._needDown = true;
		}
		if (this._mh != null && this._thisObj) {
			var v: number = 0;
			if (this._box.scrollV < 0) {
				v = -Math.min(this._box.scrollV / -100, 1);
			} else if (this._box.scrollV + this._box.scrollRect.height > this._box.getBounds().height) {
				v = Math.min((this._box.scrollV + this._box.scrollRect.height - this._box.getBounds().height) / 100, 1);
			}
			this._mh.apply(this._thisObj, [v]);
		}
	}

	//触碰结束
	private outHandler(evt: eui.UIEvent): void {
		if (this._box.scrollV >= (this._box.getBounds().height - this._box.height) - 100) {
			if (this._autoB != null) {
				this._autoB.apply(this._thisObj, [true]);
			}
			this._autoBottom = true;
		}
		if (this._needUp) {
			this._needUp = false;
			if (this._box.scrollV == 0 && this._upH && this._thisObj) {
				this._upH.apply(this._thisObj, null);
			}
		}
		if (this._needDown) {
			this._needDown = false;
			if (this._downH && this._thisObj) {
				this._downH.apply(this._thisObj, null);
			}
		}
	}

	/**
	 * 增加一条信息到下面
	 * @param  {any} d
	 * @param  {boolean=true} mc
	 */
	public pushOneToBottom(d: any, mc: boolean = true, hard: boolean = false): boolean {
		if (hard)
			this._autoBottom = true;
		var render: any;
		if (this._gcItemds.length > 0)
			render = this._gcItemds.pop();
		else
			render = new this._cls();
		(render as egret.DisplayObject).alpha = 1;
		this._datas.push(d);
		(render as ItemRender).updateData(d);
		this._box.addChild(render);
		this._items.push(render);
		this.checkLen();
		if (mc)
			(render as ItemRender).playIn();
		this.updatePoses(false, this._autoBottom, true);
		DelayCall.call(1, this.updatePoses, this, [false, this._autoBottom, true]);
		return !this._autoBottom;
	}

	/**
	 * 设置数据集,全部更新
	 * @param  {any[]} ds
	 * @returns void
	 */
	public changeDatas(ds: any[]): void {
		this._datas = ds;
		this.checkLen();
		this.updateDatas();
	}

	private checkLen(): void {
		if (this.maxLen <= 0)
			return;
		while (this._datas.length > this.maxLen) {
			this._datas.shift();
		}
		var render: any;
		while (this._items.length > this._datas.length) {
			render = this._items.shift();
			this._gcItemds.push(render);
			this._box.removeChild(render as egret.DisplayObject);
		}
	}

	/**
	 * 通过片动画的方式删除一个alpha
	 * @param  {any} target
	 * @returns void
	 */
	public removeOneByMc(target: any): void {
		var render: ItemRender = target as ItemRender;
		if (this._box.getChildIndex(target) < 0) {
			return;
		}
		var pIndex: number = this._items.indexOf(render);
		if (pIndex >= 0)
			this._items.splice(pIndex, 1);
		pIndex = this._datas.indexOf(render.getData());
		if (pIndex >= 0)
			this._datas.splice(pIndex, 1);
		TweenTs.removeTweens(target);
		TweenTs.get(target).to({ alpha: 0, x: -target.width }, 100);
		DelayCall.call(120, this.removeOne, this, [target]);
		this.updatePoses(true);
	}

	private removeOne(target: any): void {
		if (target.parent != null) {
			target.parent.removeChild(target);;
		}
	}

	private updateDatas(): void {
		//删除多余的组件
		var i: number = this._items.length - 1;
		var render: any;
		for (i; i >= 0; i--) {
			if (i >= this._datas.length) {
				render = this._items[i];
				this._gcItemds.push(render);
				this._box.removeChild(render as egret.DisplayObject);
				this._items.splice(i, 1);
			}
		}
		//构造不足的组件
		for (i = 0; i < this._datas.length; i++) {
			if (i >= this._items.length) {
				if (this._gcItemds.length > 0)
					render = this._gcItemds.pop();
				else
					render = new this._cls();
				(render as egret.DisplayObject).alpha = 1;
				this._box.addChild(render);
				this._items.push(render);
			}
		}
		//设置数据
		for (i = 0; i < this._items.length; i++) {
			render = this._items[i];
			render.updateData(this._datas[i]);
		}
		//刷新位置
		this.updatePoses();
		DelayCall.call(1, this.updatePoses, this);
	}

	private updatePoses(byMc: boolean = false, autoBottom: boolean = false, mcBottom: boolean = false): void {
		var fy: number = 0;
		var render: any;
		for (var i = 0; i < this._items.length; i++) {
			render = this._items[i];
			(render as egret.DisplayObject).alpha = 1;
			render.x = 0;
			TweenTs.removeTweens(render);
			if (byMc)
				TweenTs.get(render).to({ y: fy }, 100);
			else
				render.y = fy;
			if (this._everyH > 0) {
				fy += this._everyH;
			} else {
				fy += render.height;
			}
			fy += this._spY;
		}
		if (this._bottomRect != null) {
			this._bottomRect.y = fy;
			if (this._bottomRect.y < this._box.parent.height + 100 && this._over)
				this._bottomRect.y = this._box.parent.height + 100;
		}
		if (autoBottom)
			this.toBottom(true, mcBottom);
	}
}