/**
 * 图片加载
 * @author nodep
 * @version 1.0
 */
class Loader extends eui.Component implements eui.UIComponent {

	//圆形头像
	public static HEAD_CIRCLE: number = 1;
	private _url: string;
	private _bit: egret.Bitmap;
	public _data: any;
	public type: number = 0;

	public set url(u: string) {
		if (this._url == u)
			return;
		this._url = u;
		this.updateImg();
	}

	public get url(): string {
		return this._url;
	}

	public constructor() {
		super();
	}

	protected partAdded(partName: string, instance: any): void {
		super.partAdded(partName, instance);
	}

	protected childrenCreated(): void {
		super.childrenCreated();
		this._bit = new egret.Bitmap();
		this.addChild(this._bit);
		this.updateImg();
	}

	public updateImg(): void {
		if (!this._bit)
			return;
		if (this._url != null && this._url.length > 0 && this._url != undefined && this._url != "undefined") {
		} else {
			return;
		}
		if (SynResCenter.hasBtd(this._url)) {
			this._bit.bitmapData = SynResCenter.getBitmapData(this._url);
			this._bit.width = this.width;
			this._bit.height = this.height;
			return;
		}
		var imgld: egret.ImageLoader = new egret.ImageLoader();
		imgld.addEventListener(egret.Event.COMPLETE, this.loadCompleted, this);
		imgld.addEventListener(egret.IOErrorEvent.IO_ERROR, this.loadError, this);
		// var urlReq: egret.URLRequest = new egret.URLRequest(this._url);
		// var urlLoader: egret.URLLoader = new egret.URLLoader();
		// urlLoader.dataFormat = egret.URLLoaderDataFormat.TEXTURE;
		// urlLoader.load(urlReq);
		// urlLoader.addEventListener(egret.Event.COMPLETE, (event: egret.Event) => {
		// 	var texture: egret.Texture = <egret.Texture>urlLoader.data;
		// 	if (this.type == Loader.HEAD_CIRCLE)
		// 		SynResCenter.setBitmapDataAsHeadCir(this._url, texture.bitmapData);
		// 	else
		// 		SynResCenter.setBitmapData(this._url, texture.bitmapData);
		// 	this._bit.bitmapData = SynResCenter.getBitmapData(this._url);
		// 	this._bit.width = this.width;
		// 	this._bit.height = this.height;
		// }, this);
		imgld.load(this._url);
	}

	private loadError(event: egret.Event): void {
		LogTrace.log(this._url + ":loader error!");
		var imgld = <egret.ImageLoader>event.currentTarget;
		imgld.removeEventListener(egret.Event.COMPLETE, this.loadCompleted, this);
		imgld.removeEventListener(egret.IOErrorEvent.IO_ERROR, this.loadError, this);
	}

	private loadCompleted(event: egret.Event): void {
		var imgld = <egret.ImageLoader>event.currentTarget;
		imgld.removeEventListener(egret.Event.COMPLETE, this.loadCompleted, this);
		imgld.removeEventListener(egret.IOErrorEvent.IO_ERROR, this.loadError, this);
		let texture = new egret.Texture();
		texture._setBitmapData(imgld.data);
		if (this.type == Loader.HEAD_CIRCLE)
			SynResCenter.setBitmapDataAsHeadCir(this._url, texture.bitmapData);
		else
			SynResCenter.setBitmapData(this._url, texture.bitmapData);
		this._bit.bitmapData = SynResCenter.getBitmapData(this._url);
		this._bit.width = this.width;
		this._bit.height = this.height;
	}
}