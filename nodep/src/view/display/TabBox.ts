/**
 * 图片配合链接
 * @version 1.0
 * @author nodep
 */
class TabBox extends egret.DisplayObjectContainer {

	private _w: number;
	private _h: number;
	private _urls: string[] = [];
	private _imgs: string[] = [];
	private _index: number = 0;
	private _loaders: Loader[] = [];
	private _showIndex: number = 0;
	private _stcs: eui.Image[] = [];
	private _setImg: string = null;
	private _unsetImg: string = null;
	private _sw: number = 0;

	public constructor(w: number, h: number, setImg: string = null, unSetImg: string = null, sw: number = 30) {
		super();
		this._sw = sw;
		this._setImg = setImg;
		this._unsetImg = unSetImg;
		this._w = w;
		this._h = h;
		for (var i: number = 0; i < 2; i++) {
			var loader: Loader = new Loader();
			loader.width = this._w;
			loader.height = this._h;
			this._loaders.push(loader);
			this.addChild(loader);
		}
	}

	public setDatas(urls: string[]): void {
		NodepUtil.listFillTo01(urls, [this._imgs, this._urls]);
		this._index = 0;
		if (this._setImg != null && this._unsetImg != null) {
			NodepUtil.fill(this._stcs, eui.Image, this._imgs.length, true, this);
		}
		var fromX: number = (this._w - this._stcs.length * this._sw) / 2;
		for (var i: number = 0; i < this._stcs.length; i++) {
			this._stcs[i].x = fromX;
			fromX += this._sw;
			this._stcs[i].y = this._h - this._sw;
		}
		this.updateShow();
	}

	private updateShow(): void {
		var si: number = this._showIndex % 2;
		var fl: Loader;
		var hide: Loader;
		if (si == 0) {
			fl = this._loaders[0];
			hide = this._loaders[1];
		} else {
			fl = this._loaders[1];
			hide = this._loaders[0];
		}
		TweenTs.removeTweens(hide);
		TweenTs.get(hide).to({ alpha: 0 }, 300);
		TweenTs.removeTweens(fl);
		TweenTs.get(fl).to({ alpha: 1 }, 300);
		fl.url = this._imgs[this._index];
		var nextIndex: number = this._index + 1;
		if (nextIndex >= this._imgs.length)
			nextIndex = 0;
		DelayCall.call(300, this.setLast, this, [hide, nextIndex]);
		for (var i: number = 0; i < this._stcs.length; i++) {
			if (this._index == i)
				this._stcs[i].source = this._setImg;
			else
				this._stcs[i].source = this._unsetImg;
		}
	}

	private setLast(l: Loader, str: string): void {
		l.url = str;
	}

	private changeImg(): void {
		this._index += 1;
		if (this._index >= this._imgs.length)
			this._index = 0;
		this._showIndex++;
		this.updateShow();
	}

	public start(times: number): void {
		DelayCall.call(times, this.changeImg, this, null, 0, "frameNode_tabbox" + this.hashCode, true);
		if (!this.hasEventListener(egret.TouchEvent.TOUCH_TAP))
			this.addEventListener(egret.TouchEvent.TOUCH_TAP, this.tapHandler, this);
	}

	private tapHandler(evt: egret.TouchEvent): void {
		var url: string = this._urls[this._index];
		if (url && url != "")
			window.open(url,"_blank");
	}

	public stop(): void {
		DelayCall.removeCall("frameNode_tabbox" + this.hashCode);
		this.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.tapHandler, this);
	}

	public gc(): void {

	}
}