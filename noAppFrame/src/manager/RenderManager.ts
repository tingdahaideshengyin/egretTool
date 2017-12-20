/**
 * 游戏主循环控制器
 * @see registRender,unregistRender,IRender
 * @author nodep
 * @version 1.2
 */
class RenderManager {

	private static _ins: RenderManager;
	private static _stage: egret.Stage;
	private static _renderList: Array<IRender>;
	private static _lastTime: number = 0;
	private static _frameTime: number = 1000 / 60;
	private static _nodepTimered: boolean = false;
	private static _lastTimeredTime: number = 0;
	public static frameRate = 60;
	private static _iframe: any;
	private static _bzCount: number = 0;

	public static getIns(): RenderManager {
		if (!this._ins)
			this._ins = new RenderManager();
		return this._ins;
	}

	private constructor() {
		RenderManager._renderList = new Array();
	}

	public startRender(stage: egret.Stage): void {
		LogTrace.log("renderStart...");
		RenderManager._stage = stage;
		RenderManager._lastTime = egret.getTimer();
		stage.addEventListener(egret.Event.ENTER_FRAME, RenderManager.enterFrameHandler, RenderManager);
		// window.setInterval(RenderManager.enterFrameHandler, RenderManager._frameTime);
		window.addEventListener('message', function (e) {
			if (e.data === 'refresh') {
				RenderManager.enterFrameHandler(null, true);
			}
		}, false);
	}

	protected static enterFrameHandler(evt: egret.Event, isTimered: boolean = false): void {
		var key: any;
		var t: number = egret.getTimer();
		var interval: number = t - RenderManager._lastTime;
		var trueT: number = interval;
		if (interval > RenderManager._frameTime)
			RenderManager._bzCount += interval - RenderManager._frameTime;
		RenderManager._lastTime = t;
		var renderT: number = interval;
		var flag: boolean = false;
		// if (renderT >= RenderManager._frameTime)
		// 	renderT = RenderManager._frameTime;
		do {
			var needBz: boolean = true;
			if (RenderManager._nodepTimered || !NodepManager.getIns().isActive) {
				needBz = false;
				// egret.sys.$ticker.update();
			}
			for (key in RenderManager._renderList) {
				RenderManager._renderList[key].renderUpdate(renderT);
			}
			// if (RenderManager._bzCount >= RenderManager._frameTime)//如果需要补帧
			// {
			// 	RenderManager._bzCount -= RenderManager._frameTime;
			// 	flag = true;
			// }
			// else {
			flag = false;
			// }
			// if (needBz) {
			// 	// egret.sys.$ticker.update();
			// }
		}
		while (flag)
		if ((trueT >= 1300 && !NodepManager.getIns().isActive) || (!NodepManager.getIns().isActive && trueT >= 1000 && egret.Capabilities.isMobile))//属于浏览器级的停止,添加强制刷新
		{
			if (!RenderManager._nodepTimered) {
				RenderManager._nodepTimered = true;
				if (!RenderManager._iframe) {
					var duration = 0.03333; /* 1s */
					RenderManager._iframe = document.createElement('iframe');
					RenderManager._iframe.id = "nodepTimer"
					RenderManager._iframe.style.display = 'none';
					RenderManager._iframe.src = 'data:text/html,%3C%21DOCTYPE%20html%3E%0A%3Chtml%3E%0A%3Chead%3E%0A%09%3Cmeta%20charset%3D%22utf-8%22%20%2F%3E%0A%09%3Cmeta%20http-equiv%3D%22refresh%22%20content%3D%22' + duration + '%22%20id%3D%22metarefresh%22%20%2F%3E%0A%09%3Ctitle%3Ex%3C%2Ftitle%3E%0A%3C%2Fhead%3E%0A%3Cbody%3E%0A%09%3Cscript%3Etop.postMessage%28%27refresh%27%2C%20%27%2A%27%29%3B%3C%2Fscript%3E%0A%3C%2Fbody%3E%0A%3C%2Fhtml%3E';
				}
				document.body.insertBefore(RenderManager._iframe, document.body.childNodes[0]);
			}
		}
		if (!isTimered && RenderManager._nodepTimered) {
			if (t - RenderManager._lastTimeredTime < 1300) {
				var target: any = document.getElementById("nodepTimer");
				document.body.removeChild(document.getElementById("nodepTimer"));
				RenderManager._nodepTimered = false;
				WinsManager.getIns().globActive();
			}
			RenderManager._lastTimeredTime = t;
		}
	}

	/**
	 * 启动
	 * @param  {IRender} render
	 */
	public registRender(render: IRender): void {
		if (RenderManager._renderList.indexOf(render) >= 0)
			return;
		RenderManager._renderList.push(render);
	}

	/**
	 * 移除
	 * @param  {IRender} render
	 */
	public unregistRender(render: IRender): void {
		var indexN: number = RenderManager._renderList.indexOf(render);
		if (indexN >= 0) {
			RenderManager._renderList.splice(indexN, 1);
		}
	}
}