/**
 * 骨骼动画
 */
class DragonUtil {

	private static _fcMap: Map<string, dragonBones.EgretFactory> = new Map();
	private static _zipData: Map<string, any> = new Map();
	/**
	 * 骨骼工厂,简单版
	 */
	public static getMc(dname: string, armatureName: string): dragonBones.EgretArmatureDisplay {
		var fc: dragonBones.EgretFactory;
		if (DragonUtil._fcMap.get(dname) == null) {
			fc = new dragonBones.EgretFactory();
			fc.parseDragonBonesData(this.getJson(dname + "_ske_json"));
			fc.parseTextureAtlasData(this.getJson(dname + "_tex_json"), RES.getRes(dname + "_tex_png"));
			DragonUtil._fcMap.set(dname, fc);
		}
		fc = DragonUtil._fcMap.get(dname);
		var mc: dragonBones.EgretArmatureDisplay;
		mc = fc.buildArmatureDisplay(armatureName);
		return mc;
	}

	private static getJson(key: string): any {
		if (this._zipData.has(key))
			return this._zipData.get(key);
		else
			return RES.getRes(key);
	}

	public static registJson(key: string, value: any): void {
		this._zipData.set(key, value);
	}
}