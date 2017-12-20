/**
 * 框架的基础配置文件,可通过window属性进行更改
 * @author nodep
 * @version 1.0;
 */
class NodepConfig {
	/**是否属于测试 */
	public static isTest: number = 0;
	/**是否打印 */
	public static isDebug: number = 0;
	/**音乐默认大小 */
	public static bgVolume: number = 0.1;
	/**是否属于app模式 */
	public static appMode: number = 1;
	/**是否自动布局 */
	public static auto: number = 1;
	/**
	 * 设置启动参数
	 * @returns void
	 */
	public static init(): void {
		var configs: string[] = ["isTest", "isDebug", "bgVolume", "appMode", "auto"];
		for (var i: number = 0; i < configs.length; i++) {
			if (window.hasOwnProperty(configs[i]))
				this[configs[i]] = window[configs[i]];
		}
		LogTrace.log("init args set:" + configs.toString());
	}
}