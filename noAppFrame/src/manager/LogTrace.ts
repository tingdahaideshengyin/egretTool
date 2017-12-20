/**
 * 日志输出
 * @author nodep
 * @version 1.0
 */
class LogTrace {

	/**
	 * 输出字符串
	 * @param  {any} str
	 * @returns void
	 */
	public static log(str: any): void {
		if (NodepConfig.isDebug == 1)
			console.log(str);
	}

	/**
	 * 输出当前系统时间
	 * @returns void
	 */
	public static logTime(): void {
		if (NodepConfig.isDebug == 1)
			console.log("time:" + (new Date()).getTime());
	}

	public static errorInfo(str: any): void {
		console.log("warnInfo:" + str);
	}
}