/**
 * 资源组加载器,这里同时只允许加载一组
 * @author nodep
 * @version 1.2
 */
class GroupResManager {

	private static _ins: GroupResManager;
	//---------------加载用的显示对象--------------
	private _winName: string;
	private _progressUpdateType: number;
	private _loadingWindow: any;
	//--------------加载信息--------------
	//当前正在加载的groups
	private _loadingGroups: string[] = [];
	//当前正在加载的group的加载信息
	private _loadingMap: Map<string, CallBackVO> = new Map();
	//需要显示loading条的加载组
	private _showBars: string[] = [];


	public static getIns(): GroupResManager {
		if (!GroupResManager._ins)
			GroupResManager._ins = new GroupResManager();
		return GroupResManager._ins;
	}

	/**
	 * 注册加载时的进度条
	 * @param  {string} winName 加载条界面名称
	 * @param  {number} progressUpdateType 进度通知消息编号
	 * @param  {any} loadingWindow 显示对象构造函数
	 * @returns void
	 */
	public registLoadingWindow(winName: string, progressUpdateType: number, loadingWindow: any): void {
		this._winName = winName;
		this._progressUpdateType = progressUpdateType;
		this._loadingWindow = loadingWindow;
		RES.setMaxRetryTimes(2);
		RES.setMaxLoadingThread(3);
	}

	/**
	 * 加载资源组
	 * @param  {string} sname 组名称
	 * @param  {Function} callBack 加载完成的回调函数
	 * @param  {any} thisObj
	 * @param  {boolean=true} showBar 是否显示加载进度条
	 * @returns void
	 */
	public loadGroup(gname: string, callBack: Function, thisObj: any, showBar: boolean = true, prio: number = 0, args: Array<any> = null): void {
		var vo: CallBackVO = new CallBackVO(callBack, thisObj, args);
		if (RES.isGroupLoaded(gname)) {
			vo.call();
			return;
		}
		this._loadingMap.set(gname, vo);
		var needEvents: boolean = this._loadingGroups.length == 0;
		var needLoad: boolean = true;
		if (this._loadingGroups.indexOf(gname) < 0) {//如果该group正在加载中
			this._loadingGroups.push(gname);
			needLoad = true;
		} else {
			needLoad = false;
		}
		if (showBar) {
			this._showBars.push(gname);
			WinsManager.getIns().openWindow(this._loadingWindow);
		}
		if (needEvents) {
			RES.addEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
			RES.addEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR, this.onResourceLoadError, this);
			RES.addEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
			RES.addEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR, this.onItemLoadError, this);
		}
		if (needLoad)
			RES.loadGroup(gname, prio);
	}

	/**
     * 资源组加载完成
     */
	private onResourceLoadComplete(event: RES.ResourceEvent): void {
		var gname: string = event.groupName;
		var index: number = this._loadingGroups.indexOf(gname);
		if (index >= 0)
			this._loadingGroups.splice(index, 1);
		var vo: CallBackVO = this._loadingMap.get(gname);
		if (vo != null)
			vo.call();
		this._loadingMap.set(gname, null);
		if (this._loadingGroups.length == 0) {
			RES.removeEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
			RES.removeEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR, this.onResourceLoadError, this);
			RES.removeEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
			RES.removeEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR, this.onItemLoadError, this);
		}
		index = this._showBars.indexOf(gname);
		if (index >= 0)
			this._showBars.splice(index, 1);
		if (this._showBars.length == 0)
			WinsManager.getIns().closeWin(this._loadingWindow);
	}

	/**
     * 资源组加载出错
     */
	private onItemLoadError(event: RES.ResourceEvent): void {
		console.warn("Url:" + event.resItem.url + " has failed to load");
	}

    /**
     * 资源组加载出错
     */
	private onResourceLoadError(event: RES.ResourceEvent): void {
		console.warn("Group:" + event.groupName + " has failed to load");
		this.onResourceLoadComplete(event);
	}

    /**
     * 资源组加载进度
     */
	private onResourceProgress(event: RES.ResourceEvent): void {
		WinsManager.getIns().updateWin(this._progressUpdateType, [this._winName], [event.itemsLoaded, event.itemsTotal]);
	}
}