/**
 * 适配器for Safari
 * @author nodep
 * @version 1.0
 */
class ScreenManager {

	private static _baseUI: egret.DisplayObjectContainer;

	public constructor(ui: egret.DisplayObjectContainer) {
		if (navigator.userAgent.toLowerCase().indexOf("safari") < 0 || !egret.Capabilities.isMobile)
			return;
		if (ui.stage.orientation != egret.OrientationMode.LANDSCAPE)
			return;
		ScreenManager._baseUI = ui;
		window.addEventListener("resize", this.windowResizeHandler);
		this.windowResizeHandler(null);
	}

	private windowResizeHandler(evt: any): void {
		if (window.innerHeight > window.innerWidth) {
			ScreenManager._baseUI.scaleY = 1;
			window.scrollTo(0, 0);
			return;
		}
		else {
			if (window.innerHeight >= document.documentElement.clientHeight) {
				ScreenManager._baseUI.scaleY = 1;
				window.scrollTo(0, 0);
				return;
			}
			else {
				ScreenManager._baseUI.scaleY = window.innerHeight / document.documentElement.clientHeight;
				window.scrollTo(0, 0);
			}
		}
	}
}