/**
 * 位图的应用工具
 * 通过资源名称创建一个位图,
 * @author nodep
 * @version 1.0
 */
class BitmapUtil {

    private constructor() {
    }

    /**
     * 获取一个bitmap
     * @param  {string} name RES中的名称
     * @param  {boolean=false} centerFlag 是否为中心注册点
     */
    public static createBitmapByName(name: string, centerFlag: boolean = false): egret.Bitmap {
        let result = new egret.Bitmap();
        let texture: egret.Texture = RES.getRes(name);
        result.texture = texture;
        if (centerFlag) {
            result.anchorOffsetX = result.width / 2;
            result.anchorOffsetY = result.height / 2;
        }
        return result;
    }

    /**
     * 获取一个贴图
     * @param  {string} name RES中的名称
     */
    public static getBitmapTexture(name: string): egret.Texture {
        return RES.getRes(name);
    }
}