/**
 * 可视化组建基类
 * @author nodep
 * @version 1.0
 */
class GameComp extends eui.Component {

	protected created: boolean = false;
	protected _data: any;
	public index: number;

	/**
	 * 构造函数
	 * @param  {number=0} cid 可以通过index获取当前设置的值
	 */
	public constructor(cid: number = 0) {
		super();
		this.skinName = egret.getQualifiedClassName(this) + "Skin";
		this.index = cid;
	}

	/**
     * 捕获消息
     * @param  {number} updateType 消息编号
     * @param  {any} updateObject 消息体
     * @returns void
     */
	public update(updateType: number, updateObject: any): void {
	}

	protected partAdded(partName: string, instance: any): void {
		instance.name = partName;
		if (partName.indexOf("helpTip_") >= 0) {
			NodepManager.getIns().addHelpTipHandler(instance);
		}
		super.partAdded(partName, instance);
	}

	protected childrenCreated(): void {
		super.childrenCreated();
		this.created = true;
		this.updateSelf();
	}

	public set data(d: any) {
		this._data = d;
		this.updateSelf();
	}

	public get data(): any {
		return this._data;
	}

	protected updateSelf(): void {
	}

	/**
     * 为界面元素添加点击事件
     * @param  {any} args 需要添加事件的partID,或容器(如果是容器会为容器中的所有子对象添加事件)
     * @param  {string=""} paName args的父容器节点,只对2级容器有效。如果界面存在三级容器，请重新设计。或创建界面组件控制器
     * @see tapCallback
     */
	protected addEventTap(args: any, paName: string = ""): void {
		if (args instanceof egret.DisplayObject) {
			(args as egret.DisplayObject).addEventListener(egret.TouchEvent.TOUCH_TAP, this.eventTapHandler, this);
		} else {
			switch (typeof args) {
				case "string":
					if (paName == "")
						this.getChildByName(args).addEventListener(egret.TouchEvent.TOUCH_TAP, this.eventTapHandler, this);
					else
                    (this.getChildByName(paName) as egret.DisplayObjectContainer).getChildByName(args).addEventListener(egret.TouchEvent.TOUCH_TAP, this.eventTapHandler, this);
					break;
				case "object":
					var key: any;
					for (key in args) {
						this.getChildByName(args[key]).addEventListener(egret.TouchEvent.TOUCH_TAP, this.eventTapHandler, this);
					}
					break;
				default:
					throw (new Error(NodepErrorType.PARAM_TYPE_ERROR));
			}
		}
	}

	/**
     * 响应函数
     * @param  {string} childName
     * @returns void
     */
	protected tapCallback(childName: string): void {

	}

	private eventTapHandler(evt: egret.TouchEvent): void {
		if (evt.currentTarget instanceof eui.Image) {
			evt.currentTarget.scaleX = evt.currentTarget.scaleY = 0.9;
			DelayCall.call(20, function handle(target: any) {
				target.scaleX = target.scaleY = 1;
			}, this, [evt.currentTarget]);
		}
		this.tapCallback(evt.currentTarget.name);
	}

}