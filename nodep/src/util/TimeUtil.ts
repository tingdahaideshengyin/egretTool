/**
 * 时间工具
 * @version 1.0
 * @author nodep
 */
class TimeUtil {
	/**
	 * 年月日部分 2017-08-10
	 * @param  {number} ms
	 * @param  {string="-"} spt
	 * @returns string
	 */
	public static getTimeStr_1(ms: number, spt: string = "-"): string {
		var str: string = "";
		var date: Date = new Date(ms);
		str = date.getFullYear() + spt + NumberUtil.getRoundStr_1((date.getMonth() + 1), 2) + spt + NumberUtil.getRoundStr_1(date.getDate(), 2);
		return str;
	}
	/**
	 * 时分部分 11:00
	 * @param  {number} ms
	 * @param  {string=":"} spt
	 * @returns string
	 */
	public static getTimeStr_2(ms: number, spt: string = ":", hasSec: boolean = false): string {
		var str: string = "";
		var date: Date = new Date(ms);
		str = NumberUtil.getRoundStr_1(date.getHours(), 2) + spt + NumberUtil.getRoundStr_1(date.getMinutes(), 2);
		if (hasSec) {
			str = str + spt + NumberUtil.getRoundStr_1(date.getSeconds());
		}
		return str;
	}

	/**
	 * 月日部分 08-10
	 * @param  {number} ms
	 * @param  {string="-"} spt
	 * @returns string
	 */
	public static getTimeStr_3(ms: number, spt: string = "-"): string {
		var str: string = "";
		var date: Date = new Date(ms);
		str = NumberUtil.getRoundStr_1((date.getMonth() + 1), 2) + spt + NumberUtil.getRoundStr_1(date.getDate(), 2);
		return str;
	}

	/**
	 * 话费分，不足分为秒
	 * @param  {number} sec 秒
	 * @returns string
	 */
	public static getLastStr_1(sec: number): string {
		if (sec >= 60)
			return parseInt(sec / 60 + "") + "分";
		else
			return sec + "秒";
	}
}