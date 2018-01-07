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

	public static getToday(t: number): string {
		return TimeUtil.getTimeStr_1(t);
	}

	public static getYestoday(t: number): string {
		return TimeUtil.getTimeStr_1(t - 24 * 60 * 60 * 1000);
	}

	public static getWeekStart(t: number): string {
		var d: Date = new Date(t);
		var cutD: number = d.getDay() == 0 ? 6 : d.getDay() - 1;
		return TimeUtil.getTimeStr_1(t - cutD * 24 * 60 * 60 * 1000);
	}

	public static getMonthStart(t: number): string {
		var d: Date = new Date(t);
		d.setDate(1);
		return TimeUtil.getTimeStr_1(d.getTime());
	}

	public static getLastMonthStart(t: number): string {
		var d: Date = new Date(t);
		var m: number = d.getMonth() - 1;
		var y: number = d.getFullYear();
		if (m < 0) {
			m = 11;
			y -= 1;
		}
		var ds: Date = new Date(y, m, 1);
		return TimeUtil.getTimeStr_1(ds.getTime());
	}

	public static getLastMonthEnd(t: number): string {
		var d: Date = new Date(t);
		var m: number = d.getMonth() - 1;
		var y: number = d.getFullYear();
		if (m < 0) {
			m = 11;
			y -= 1;
		}
		var dt: Date = new Date(y, m + 1, 0);
		var maxDay: number = dt.getDate();
		var ds: Date = new Date(y, m, maxDay);
		return TimeUtil.getTimeStr_1(ds.getTime());
	}

	private static weekNames: string[] = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];

	public static getWeekCn(str: string): string {
		var args: string[] = str.split("-");
		var d: Date = new Date(parseInt(args[0]), parseInt(args[1]) - 1, parseInt(args[2]));
		return this.weekNames[d.getDay()];
	}
}