/**
 * 对象工具
 * @author nodep
 * @version 1.0
 */
class ObjUtil {

	/**
	 * 不严格的对象拷贝
	 * @param  {any} from 数据源
	 * @param  {any} to 输入到对象啊
	 * @returns void
	 */
	public static copyTo(from: any, to: any): void {
		var key: any;
		for (key in to) {
			if (from.hasOwnProperty(key))
				to[key] = from[key];
		}
	}
}