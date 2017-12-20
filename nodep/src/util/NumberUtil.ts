/**
 * 数字应用
 */
class NumberUtil {

	/**
	 * 将num转换为000,000,000的格式字符串
	 * @param  {number} num
	 * @param  {string="} sp 分隔符,默认为","。当使用bitmapLabel的时候需要
	 * @param  {any} "
	 */
	public static getMoneyStr_1(num: number, sp: string = ","): string {
		var str: string = "";
		var s1: string = num + "";
		while (s1.length > 0) {
			if (s1.length > 3) {
				str = sp + s1.substr(s1.length - 3, 3) + str;
				s1 = s1.substr(0, s1.length - 3);
			}
			else {
				str = s1.substr(0, s1.length) + str;
				s1 = "";
			}
		}
		if (str == sp)
			str = "0";
		return str;
	}

	/**
	 * 获取金币格式 xxx千，千万
	 */
	public static getMoneyStr_2(num: number): string {
		var len: number = (num + "").length;
		if (len <= 6)//正常显示
			return this.getMoneyStr_1(num, ",");
		else
			return Math.floor(num / 10000) + "万";
	}

	/**
	 * 獲取的金幣格式 1.2w
	 */
	public static getMoneyStr_3(num: number): string {
		num = parseInt(num + "");
		if (num >= 10000) {
			var kNum: number = parseInt(num / 10000 + "");
			var kSub: number = parseInt(parseInt(num % 10000 + "") / 1000 + "");
			if (kSub > 0)
				return kNum + "." + kSub + "萬";
			else
				return kNum + "萬";
		} else {
			return num + "";
		}
	}

	/**在這裡設置為xxxK的格式 */
	public static getMoneyStr_4(num: number): string {
		num = parseInt(num + "");
		if (num >= 10000) {
			var kNum: number = parseInt(num / 1000 + "");
			var kSub: number = parseInt(parseInt(num % 1000 + "") / 100 + "");
			if (kSub > 0)
				return kNum + "." + kSub + "K";
			else
				return kNum + "K";
		} else {
			return num + "";
		}
	}

	/**在這裡設置為xxxK的格式 >=1000則會有 */
	public static getMoneyStr_5(num: number): string {
		num = parseInt(num + "");
		if (num >= 1000) {
			var kNum: number = parseInt(num / 1000 + "");
			var kSub: number = parseInt(parseInt(num % 1000 + "") / 100 + "");
			if (kSub > 0)
				return kNum + "." + kSub + "K";
			else
				return kNum + "K";
		} else {
			return num + "";
		}
	}

	/**
	 * 在前面补0,默认补足2位
	 */
	public static getRoundStr_1(num: number, len: number = 2): string {
		var str: string = num + "";
		while (str.length < len)
			str = "0" + str;
		return str;
	}

	/**
	 * 保留2位小数,强制留00
	 * @param  {number} num
	 * @param  {number=2} len
	 * @returns string
	 */
	public static getRoundStr_2(num: number, len: number = 2): string {
		var str: string = num.toFixed(2);
		if (str.indexOf(".") >= 0) {
			var args: string[] = str.split(".");
			return args[0] + "." + this.getRoundStr_3(args[1]);
		} else {
			return str + ".00";
		}
	}

	/**
	 * 在后面补0
	 */
	public static getRoundStr_3(str: string, len: number = 2): string {
		while (str.length < len)
			str = str + "0";
		return str;
	}

	/**
	 * 是否为手机号
	 */
	public static isPhoneNumber(str: string): boolean {
		return str != null && str.length > 5;
	}

	/**
	 * 獲取時間
	 */
	public static getHourFromMin(num: number): string {
		num = parseInt(num + "");
		if (num >= 60) {
			var kNum: number = parseInt(num / 60 + "");
			var kSub: number = parseInt(parseInt(num % 60 + "") / 6 + "");
			if (kSub > 0)
				return kNum + "." + kSub + "h";
			else
				return kNum + "h";
		} else {
			return num + "m";
		}
	}

	/**
	 * 获取小时和分钟 00:00
	 * @param  {number} num
	 * @returns string
	 */
	public static getHourMin(num: number): string {
		if (num < 0)
			num = 0;
		var min: number = parseInt(num / 1000 / 60 + "");
		var hour: number = parseInt(min / 60 + "");
		min = parseInt(min % 60 + "");
		var m: string = min + "";
		if (m.length == 1)
			m = "0" + m;
		var h: string = hour + "";
		if (h.length == 1)
			h = "0" + h;
		return h + ":" + m;
	}
	
	/**
	 * 获取时间xx:xx 分秒
	 * @param  {number} num
	 * @returns string
	 */
	public static getMinSec(num: number): string {
		if (num < 0)
			num = 0;
		var min: number = parseInt(num / 1000 / 60 + "");
		var sec: number = parseInt(num / 1000 % 60 + "");
		var m: string = min + "";
		if (m.length == 1)
			m = "0" + m;
		var s: string = sec + "";
		if (s.length == 1)
			s = "0" + s;
		return m + ":" + s;
	}

	/**
	 * 讲一个字符串返回为139****0295
	 * @param  {string} str
	 * @param  {number=3} font
	 * @param  {number=4} back
	 * @returns string
	 */
	public static getPhoneScr(str: string, font: number = 3, back: number = 4): string {
		var len: number = str.length;
		var keys: string = "";
		for (var i: number = 0; i < len; i++) {
			if (i >= font && i < len - back)
				keys += "*";
			else
				keys += str.charAt(i);
		}
		return keys;
	}
}