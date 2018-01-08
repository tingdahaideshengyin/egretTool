/**
 * 游戏通用的界面,继承之后可以通过GameWindow进行管理
 * 界面的缩放不影响布局效果
 * @author nodep
 * @version 1.01
 */
class GameWindow extends eui.Component implements eui.UIComponent {

    //非初次加入舞台
    public __inited: boolean = false;
    protected __align: string = "NONE";
    private __offsetX: number = 0;
    private __offsetY: number = 0;
    /***所屬層級,需要在業務中自定義*/
    public layerType: string = "";
    /**界面的唯一命名*/
    public typeName: string;
    /**是否有遮罩,如果手动设置为有遮罩的,将会在弹出后阻挡后面的界面操作*/
    public pop: boolean = false;
    /**界面是否已经创建完成,只有在创建完成的界面中才不会抛空*/
    protected created: boolean = false;
    //原始宽度
    private _initW: number;
    //原始高度
    private _initH: number;
    private _backgrundColor: number = -1;
    private _backBt: egret.Bitmap;
    public needDelayRemove: number = 0;
    public isFull: boolean = false;
    private static _backShape: egret.Shape = new egret.Shape();

    /**
     * 构造函数
     * @param  {string} typeName 界面名称
     * @param  {string} layerType 默认所在层
     * 当一个界面构造完成后,一般需要下面几个步骤
     * 1、删除partAdd
     * 2、添加初始化代码
     * 3、添加总刷新函数,并在create和reopen中调用
     * 下面是一些关键函数
     * @see addEventTap
     * @see tapCallback
     * @see update
     * @see active
     * @see beforeClose
     * @see reOpen
     */
    public constructor(typeName: string, layerType: string, backgrundColor: number = -1) {
        super();
        this._backgrundColor = backgrundColor;
        this.typeName = typeName;
        this.layerType = layerType;
        this.skinName = egret.getQualifiedClassName(this) + "Skin";
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
        if (this._backgrundColor >= 0) {
            var rt: egret.RenderTexture = new egret.RenderTexture();
            GameWindow._backShape.graphics.clear();
            GameWindow._backShape.graphics.beginFill(this._backgrundColor)
            GameWindow._backShape.graphics.drawRect(0, 0, 1, 1);
            GameWindow._backShape.graphics.endFill();
            rt.drawToTexture(GameWindow._backShape);
            this._backBt = new egret.Bitmap(rt);
            this.addChildAt(this._backBt, 0);
        }
        this.visible = true;
        this.created = true;
        this._initW = this.width;
        this._initH = this.height;
        if (NodepConfig.auto == 1)
            this.autoScale();
        this.resize();
        this.updateSelf();
        WinsManager.getIns().checkLayerVisible();
    }

    protected updateSelf(): void {

    }
    /**
     *再次加入舞臺
     */
    public reOpen(): void {
        this.visible = true;
        if (NodepConfig.auto == 1)
            this.autoScale();
        if (this._backBt) {
            this.addChildAt(this._backBt, 0);
        }
        this.resize();
        if (this.created)
            this.updateSelf();
        WinsManager.getIns().checkLayerVisible();
    }

    protected addStageClose(): void {
        this.stage.addEventListener(egret.TouchEvent.TOUCH_TAP, this.autoCloseHandler, this);
    }

    private autoCloseHandler(evt: egret.TouchEvent): void {
        var t: any = evt.target;
        if (t instanceof eui.Rect) {
            if (t.parent && t.parent instanceof GameLayer)
                WinsManager.getIns().closeWin(this);
        }
    }

    /**
     * 捕获消息
     * @param  {number} updateType 消息编号
     * @param  {any} updateObject 消息体
     * @returns void
     */
    public update(updateType: number, updateObject: any): void {
    }

