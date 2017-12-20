module nodep {
	/**
	 * 直接拷贝egret.Ease需要的函数做扩展
	 */
	export class Ease {
		public static backOut(t): number {
			return (--t * t * ((1.7 + 1) * t + 1.7) + 1);
		}
	}
}