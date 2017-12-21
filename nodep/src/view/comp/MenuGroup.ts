/**
 * 传统手机目录缩放组件
 * @author nodep
 * @version 1.0
 */
class MenuGroup {

	private _bar: eui.Image;
	private _imgs: string[];
	private _targets: egret.DisplayObject[];
	private _targetsPos: Map<any, egret.Point> = new Map();
	private _showed: boolean = true;
	private _px: number = 0;
	private _py: number = 0;

	/**
	 * @param  {eui.Image} barImg 监听按钮点击的对象
	 * @param  {string[]} imgs 长度2的图片，0:缩,1:开
	 * @param  {egret.DisplayObject[]} targets 被控制的图片
	 */
	public constructor(barImg: eui.Image, imgs: string[], targets: egret.DisplayObject[], autoHide: boolean = false) {
		this._bar = barImg;
		this._imgs = imgs;
		this._targets = targets;
		for (var i: number = 0; i < this._targets.length; i++) {
			var p: egret.Point = new egret.Point(this._targets[i].x, this._targets[i].y);
			this._targetsPos.set(this._targets[i], p);
		}
		this._bar.rotation = 45;
		this._bar.source = this._imgs[1];
		this._bar.addEventListener(egret.TouchEvent.TOUCH_TAP, this.showOrHide, this);
	}

	public get isshowed(): boolean {
		return this._showed;
	}

	private showOrHide(evt: egret.TouchEvent): void {
		if (this._showed) {
			this.hide();
			this._bar.source = this._imgs[0];
		} else {
			this.show();
			this._bar.source = this._imgs[1];
		}
	}

	public show(ease: boolean = true): void {
		TweenTs.get(this._bar).to({ rotation: 0 }, 100);
		this._showed = true;
		for (var i: number = 0; i < this._targets.length; i++) {
			TweenTs.get(this._targets[i]).to({ alpha: 1, x: this._targetsPos.get(this._targets[i]).x + this._px, y: this._targetsPos.get(this._targets[i]).y + this._py }, 100, ease ? nodep.Ease.backOut : null);
		}
	}

	public hide(): void {
		TweenTs.get(this._bar).to({ rotation: 45 }, 100);
		this._showed = false;
		for (var i: number = 0; i < this._targets.length; i++) {
			TweenTs.get(this._targets[i]).to({ alpha: 0, x: this._bar.x, y: this._bar.y }, 100);
		}
	}

	//偏移量
	public offset(px: number, py: number): void {
		this._px = px;
		this._py = py;
	}
}