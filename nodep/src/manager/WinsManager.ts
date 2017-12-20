/**
 * 界面管理
 * 添加打开或关闭界面的方法:如果界面已打开,则进行关闭
 * @author nodep
 * @version 1.01;
 */
class WinsManager {

	private _sm: ScreenManager;
	private static _ins: WinsManager;
	private _baseUi: eui.UILayer;
	private _layerMap: Map<string, GameLayerInterface>;
	private _windowMap: Map<any, GameWindow>;
	public static stageWidth: number = 0;
	public static stageHeight: number = 0;

	private constructor() {
		if (WinsManager._ins != null)
			throw (new Error(NodepErrorType.ERROR_CODE));
		this._layerMap = new Map<string, GameLayerInterface>();
		this._windowMap = new Map<any, GameWindow>();
	}

	public static getIns(): WinsManager {
		if (!WinsManager._ins)
			WinsManager._ins = new WinsManager();
		return WinsManager._ins;
	}
	/**
	 * 整个框架的初始化入口
	 * @param  {eui.UILayer} ui
	 * @returns void
	 */
	public initGame(ui: eui.UILayer): void {
		NodepConfig.init();
		this._baseUi = ui;
		this._baseUi.stage.addEventListener(egret.Event.RESIZE, this.stageResizeHandler, this);
		this._sm = new ScreenManager(ui);
		WinsManager.stageWidth = this._baseUi.stage.stageWidth;
		WinsManager.stageHeight = this._baseUi.stage.stageHeight;
		RenderManager.getIns().startRender(ui.stage);
		this.addLayer(LayerType.LAYER_GROUND, new GameLayer());
		this.addLayer(LayerType.LAYER_BATTLE, new GameLayer());
		this.addLayer(LayerType.LAYER_MENU, new GameLayer());
		this.addLayer(LayerType.LAYER_UI, new GameLayer());
		this.addLayer(LayerType.LAYER_POP, new GameLayer());
		this.addLayer(LayerType.LAYER_TIP, new GameLayer(), false);
		this.autoScale();
		LogTrace.log("initCompleted...");
	}

	private addLayer(layerName: string, layer: GameLayerInterface, endable: boolean = true): void {
		if (!endable)
			(layer as GameLayer).touchEnabled = (layer as GameLayer).touchChildren = endable;
		this._layerMap.set(layerName, layer);
		this._baseUi.addChild(layer as GameLayer);
		LogTrace.log("add layer:" + layerName);
	}

	/**
	 * 开启或关闭窗口
	 * @param  {any} cls 类名
	 * @returns void
	 */
	public switchWin(cls: any): void {
		if (!this._windowMap.has(cls))
			this._windowMap.set(cls, new cls());
		let win: GameWindow = this._windowMap.get(cls);
		if (win.stage == null)
			this.openWindow(cls);
		else
			this.closeWin(cls);
	}

	/**
	 * 某个界面是否在舞台上
	 * @param  {any} cls 类名
	 * @returns boolean
	 */
	public isInStage(cls: any): boolean {
		if (!this._windowMap.has(cls))
			return false;
		let win: GameWindow = this._windowMap.get(cls);
		return win.parent != null;
	}

	/**
	 * app模式的预加载,并不会打开,优先级低,在执行openWindow时,将优先级提高
	 * 此优先级的不会占用加载显示
	 * @param  {any} cls
	 * @returns void
	 */
	public preOpenWindow(cls: any): void {
		var gName: string = NoAppResCenter.getGroupName(cls);
		if (gName != null)
			GroupResManager.getIns().loadGroup(gName, null, null, false, -1);
	}

	/**
	 * 打开一个界面
	 * @param  {any} cls
	 * @param  {boolean=false} clearLayer
	 * @param  {number=0} index
	 * @returns void
	 */
	public openWindow(cls: any, clearLayer: boolean = false, index: number = 0, showLoading: boolean = true): void {
		if (!cls)
			return;
		var gName: string = NoAppResCenter.getGroupName(cls);
		if (NodepConfig.appMode == 1 && gName != null) {
			GroupResManager.getIns().loadGroup(gName, this.readyOpen, this, showLoading, 0, [cls, clearLayer, index]);
		}
		else {
			LogTrace.log("not app , mode=" + NodepConfig.appMode + " gName=" + gName);
			this.readyOpen(cls, clearLayer, index);
		}
	}

