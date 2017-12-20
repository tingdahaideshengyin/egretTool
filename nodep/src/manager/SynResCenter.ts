/**
 * 临时加载的资源中心
 * @version 1.0
 * @author nodep
 */
class SynResCenter {

	private static _btds: Map<string, egret.BitmapData> = new Map();

	/**
	 * 获取一个图片资源
	 * @param  {string} url
	 * @returns egret
	 */
	public static getBitmapData(url: string): egret.BitmapData {
		return this._btds.get(url);
	}

	/**
	 * 是否有某个图片
	 * @param  {string} url
	 * @returns boolean
	 */
	public static hasBtd(url: string): boolean {
		return this._btds.has(url);
	}

	/**
	 * 获取某个位图数据
	 * @param  {string} url
	 * @param  {egret.BitmapData} btd
	 * @returns void
	 */
	public static setBitmapData(url: string, btd: egret.BitmapData): void {
		this._btds.set(url, btd);
	}

	public static setBitmapDataAsHeadCir(url: string, btd: egret.BitmapData): void {
		var _fogLayer: egret.DisplayObjectContainer = new egret.DisplayObjectContainer();
		var _fogLayerShape: egret.Shape = new egret.Shape();
		var _con: egret.DisplayObjectContainer = new egret.DisplayObjectContainer();
		var bit: egret.Bitmap = new egret.Bitmap(btd);
		_con.addChild(bit);
		_con.addChild(_fogLayerShape);
		let renderTexture: egret.RenderTexture = new egret.RenderTexture();
		_fogLayerShape.graphics.beginFill(0, 1);
		_fogLayerShape.graphics.drawCircle(btd.width / 2, btd.height / 2, btd.width / 2);
		_fogLayerShape.graphics.endFill();
		bit.mask = _fogLayerShape;
		renderTexture.drawToTexture(_con);
		this._btds.set(url, renderTexture.bitmapData);
		btd.$dispose();
	}
}