    /**
     * 关闭界面之前
     * 如果要添加关闭动画则在实现中返回false,并实现自己的关闭动画。则关闭动画完成后彻底移除。
     */
    public beforeClose(): boolean {
        if (this.stage && this.stage.hasEventListener(egret.TouchEvent.TOUCH_TAP))
            this.stage.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.autoCloseHandler, this);
        if (this._backBt && this._backBt.parent) {
            this._backBt.parent.removeChild(this._backBt);
            this.needDelayRemove = 1;
        }
        return true;
    }

    /**
     * 舞台大小发生变化
     */
    public resize(): void {
        switch (this.__align) {
            case AlignType.CENTER_STAGE:
                if (NodepConfig.auto == 1 && this.parent != null) {
                    this.parent.x = Math.floor(WinsManager.stageWidth / 2);
                    this.parent.y = Math.floor(WinsManager.stageHeight / 2);
                } else {
                    this.x = Math.floor(WinsManager.stageWidth / 2);
                    this.y = Math.floor(WinsManager.stageHeight / 2);
                }
                break;
            case AlignType.TOP_LEFT:
                this.x = this.__offsetX;
                this.y = this.__offsetY;
                break;
            case AlignType.TOP_CENTER:
                this.x = (WinsManager.stageWidth - this.width * this.scaleX) / 2 + this.__offsetX;
                this.y = this.__offsetY;
                break;
            case AlignType.TOP_RIGHT:
                this.x = WinsManager.stageWidth - this.width * this.scaleX + this.__offsetX;
                this.y = this.__offsetY;
                break;
            case AlignType.CENTER:
                this.x = (WinsManager.stageWidth - this.width * this.scaleX) / 2 + this.__offsetX;
                this.y = (WinsManager.stageHeight - this.height * this.scaleY) / 2 + this.__offsetY;
                break;
            case AlignType.BOTTOM_LEFT:
                this.x = this.__offsetX;
                this.y = WinsManager.stageHeight - this.height * this.scaleY + this.__offsetY;
                break;
            case AlignType.BOTTOM_CENTER:
                this.x = this.x = (WinsManager.stageWidth - this.width * this.scaleX) / 2 + this.__offsetX;
                this.y = WinsManager.stageHeight - this.height * this.scaleY + this.__offsetY;
                break;
            case AlignType.BOTTOM_RIGHT:
                this.x = WinsManager.stageWidth - this.width * this.scaleX + this.__offsetX;
                this.y = WinsManager.stageHeight - this.height * this.scaleY + this.__offsetY;
                break;
        }
        if (this._backBt != null) {
            this._backBt.scaleX = this.width;
            this._backBt.scaleY = this.height;
        }
    }

    /**
     * 界面被激活
     * @returns void
     */
    public active(): void {

    }

    /**
     * 设置布局
     * @param  {string} alignType 布局方式
     * @param  {number=0} offsetX x偏移量
     * @param  {number=0} offsetY y偏移量
     * @see AlignType
     */
    public align(alignType: string, offsetX: number = 0, offsetY: number = 0): void {
        this.__align = alignType;
        this.__offsetX = offsetX * this.scaleX;
        this.__offsetY = offsetY * this.scaleY;
        if (this.stage != null)
            this.resize();
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
                        this[args[key]].addEventListener(egret.TouchEvent.TOUCH_TAP, this.eventTapHandler, this);
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

    /**
     * 弹出界面
     * @param  {number=200} durT 经过的时间
     * @param  {number=0} fromScale 从多小或多大
     * @param {boolean=true} useBackOut 是否应用此效果
     */
    protected popup(durT: number = 200, fromScale: number = 0, useBackOut: boolean = true): void {
        if (NodepConfig.auto == 1 && this.parent != null) {
            this.parent.alpha = 0;
            this.parent.scaleX = fromScale;
            this.parent.scaleY = fromScale;
            TweenTs.removeTweens(this.parent);
            TweenTs.get(this.parent).to({ alpha: 1, scaleX: 1, scaleY: 1 }, durT, useBackOut ? nodep.Ease.backOut : null);
        } else if (NodepConfig.auto == 0) {
            this.alpha = 0;
            this.scaleX = fromScale;
            this.scaleY = fromScale;
            TweenTs.removeTweens(this);
            TweenTs.get(this).to({ alpha: 1, scaleX: 1, scaleY: 1 }, durT, useBackOut ? nodep.Ease.backOut : null);
        }
    }

    protected popOut(durT: number = 200, toScale: number = 0): boolean {
        if (this._backBt && this._backBt.parent) {
            this._backBt.parent.removeChild(this._backBt);
            this.needDelayRemove = 1;
        }
        this.needDelayRemove = durT;
        if (NodepConfig.auto == 1 && this.parent != null) {
            TweenTs.removeTweens(this.parent);
            TweenTs.get(this.parent).to({ alpha: 0, scaleX: toScale, scaleY: toScale }, durT);
        } else if (NodepConfig.auto == 0) {
            TweenTs.removeTweens(this);
            TweenTs.get(this).to({ alpha: 0, scaleX: toScale, scaleY: toScale }, durT);
        }
        return true;
    }

    /**
     * 获取某个一级输入框(TextInput)
     * @param  {string} str partID
     */
    protected getTxtInput(str: string): eui.TextInput {
        return this.getChildByName(str) as eui.TextInput;
    }

    //自动布局
    public autoScale(): void {
        this.scaleX = WinsManager.getIns().$autoScaleX;
        this.scaleY = WinsManager.getIns().$autoScaleY;
        var trueH: number = this._initH * this.scaleY;
        this.height = this._initH - (trueH - this._initH) / WinsManager.getIns().$autoScaleY;
    }

    protected justScale(): void {
        this.scaleX = WinsManager.getIns().$autoScaleX;
        this.scaleY = WinsManager.getIns().$autoScaleY;
    }

    protected sound(sn: string, dt: number = 1000): void {
        SoundManager.getIns().playSound(sn, 1, dt);
    }
}