	private readyOpen(cls: any, clearLayer: boolean = false, index: number = 0): void {
		var gName: string = egret.getQualifiedClassName(cls);
		if (!this._windowMap.has(cls))
			this._windowMap.set(cls, new cls());
		let win: GameWindow = this._windowMap.get(cls);
		var flag: boolean = DelayCall.removeCall("removeWin:self_frameworkForNode" + win.hashCode);
		if (!win.stage) {
			if (this._layerMap.has(win.layerType))//如果有對應層級可以打開
			{
				if (clearLayer)
					this._layerMap.get(win.layerType).clearLayer();
				this._layerMap.get(win.layerType).addWindow(win, index);
				LogTrace.log("openWindow->" + win.typeName + "->" + gName + ":" + win.hashCode);
			}
			else {
				throw (new Error(NodepErrorType.LAYER_NO_EXISTENT));
			}
		} else {
			if (flag) {//如果该界面正在关闭流程中
				win.reOpen();
			}
		}
	}

	/**
	 * 将界面打开到某个层
	 * @param  {any} cls
	 * @param  {string} layerType
	 * @returns void
	 */
	public openWindowToLayer(cls: any, layerType: string): void {
		if (!this._windowMap.has(cls))
			this._windowMap.set(cls, new cls());
		let win: GameWindow = this._windowMap.get(cls);
		if (!win.stage) {
			if (this._layerMap.has(layerType))//如果有對應層級可以打開
			{
				this._layerMap.get(layerType).addWindow(win, 0);
				LogTrace.log("openWindow->" + win.typeName);
			}
			else {
				throw (new Error(NodepErrorType.LAYER_NO_EXISTENT));
			}
		}
	}

	/**
	 * 关闭界面
	 * @param  {any} target
	 * @returns void
	 */
	public closeWin(target: any): void {
		if (!target)
			return;
		var win: GameWindow = null;
		switch (typeof target) {
			case "object": win = target as GameWindow;
				break;
			case "string"://暂时不支持
				break;
			case "function": win = this._windowMap.get(target);
				break;
		}
		if (!win || !win.parent)
			return;
		if (win.beforeClose()) {
			if (win.needDelayRemove > 0)
				DelayCall.call(win.needDelayRemove, this.removeWinReady, this, [win], 1, "removeWin:self_frameworkForNode" + win.hashCode);
			else
				this.removeWinReady(win);
		}
	}

	private removeWinReady(win: GameWindow): void {
		LogTrace.log("closeWin:" + win.hashCode);
		if (!win.parent)
			return;
		if (NodepConfig.auto == 1) {
			(win.parent.parent as GameLayer).removeWindow(win);
		} else {
			(win.parent as GameLayer).removeWindow(win);
		}
	}

	/**
	 * 发送通知消息到指定的界面集合
	 * @param  {number} updateType 消息编号
	 * @param  {Array<string>} typeNames 需要接受通知的界面
	 * @param  {any=null} updateData 消息体,绝大部分时候都应该是null,因为未打开的界面是接受不到消息的
	 * @returns void
	 */
	public updateWin(updateType: number, typeNames: Array<string>, updateData: any = null): void {
		this._windowMap.forEach(function (win) {
			if (typeNames.indexOf(win.typeName) >= 0 && win.stage != null)
				win.update(updateType, updateData);
		}, this);
	}

	/**
	 * 界面被唤醒
	 * @returns void
	 */
	public globActive(): void {
		this._windowMap.forEach(function (win) {
			if (win.stage != null)
				win.active();
		}, this);
	}

	/**
	 * 发送通知到当前所有打开的界面
	 * @param  {number} updateType
	 * @param  {any} updateData
	 * @returns void
	 */
	public globalUpdate(updateType: number, updateData: any): void {
		this._windowMap.forEach(function (win) {
			if (win.stage != null)
				win.update(updateType, updateData);
		}, this);
	}

	private stageResizeHandler(evt: egret.Event): void {
		WinsManager.stageWidth = this._baseUi.stage.stageWidth;
		WinsManager.stageHeight = this._baseUi.stage.stageHeight;
		this.autoScale();
		this._layerMap.forEach(function (layer) {
			layer.resize();
		}, this);
	}

	public $autoScaleX: number = 1;
	public $autoScaleY: number = 1;

	private autoScale(): void {
		if (NodepConfig.auto == 1) {
			var sx: number = WinsManager.stageWidth / window.innerWidth;
			var sy: number = WinsManager.stageHeight / window.innerHeight;
			if (sy >= sx && window.innerWidth < window.innerHeight)
				this.$autoScaleY = sy / sx;
			else
				this.$autoScaleY = 1;
			this._layerMap.forEach(function (layer) {
				layer.autoScale();
			}, this);
		}
	}

	/**
	 * 回收制定的界面
	 * @param  {any} key
	 * @returns void
	 */
	public gcWindow(key: any): void {

	}

	/**
	 * 回收所有当前不在舞台的界面
	 * @returns void
	 */
	public gcWindowAll(): void {

	}

	/**
	 * 获取当前游戏的舞台
	 * @returns egret
	 */
	public gameStage(): egret.Stage {
		if (this._baseUi != null)
			return this._baseUi.stage;
		else
			return null;
	}
}