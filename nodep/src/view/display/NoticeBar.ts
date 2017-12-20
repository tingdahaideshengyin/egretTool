/**
 * 跑马灯式控制器,以eui的group为参数,以第一个child为txt。可设置右侧边距
 * @version 1.0
 * @author nodep
 */
class NoticeBar {

	private _g: eui.Group;
	private _label: eui.Label;
	private _left: number;
	private _right: number;
	private _txts: string[] = [];
	private _urls: string[] = [];
	private _index: number = 0;
	private _durT: number = 0;
	private _hash: number = 0;

	public constructor(g: eui.Group, right: number) {
		this._hash = Math.random();
		this._g = g;
		this._label = this._g.getChildAt(0) as eui.Label;
		this._label.text = "";
		this._right = this._g.width - right;
		this._left = this._label.x;
		var rect: eui.Rect = new eui.Rect(this._right - this._left, this._g.height, 0);
		rect.x = this._left;
		this._g.addChild(rect);
		this._label.mask = rect;
	}

	public setDatas(urls: string[]): void {
		NodepUtil.listFillTo01(urls, [this._txts, this._urls]);
		this._index = 0;
	}

	private playOne(): void {
		DelayCall.removeCall("frameNodep_noticeBar" + this._hash);
		var tx: string = this._txts[this._index];
		this._label.text = tx;
		this._label.x = this._right;
		DelayCall.call(1, this.startPlay, this, null, 1, "frameworknoticeBar" + this._g.hashCode, true);
	}

	private startPlay(): void {
		var needT: number = (this._right - this._left + this._label.textWidth) / (this._right - this._left) * this._durT;
		if (needT < this._durT) {
			needT = this._durT;
		}
		egret.Tween.removeTweens(this._label);
		egret.Tween.get(this._label).to({ x: this._left / 2 - this._label.textWidth }, needT);
		DelayCall.call(needT + 1000, this.nextOne, this, null, 1, "frameNodep_noticeBar" + this._hash);
	}

	private nextOne(): void {
		this._index++;
		if (this._index >= this._txts.length)
			this._index = 0;
		this.playOne();
	}

	private tapHandler(evt: egret.TouchEvent): void {
		var url: string = this._urls[this._index];
		if (url && url != "")
			window.open(url,"_blank");
	}

	public start(t: number = 8000): void {
		this._durT = t;
		this.playOne();
		if (!this._g.hasEventListener(egret.TouchEvent.TOUCH_TAP))
			this._g.addEventListener(egret.TouchEvent.TOUCH_TAP, this.tapHandler, this);
	}

	public stop(): void {
		egret.Tween.removeTweens(this._label);
		DelayCall.removeCall("frameworknoticeBar" + this._g.hashCode);
		DelayCall.removeCall("frameNodep_noticeBar" + this._hash);
		this._g.addEventListener(egret.TouchEvent.TOUCH_TAP, this.tapHandler, this);
	}
}