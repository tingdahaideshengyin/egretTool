/**
 * eui常用的工具类
 * @version 1.0
 * @author nodep
 */
class EuiUtil {

	/**
	 * 获取一个图片,可能支持九宫格
	 * @param  {string} source
	 * @param  {egret.Rectangle=null} scale9Grid
	 * @returns eui
	 */
	public static getImage(source: string, scale9Grid: egret.Rectangle = null): eui.Image {
		var img: eui.Image = new eui.Image();
		img.source = source;
		if (scale9Grid != null)
			img.scale9Grid = scale9Grid;
		return img;
	}
}