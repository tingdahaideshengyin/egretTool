/**
 * 焦点工具
 */
class FocusUtil {

	private static _imgBind: Map<any, any> = new Map();

	/**
	 * 当target焦点发生变化时，指定bindImg的图片资源
	 * @param  {egret.DisplayObject} target 例如：输入框
	 * @param  {eui.Image} bindImg 例如：底部的横线
	 * @param  {string} inSrc 例如：焦点进入时的图片
	 * @param  {string} outSrc 例如：焦点退出时的图片
	 * @returns void
	 */
	public static focusImgBind(target: egret.DisplayObject, bindImg: eui.Image, inSrc: string, outSrc: string): void {
		this.focusImgBindRemove(target);
		var obj: any = { "img": bindImg, "inSrc": inSrc, "outSrc": outSrc };
		this._imgBind.set(target, obj);
		target.addEventListener(egret.Event.FOCUS_IN, this.focusImgInHandler, this);
		target.addEventListener(egret.Event.FOCUS_OUT, this.focusImgOutHandler, this);
	}

	/**
	 * 解除绑定
	 * @param  {egret.DisplayObject} target
	 * @returns void
	 */
	public static focusImgBindRemove(target: egret.DisplayObject): void {
		if (this._imgBind.has(target)) {
			target.removeEventListener(egret.Event.FOCUS_IN, this.focusImgInHandler, this);
			target.removeEventListener(egret.Event.FOCUS_OUT, this.focusImgOutHandler, this);
		}
		this._imgBind.delete(target);
	}

	private static focusImgInHandler(evt: egret.Event): void {
		var target: egret.DisplayObject = evt.target;
		var args: any = this._imgBind.get(target);
		var img: eui.Image = args.img;
		img.source = args.inSrc;
	}

	private static focusImgOutHandler(evt: egret.Event): void {
		var target: egret.DisplayObject = evt.target;
		var args: any = this._imgBind.get(target);
		var img: eui.Image = args.img;
		img.source = args.outSrc;
	}
}