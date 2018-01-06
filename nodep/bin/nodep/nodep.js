var __reflect = (this && this.__reflect) || function (p, c, t) {
    p.__class__ = c, t ? t.push(c) : t = [c], p.__types__ = p.__types__ ? t.concat(p.__types__) : t;
};
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Map = (function () {
    function Map() {
        this._keys = [];
        this._values = [];
    }
    Map.prototype.set = function (key, value) {
        var idx = this._keys.indexOf(key);
        if (idx >= 0) {
            this._keys[idx] = key;
            this._values[idx] = value;
        }
        else {
            this._keys.push(key);
            this._values.push(value);
        }
    };
    Map.prototype.delete = function (key) {
        var idx = this._keys.indexOf(key);
        var k;
        if (idx >= 0) {
            this._keys.splice(idx, 1);
            k = this._values.splice(idx, 1)[0];
        }
        return k;
    };
    Map.prototype.log = function () {
        LogTrace.log("mapInfo=k:" + this._keys.length + "v:" + this._values.length);
    };
    Map.prototype.get = function (key) {
        var idx = this._keys.indexOf(key);
        if (idx >= 0)
            return this._values[idx];
        else
            return null;
    };
    Map.prototype.has = function (key) {
        var idx = this._keys.indexOf(key);
        return idx >= 0;
    };
    Map.prototype.forEach = function (fun, thisObj) {
        for (var i = 0; i < this._values.length; i++) {
            fun.call(thisObj, this._values[i]);
        }
    };
    Map.prototype.clear = function () {
        this._keys = [];
        this._values = [];
    };
    return Map;
}());
__reflect(Map.prototype, "Map");
/**
 * 对象池
 * @author nodep
 * @version 1.0
 */
var ObjPool = (function () {
    function ObjPool() {
    }
    /**
     * 通过class获取一个实例
     * @param  {any} cls
     * @returns any
     */
    ObjPool.create = function (cls) {
        var key = egret.getQualifiedClassName(cls);
        if (!this._poolMap.has(key))
            this._poolMap.set(key, []);
        var cs = this._poolMap.get(key);
        if (cs.length == 0)
            cs.push(new cls());
        return cs.pop();
    };
    /**
     * 释放一个
     * @param  {any} c
     * @returns void
     */
    ObjPool.release = function (c) {
        var key = egret.getQualifiedClassName(c);
        var cs = this._poolMap.get(key);
        if (cs)
            cs.push(c);
    };
    ObjPool._poolMap = new Map();
    return ObjPool;
}());
__reflect(ObjPool.prototype, "ObjPool");
/**
 * 性能更稳定,移动更精确的精简tween
 * 需要利用自己编写的触发器或直接用框架带的RenderManager做驱动。基于时间的，方便游戏中大量的位移动画。
 * 长距离精确位移过程中如果有抖动飘逸感觉，请自己在get,set中对应值取整数。
 * 因业务限制，暂时不做过多扩展
 * @version 1.0
 * @author nodep
 */
var TweenTs = (function () {
    function TweenTs() {
        this._ts = [];
        this._index = 0;
    }
    /**
     * 移除某个对象的所有tween
     * @param  {any} t
     * @returns void
     */
    TweenTs.removeTweens = function (t) {
        if (!this._tweenMap.has(t))
            return;
        var tw = this._tweenMap.delete(t);
        RenderManager.getIns().unregistRender(tw);
        tw.dispose();
    };
    /**
     * 为某个对象构造一个tween动画
     * 如果需要在执行过程中的响应函数,请自己在go的过程中设置一个get set做处理
     * @param  {any} t
     * @param  {boolean=true} autoRemove 自动移除正在运行的tween
     * @param  {number=1} loopTimes 循环次数,<0表示无限循环,默认执行一次
     * @param  {Function=null} completeHandler 每当动画执行一个循环之后都会调用这个函数
     * @param  {any=null} thisObj 函数所在域
     * @param  {any=null} args 结束时的参数数组
     * @returns TweenTs
     */
    TweenTs.get = function (t, autoRemove, loopTimes, completeHandler, thisObj, args) {
        if (autoRemove === void 0) { autoRemove = true; }
        if (loopTimes === void 0) { loopTimes = 1; }
        if (completeHandler === void 0) { completeHandler = null; }
        if (thisObj === void 0) { thisObj = null; }
        if (args === void 0) { args = null; }
        if (autoRemove)
            this.removeTweens(t);
        var tw = new TweenTs();
        tw._tw = t;
        tw._loop = loopTimes;
        tw._comH = completeHandler;
        tw._tO = thisObj;
        tw._args = args;
        this._tweenMap.set(t, tw);
        return tw;
    };
    TweenTs.prototype.dispose = function () {
        this._comH = null;
        this._tw = null;
        this._tO = null;
        this._args = null;
        while (this._ts.length > 0) {
            this._ts.pop().dispose();
        }
        this._ts = null;
        this._focusT = null;
        this._curObj = null;
        this._startObj = null;
    };
    Object.defineProperty(TweenTs.prototype, "groupName", {
        /**
         * 设置到某个group中,可以通过group进行整体控制
         * @param  {string} n
         */
        set: function (n) {
        },
        enumerable: true,
        configurable: true
    });
    /**
     * 如果你是单独使用这个类,请在enterFrame事件中,传入两次调用的差。
     * 在Tween自身内部，不会来验证interval的真实和有效性。
     * @param  {number} interval
     * @returns void
     */
    TweenTs.prototype.renderUpdate = function (interval) {
        if (!this._curObj)
            return;
        this._curT += interval;
        var key;
        for (key in this._curObj) {
            if (this._focusT.ease != null)
                this._tw[key] = this._startObj[key] + this._focusT.ease.call(nodep.Ease, this._curT / this._focusT.durT) * this._curObj[key];
            else
                this._tw[key] = this._startObj[key] + Math.min(this._curT / this._focusT.durT, 1) * this._curObj[key];
        }
        if (this._curT >= this._focusT.durT) {
            this._index++;
            if (this._index >= this._ts.length) {
                if (this._comH != null)
                    this._comH.apply(this._tO, this._args);
                this._loop--;
                if (this._loop <= 0) {
                    TweenTs.removeTweens(this._tw);
                    return;
                }
                this._index = 0;
            }
            this.setFocusToItem(this._ts[this._index]);
        }
    };
    TweenTs.prototype.setFocusToItem = function (its) {
        this._focusT = its;
        this._curObj = new Object();
        this._startObj = new Object();
        var key;
        for (key in its.props) {
            this._curObj[key] = its.props[key] - this._tw[key];
            this._startObj[key] = this._tw[key];
        }
        this._curT = 0;
    };
    TweenTs.prototype.to = function (props, dur, esae) {
        if (esae === void 0) { esae = null; }
        var ts = new nodep.TweenItem("go");
        ts.durT = dur;
        ts.ease = esae;
        ts.props = props;
        this._ts.push(ts);
        if (!this._focusT)
            this.setFocusToItem(ts);
        RenderManager.getIns().registRender(this);
        return this;
    };
    TweenTs.prototype.from = function (props, dur, ease) {
        if (ease === void 0) { ease = null; }
        return this;
    };
    TweenTs.prototype.wait = function (dur) {
        return this;
    };
    TweenTs.prototype.call = function (c, thisObj) {
        return this;
    };
    TweenTs._tweenMap = new Map();
    return TweenTs;
}());
__reflect(TweenTs.prototype, "TweenTs", ["IRender"]);
var nodep;
(function (nodep) {
    /**
     * 直接拷贝egret.Ease需要的函数做扩展
     */
    var Ease = (function () {
        function Ease() {
        }
        Ease.backOut = function (t) {
            return (--t * t * ((1.7 + 1) * t + 1.7) + 1);
        };
        return Ease;
    }());
    nodep.Ease = Ease;
    __reflect(Ease.prototype, "nodep.Ease");
})(nodep || (nodep = {}));
/**
 * 游戏通用的界面,继承之后可以通过GameWindow进行管理
 * 界面的缩放不影响布局效果
 * @author nodep
 * @version 1.01
 */
var GameWindow = (function (_super) {
    __extends(GameWindow, _super);
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
    function GameWindow(typeName, layerType, backgrundColor) {
        if (backgrundColor === void 0) { backgrundColor = -1; }
        var _this = _super.call(this) || this;
        //非初次加入舞台
        _this.__inited = false;
        _this.__align = "NONE";
        _this.__offsetX = 0;
        _this.__offsetY = 0;
        /***所屬層級,需要在業務中自定義*/
        _this.layerType = "";
        /**是否有遮罩,如果手动设置为有遮罩的,将会在弹出后阻挡后面的界面操作*/
        _this.pop = false;
        /**界面是否已经创建完成,只有在创建完成的界面中才不会抛空*/
        _this.created = false;
        _this._backgrundColor = -1;
        _this.needDelayRemove = 0;
        _this._backgrundColor = backgrundColor;
        _this.typeName = typeName;
        _this.layerType = layerType;
        _this.skinName = egret.getQualifiedClassName(_this) + "Skin";
        return _this;
    }
    GameWindow.prototype.partAdded = function (partName, instance) {
        instance.name = partName;
        if (partName.indexOf("helpTip_") >= 0) {
            NodepManager.getIns().addHelpTipHandler(instance);
        }
        _super.prototype.partAdded.call(this, partName, instance);
    };
    GameWindow.prototype.childrenCreated = function () {
        _super.prototype.childrenCreated.call(this);
        if (this._backgrundColor >= 0) {
            var rt = new egret.RenderTexture();
            GameWindow._backShape.graphics.clear();
            GameWindow._backShape.graphics.beginFill(this._backgrundColor);
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
    };
    GameWindow.prototype.updateSelf = function () {
    };
    /**
     *再次加入舞臺
     */
    GameWindow.prototype.reOpen = function () {
        this.visible = true;
        if (NodepConfig.auto == 1)
            this.autoScale();
        if (this._backBt) {
            this.addChildAt(this._backBt, 0);
        }
        this.resize();
        if (this.created)
            this.updateSelf();
    };
    GameWindow.prototype.addStageClose = function () {
        this.stage.addEventListener(egret.TouchEvent.TOUCH_TAP, this.autoCloseHandler, this);
    };
    GameWindow.prototype.autoCloseHandler = function (evt) {
        if (evt.target instanceof egret.Shape)
            WinsManager.getIns().closeWin(this);
    };
    /**
     * 捕获消息
     * @param  {number} updateType 消息编号
     * @param  {any} updateObject 消息体
     * @returns void
     */
    GameWindow.prototype.update = function (updateType, updateObject) {
    };
    /**
     * 关闭界面之前
     * 如果要添加关闭动画则在实现中返回false,并实现自己的关闭动画。则关闭动画完成后彻底移除。
     */
    GameWindow.prototype.beforeClose = function () {
        if (this.stage && this.stage.hasEventListener(egret.TouchEvent.TOUCH_TAP))
            this.stage.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.autoCloseHandler, this);
        if (this._backBt && this._backBt.parent) {
            this._backBt.parent.removeChild(this._backBt);
            this.needDelayRemove = 1;
        }
        return true;
    };
    /**
     * 舞台大小发生变化
     */
    GameWindow.prototype.resize = function () {
        switch (this.__align) {
            case AlignType.CENTER_STAGE:
                if (NodepConfig.auto == 1 && this.parent != null) {
                    this.parent.x = Math.floor(WinsManager.stageWidth / 2);
                    this.parent.y = Math.floor(WinsManager.stageHeight / 2);
                }
                else {
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
    };
    /**
     * 界面被激活
     * @returns void
     */
    GameWindow.prototype.active = function () {
    };
    /**
     * 设置布局
     * @param  {string} alignType 布局方式
     * @param  {number=0} offsetX x偏移量
     * @param  {number=0} offsetY y偏移量
     * @see AlignType
     */
    GameWindow.prototype.align = function (alignType, offsetX, offsetY) {
        if (offsetX === void 0) { offsetX = 0; }
        if (offsetY === void 0) { offsetY = 0; }
        this.__align = alignType;
        this.__offsetX = offsetX * this.scaleX;
        this.__offsetY = offsetY * this.scaleY;
        if (this.stage != null)
            this.resize();
    };
    /**
     * 为界面元素添加点击事件
     * @param  {any} args 需要添加事件的partID,或容器(如果是容器会为容器中的所有子对象添加事件)
     * @param  {string=""} paName args的父容器节点,只对2级容器有效。如果界面存在三级容器，请重新设计。或创建界面组件控制器
     * @see tapCallback
     */
    GameWindow.prototype.addEventTap = function (args, paName) {
        if (paName === void 0) { paName = ""; }
        if (args instanceof egret.DisplayObject) {
            args.addEventListener(egret.TouchEvent.TOUCH_TAP, this.eventTapHandler, this);
        }
        else {
            switch (typeof args) {
                case "string":
                    if (paName == "")
                        this.getChildByName(args).addEventListener(egret.TouchEvent.TOUCH_TAP, this.eventTapHandler, this);
                    else
                        this.getChildByName(paName).getChildByName(args).addEventListener(egret.TouchEvent.TOUCH_TAP, this.eventTapHandler, this);
                    break;
                case "object":
                    var key;
                    for (key in args) {
                        this[args[key]].addEventListener(egret.TouchEvent.TOUCH_TAP, this.eventTapHandler, this);
                    }
                    break;
                default:
                    throw (new Error(NodepErrorType.PARAM_TYPE_ERROR));
            }
        }
    };
    /**
     * 响应函数
     * @param  {string} childName
     * @returns void
     */
    GameWindow.prototype.tapCallback = function (childName) {
    };
    GameWindow.prototype.eventTapHandler = function (evt) {
        if (evt.currentTarget instanceof eui.Image) {
            evt.currentTarget.scaleX = evt.currentTarget.scaleY = 0.9;
            DelayCall.call(20, function handle(target) {
                target.scaleX = target.scaleY = 1;
            }, this, [evt.currentTarget]);
        }
        this.tapCallback(evt.currentTarget.name);
    };
    /**
     * 弹出界面
     * @param  {number=200} durT 经过的时间
     * @param  {number=0} fromScale 从多小或多大
     * @param {boolean=true} useBackOut 是否应用此效果
     */
    GameWindow.prototype.popup = function (durT, fromScale, useBackOut) {
        if (durT === void 0) { durT = 200; }
        if (fromScale === void 0) { fromScale = 0; }
        if (useBackOut === void 0) { useBackOut = true; }
        if (NodepConfig.auto == 1 && this.parent != null) {
            this.parent.alpha = 0;
            this.parent.scaleX = fromScale;
            this.parent.scaleY = fromScale;
            TweenTs.removeTweens(this.parent);
            TweenTs.get(this.parent).to({ alpha: 1, scaleX: 1, scaleY: 1 }, durT, useBackOut ? nodep.Ease.backOut : null);
        }
        else if (NodepConfig.auto == 0) {
            this.alpha = 0;
            this.scaleX = fromScale;
            this.scaleY = fromScale;
            TweenTs.removeTweens(this);
            TweenTs.get(this).to({ alpha: 1, scaleX: 1, scaleY: 1 }, durT, useBackOut ? nodep.Ease.backOut : null);
        }
    };
    GameWindow.prototype.popOut = function (durT, toScale) {
        if (durT === void 0) { durT = 200; }
        if (toScale === void 0) { toScale = 0; }
        if (this._backBt && this._backBt.parent) {
            this._backBt.parent.removeChild(this._backBt);
            this.needDelayRemove = 1;
        }
        this.needDelayRemove = durT;
        if (NodepConfig.auto == 1 && this.parent != null) {
            TweenTs.removeTweens(this.parent);
            TweenTs.get(this.parent).to({ alpha: 0, scaleX: toScale, scaleY: toScale }, durT);
        }
        else if (NodepConfig.auto == 0) {
            TweenTs.removeTweens(this);
            TweenTs.get(this).to({ alpha: 0, scaleX: toScale, scaleY: toScale }, durT);
        }
        return true;
    };
    /**
     * 获取某个一级输入框(TextInput)
     * @param  {string} str partID
     */
    GameWindow.prototype.getTxtInput = function (str) {
        return this.getChildByName(str);
    };
    //自动布局
    GameWindow.prototype.autoScale = function () {
        this.scaleX = WinsManager.getIns().$autoScaleX;
        this.scaleY = WinsManager.getIns().$autoScaleY;
        var trueH = this._initH * this.scaleY;
        this.height = this._initH - (trueH - this._initH) / WinsManager.getIns().$autoScaleY;
    };
    GameWindow.prototype.justScale = function () {
        this.scaleX = WinsManager.getIns().$autoScaleX;
        this.scaleY = WinsManager.getIns().$autoScaleY;
    };
    GameWindow.prototype.sound = function (sn, dt) {
        if (dt === void 0) { dt = 1000; }
        SoundManager.getIns().playSound(sn, 1, dt);
    };
    GameWindow._backShape = new egret.Shape();
    return GameWindow;
}(eui.Component));
__reflect(GameWindow.prototype, "GameWindow", ["eui.UIComponent", "egret.DisplayObject"]);
/**
 * 可视化组建基类
 * @author nodep
 * @version 1.0
 */
var GameComp = (function (_super) {
    __extends(GameComp, _super);
    /**
     * 构造函数
     * @param  {number=0} cid 可以通过index获取当前设置的值
     */
    function GameComp(cid) {
        if (cid === void 0) { cid = 0; }
        var _this = _super.call(this) || this;
        _this.created = false;
        _this.skinName = egret.getQualifiedClassName(_this) + "Skin";
        _this.index = cid;
        return _this;
    }
    /**
     * 捕获消息
     * @param  {number} updateType 消息编号
     * @param  {any} updateObject 消息体
     * @returns void
     */
    GameComp.prototype.update = function (updateType, updateObject) {
    };
    GameComp.prototype.partAdded = function (partName, instance) {
        instance.name = partName;
        if (partName.indexOf("helpTip_") >= 0) {
            NodepManager.getIns().addHelpTipHandler(instance);
        }
        _super.prototype.partAdded.call(this, partName, instance);
    };
    GameComp.prototype.childrenCreated = function () {
        _super.prototype.childrenCreated.call(this);
        this.created = true;
        this.updateSelf();
    };
    Object.defineProperty(GameComp.prototype, "data", {
        get: function () {
            return this._data;
        },
        set: function (d) {
            this._data = d;
            this.updateSelf();
        },
        enumerable: true,
        configurable: true
    });
    GameComp.prototype.updateSelf = function () {
    };
    /**
     * 为界面元素添加点击事件
     * @param  {any} args 需要添加事件的partID,或容器(如果是容器会为容器中的所有子对象添加事件)
     * @param  {string=""} paName args的父容器节点,只对2级容器有效。如果界面存在三级容器，请重新设计。或创建界面组件控制器
     * @see tapCallback
     */
    GameComp.prototype.addEventTap = function (args, paName) {
        if (paName === void 0) { paName = ""; }
        if (args instanceof egret.DisplayObject) {
            args.addEventListener(egret.TouchEvent.TOUCH_TAP, this.eventTapHandler, this);
        }
        else {
            switch (typeof args) {
                case "string":
                    if (paName == "")
                        this.getChildByName(args).addEventListener(egret.TouchEvent.TOUCH_TAP, this.eventTapHandler, this);
                    else
                        this.getChildByName(paName).getChildByName(args).addEventListener(egret.TouchEvent.TOUCH_TAP, this.eventTapHandler, this);
                    break;
                case "object":
                    var key;
                    for (key in args) {
                        this.getChildByName(args[key]).addEventListener(egret.TouchEvent.TOUCH_TAP, this.eventTapHandler, this);
                    }
                    break;
                default:
                    throw (new Error(NodepErrorType.PARAM_TYPE_ERROR));
            }
        }
    };
    /**
     * 响应函数
     * @param  {string} childName
     * @returns void
     */
    GameComp.prototype.tapCallback = function (childName) {
    };
    GameComp.prototype.eventTapHandler = function (evt) {
        if (evt.currentTarget instanceof eui.Image) {
            evt.currentTarget.scaleX = evt.currentTarget.scaleY = 0.9;
            DelayCall.call(20, function handle(target) {
                target.scaleX = target.scaleY = 1;
            }, this, [evt.currentTarget]);
        }
        this.tapCallback(evt.currentTarget.name);
    };
    return GameComp;
}(eui.Component));
__reflect(GameComp.prototype, "GameComp");
/**
 * 横向滚动容器控制器
 * egret.getQualifiedClassName(this)
 */
var HViewStack = (function () {
    function HViewStack(box) {
        this._keys = [];
        this._focusIndex = 0;
        this._box = box;
    }
    HViewStack.prototype.update = function (key, args) {
        for (var i = 0; i < this._box.numChildren; i++) {
            this._box.getChildAt(i).update(key, args);
        }
    };
    /**
     * 设置一组构造函数,必须是继承于GameComp的
     * @param  {any[]} cls
     * @returns void
     */
    HViewStack.prototype.setPages = function (cls) {
        for (var i = 0; i < cls.length; i++) {
            var k = egret.getQualifiedClassName(cls[i]);
            this._keys.push(k);
            HViewStack._pageMaker.set(k, cls[i]);
        }
    };
    HViewStack.prototype.removeAll = function () {
        this._focus = null;
        this._box.removeChildren();
    };
    /**
     * 瞬间反页到
     * @param  {number} index
     * @param  {any} data
     * @returns void
     */
    HViewStack.prototype.initPageTo = function (index, data) {
        var comp = HViewStack.getPage(this._keys[index]);
        TweenTs.removeTweens(comp);
        comp.data = data;
        if (this._focus) {
            this._box.removeChild(this._focus);
            this._focus = null;
        }
        this._focusIndex = index;
        this._focus = comp;
        comp.x = comp.y = 0;
        this._box.addChild(comp);
    };
    /**
     * 渐变的方式到达
     * @param  {number} index
     * @param  {any} data
     * @returns void
     */
    HViewStack.prototype.changeToPage = function (index, data) {
        if (!this._focus) {
            this.initPageTo(index, data);
            return;
        }
        var comp = HViewStack.getPage(this._keys[index]);
        DelayCall.removeCall("hviewDelayRemove_" + comp.hashCode);
        var tar = this._focus;
        var toX = 0;
        var idx = this._focusIndex;
        if (index > this._focusIndex) {
            TweenTs.removeTweens(comp);
            comp.x = this._box.width;
            TweenTs.get(comp).to({ x: 0 }, 400);
            comp.data = data;
            this._box.addChild(comp);
            toX = -this._box.width;
            this._focus = comp;
            this._focusIndex = index;
        }
        else if (index < this._focusIndex) {
            TweenTs.removeTweens(comp);
            comp.x = -this._box.width;
            TweenTs.get(comp).to({ x: 0 }, 400);
            comp.data = data;
            this._box.addChild(comp);
            toX = this._box.width;
            this._focus = comp;
            this._focusIndex = index;
        }
        else {
            this.initPageTo(index, data);
        }
        if (toX != 0 && this._focus != tar) {
            TweenTs.removeTweens(tar);
            TweenTs.get(tar).to({ x: toX }, 300);
            DelayCall.call(300, this.removeHandler, this, [tar], 1, "hviewDelayRemove_" + tar.hashCode);
        }
    };
    HViewStack.prototype.removeHandler = function (tg) {
        if (tg.parent)
            tg.parent.removeChild(tg);
    };
    HViewStack.getPage = function (key) {
        var cls = this._pageMaker.get(key);
        if (!this._pageMap.has(key))
            this._pageMap.set(key, new cls());
        return this._pageMap.get(key);
    };
    HViewStack._pageMaker = new Map();
    HViewStack._pageMap = new Map();
    return HViewStack;
}());
__reflect(HViewStack.prototype, "HViewStack");
/**
 * 图片配合链接
 * @version 1.0
 * @author nodep
 */
var TabBox = (function (_super) {
    __extends(TabBox, _super);
    function TabBox(w, h, setImg, unSetImg, sw) {
        if (setImg === void 0) { setImg = null; }
        if (unSetImg === void 0) { unSetImg = null; }
        if (sw === void 0) { sw = 30; }
        var _this = _super.call(this) || this;
        _this._urls = [];
        _this._imgs = [];
        _this._index = 0;
        _this._loaders = [];
        _this._showIndex = 0;
        _this._stcs = [];
        _this._setImg = null;
        _this._unsetImg = null;
        _this._sw = 0;
        _this._sw = sw;
        _this._setImg = setImg;
        _this._unsetImg = unSetImg;
        _this._w = w;
        _this._h = h;
        for (var i = 0; i < 2; i++) {
            var loader = new Loader();
            loader.width = _this._w;
            loader.height = _this._h;
            _this._loaders.push(loader);
            _this.addChild(loader);
        }
        return _this;
    }
    TabBox.prototype.setDatas = function (urls) {
        NodepUtil.listFillTo01(urls, [this._imgs, this._urls]);
        this._index = 0;
        if (this._setImg != null && this._unsetImg != null) {
            NodepUtil.fill(this._stcs, eui.Image, this._imgs.length, true, this);
        }
        var fromX = (this._w - this._stcs.length * this._sw) / 2;
        for (var i = 0; i < this._stcs.length; i++) {
            this._stcs[i].x = fromX;
            fromX += this._sw;
            this._stcs[i].y = this._h - this._sw;
        }
        this.updateShow();
    };
    TabBox.prototype.updateShow = function () {
        var si = this._showIndex % 2;
        var fl;
        var hide;
        if (si == 0) {
            fl = this._loaders[0];
            hide = this._loaders[1];
        }
        else {
            fl = this._loaders[1];
            hide = this._loaders[0];
        }
        TweenTs.removeTweens(hide);
        TweenTs.get(hide).to({ alpha: 0 }, 300);
        TweenTs.removeTweens(fl);
        TweenTs.get(fl).to({ alpha: 1 }, 300);
        fl.url = this._imgs[this._index];
        var nextIndex = this._index + 1;
        if (nextIndex >= this._imgs.length)
            nextIndex = 0;
        DelayCall.call(300, this.setLast, this, [hide, nextIndex]);
        for (var i = 0; i < this._stcs.length; i++) {
            if (this._index == i)
                this._stcs[i].source = this._setImg;
            else
                this._stcs[i].source = this._unsetImg;
        }
    };
    TabBox.prototype.setLast = function (l, str) {
        l.url = str;
    };
    TabBox.prototype.changeImg = function () {
        this._index += 1;
        if (this._index >= this._imgs.length)
            this._index = 0;
        this._showIndex++;
        this.updateShow();
    };
    TabBox.prototype.start = function (times) {
        DelayCall.call(times, this.changeImg, this, null, 0, "frameNode_tabbox" + this.hashCode, true);
        if (!this.hasEventListener(egret.TouchEvent.TOUCH_TAP))
            this.addEventListener(egret.TouchEvent.TOUCH_TAP, this.tapHandler, this);
    };
    TabBox.prototype.tapHandler = function (evt) {
        var url = this._urls[this._index];
        if (url && url != "")
            window.open(url, "_blank");
    };
    TabBox.prototype.stop = function () {
        DelayCall.removeCall("frameNode_tabbox" + this.hashCode);
        this.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.tapHandler, this);
    };
    TabBox.prototype.gc = function () {
    };
    return TabBox;
}(egret.DisplayObjectContainer));
__reflect(TabBox.prototype, "TabBox");
/**
 * 跑马灯式控制器,以eui的group为参数,以第一个child为txt。可设置右侧边距
 * @version 1.0
 * @author nodep
 */
var NoticeBar = (function () {
    function NoticeBar(g, right) {
        this._txts = [];
        this._urls = [];
        this._index = 0;
        this._durT = 0;
        this._hash = 0;
        this._hash = Math.random();
        this._g = g;
        this._label = this._g.getChildAt(0);
        this._label.text = "";
        this._right = this._g.width - right;
        this._left = this._label.x;
        var rect = new eui.Rect(this._right - this._left, this._g.height, 0);
        rect.x = this._left;
        this._g.addChild(rect);
        this._label.mask = rect;
    }
    NoticeBar.prototype.setDatas = function (urls) {
        NodepUtil.listFillTo01(urls, [this._txts, this._urls]);
        this._index = 0;
    };
    NoticeBar.prototype.playOne = function () {
        DelayCall.removeCall("frameNodep_noticeBar" + this._hash);
        var tx = this._txts[this._index];
        this._label.text = tx;
        this._label.x = this._right;
        DelayCall.call(1, this.startPlay, this, null, 1, "frameworknoticeBar" + this._g.hashCode, true);
    };
    NoticeBar.prototype.startPlay = function () {
        var needT = (this._right - this._left + this._label.textWidth) / (this._right - this._left) * this._durT;
        if (needT < this._durT) {
            needT = this._durT;
        }
        TweenTs.removeTweens(this._label);
        TweenTs.get(this._label).to({ x: this._left / 2 - this._label.textWidth }, needT);
        DelayCall.call(needT + 1000, this.nextOne, this, null, 1, "frameNodep_noticeBar" + this._hash);
    };
    NoticeBar.prototype.nextOne = function () {
        this._index++;
        if (this._index >= this._txts.length)
            this._index = 0;
        this.playOne();
    };
    NoticeBar.prototype.tapHandler = function (evt) {
        var url = this._urls[this._index];
        if (url && url != "")
            window.open(url, "_blank");
    };
    NoticeBar.prototype.start = function (t) {
        if (t === void 0) { t = 8000; }
        this._durT = t;
        this.playOne();
        if (!this._g.hasEventListener(egret.TouchEvent.TOUCH_TAP))
            this._g.addEventListener(egret.TouchEvent.TOUCH_TAP, this.tapHandler, this);
    };
    NoticeBar.prototype.stop = function () {
        TweenTs.removeTweens(this._label);
        DelayCall.removeCall("frameworknoticeBar" + this._g.hashCode);
        DelayCall.removeCall("frameNodep_noticeBar" + this._hash);
        this._g.addEventListener(egret.TouchEvent.TOUCH_TAP, this.tapHandler, this);
    };
    return NoticeBar;
}());
__reflect(NoticeBar.prototype, "NoticeBar");
/**
 * 框架的基础配置文件,可通过window属性进行更改
 * @author nodep
 * @version 1.0;
 */
var NodepConfig = (function () {
    function NodepConfig() {
    }
    /**
     * 设置启动参数
     * @returns void
     */
    NodepConfig.init = function () {
        var configs = ["isTest", "isDebug", "bgVolume", "appMode", "auto"];
        for (var i = 0; i < configs.length; i++) {
            if (window.hasOwnProperty(configs[i]))
                this[configs[i]] = window[configs[i]];
        }
        LogTrace.log("init args set:" + configs.toString());
    };
    /**是否属于测试 */
    NodepConfig.isTest = 0;
    /**是否打印 */
    NodepConfig.isDebug = 0;
    /**音乐默认大小 */
    NodepConfig.bgVolume = 0.1;
    /**是否属于app模式 */
    NodepConfig.appMode = 1;
    /**是否自动布局 */
    NodepConfig.auto = 1;
    return NodepConfig;
}());
__reflect(NodepConfig.prototype, "NodepConfig");
/**
 * 回调对象
 */
var CallBackVO = (function () {
    /**
     * 构造一个存放回调函数的对象
     * @param  {Function} callBack
     * @param  {any} thisObj
     * @param  {any[]=null} args
     */
    function CallBackVO(callBack, thisObj, args) {
        if (args === void 0) { args = null; }
        this.args = null;
        this.callBack = callBack;
        this.thisObj = thisObj;
        this.args = args;
    }
    /**
     * 执行调用
     * @param  {boolean=true} clear
     * @returns void
     */
    CallBackVO.prototype.call = function (clear) {
        if (clear === void 0) { clear = true; }
        if (this.callBack != null && this.thisObj != null) {
            this.callBack.apply(this.thisObj, this.args);
        }
        if (clear) {
            this.callBack = null;
            this.thisObj = null;
        }
    };
    return CallBackVO;
}());
__reflect(CallBackVO.prototype, "CallBackVO");
/**
 * 对齐方式
 * @author nodep
 */
var AlignType = (function () {
    function AlignType() {
    }
    AlignType.TOP_LEFT = "TOP_LEFT";
    AlignType.TOP_CENTER = "TOP_CENTER";
    AlignType.TOP_RIGHT = "TOP_RIGHT";
    AlignType.CENTER = "CENTER";
    AlignType.BOTTOM_LEFT = "BOTTOM_LEFT";
    AlignType.BOTTOM_CENTER = "BOTTOM_CENTER";
    AlignType.BOTTOM_RIGHT = "BOTTOM_RIGHT";
    AlignType.NONE = "NONE";
    AlignType.CENTER_STAGE = "CENTER_STAGE";
    return AlignType;
}());
__reflect(AlignType.prototype, "AlignType");
/**
 * 层级常量
 *@author nodep
 */
var LayerType = (function () {
    function LayerType() {
    }
    /**場景層*/
    LayerType.LAYER_GROUND = "LAYER_GROUND";
    /**战斗 */
    LayerType.LAYER_BATTLE = "LAYER_BATTLE";
    /**导航界面层 */
    LayerType.LAYER_MENU = "LAYER_MENU";
    /**UI层*/
    LayerType.LAYER_UI = "LAYER_UI";
    /**弹出层*/
    LayerType.LAYER_POP = "LAYER_POP";
    /**提示层 */
    LayerType.LAYER_TIP = "LAYER_TIP";
    return LayerType;
}());
__reflect(LayerType.prototype, "LayerType");
/**
 * 错误类型
 * @author nodep
 */
var NodepErrorType = (function () {
    function NodepErrorType() {
    }
    NodepErrorType.LAYER_NO_EXISTENT = "LAYER_NO_EXISTENT";
    NodepErrorType.PARAM_TYPE_ERROR = "PARAM_TYPE_ERROR";
    NodepErrorType.ERROR_CODE = "ERROR_CODE";
    NodepErrorType.NO_ALREADY_EXIST = "NO_ALREADY_EXIST";
    return NodepErrorType;
}());
__reflect(NodepErrorType.prototype, "NodepErrorType");
/**
 * Alpha闪烁效果
 * @author nodep
 * @version 1.2 增加自动山所事件
 */
var AlphaRender = (function () {
    /**
     * @param  {egret.DisplayObject} dis 目标显示对象
     * @param  {number=50} durTime 多少毫秒变化一次
     * @param  {number=0.1} arg 一次变化多少透明度
     */
    function AlphaRender(dis, durTime, arg) {
        if (durTime === void 0) { durTime = 50; }
        if (arg === void 0) { arg = 0.1; }
        this._id = 0;
        this._lastDurT = 0;
        this._id = AlphaRender._stepId;
        AlphaRender._stepId++;
        this._target = dis;
        this._startArg = dis.alpha;
        this._arg = arg;
        this._durTime = durTime;
    }
    AlphaRender.createApr = function (target, durTime, arg) {
        if (durTime === void 0) { durTime = 50; }
        if (arg === void 0) { arg = 0.1; }
        if (this._rds.has(target))
            return;
        var rd = new AlphaRender(target, durTime, arg);
        this._rds.set(target, rd);
    };
    /**
     * 开始对某个对象进行闪烁
     * @param  {egret.DisplayObject} target
     * @param  {number=0} autoStop
     * @returns void
     */
    AlphaRender.startStatic = function (target, autoStop, durTime, arg) {
        if (autoStop === void 0) { autoStop = 0; }
        if (durTime === void 0) { durTime = 50; }
        if (arg === void 0) { arg = 0.1; }
        this.createApr(target, durTime, arg);
        var apr = this._rds.get(target);
        apr.start(autoStop);
    };
    /**
     * 停止某个对象的闪烁
     * @param  {egret.DisplayObject} target
     * @returns void
     */
    AlphaRender.stopStatic = function (target) {
        var apr = this._rds.get(target);
        if (apr)
            apr.stop();
    };
    AlphaRender.prototype.renderUpdate = function (interval) {
        this._lastDurT += interval;
        if (this._lastDurT < this._durTime)
            return;
        this._lastDurT = 0;
        if (this._arg > 0 && this._target.alpha > 1)
            this._arg = -this._arg;
        else if (this._arg < 0 && this._target.alpha <= 0)
            this._arg = -this._arg;
        this._target.alpha += this._arg;
    };
    /**
     * 开始闪烁,需要手动调用
     * @returns void
     */
    AlphaRender.prototype.start = function (autoStop) {
        if (autoStop === void 0) { autoStop = 0; }
        RenderManager.getIns().registRender(this);
        if (autoStop > 0) {
            DelayCall.call(autoStop, this.stopSelf, this, null, 1, "framework_nodep_aloharender_" + this._id, true);
        }
    };
    AlphaRender.prototype.stopSelf = function () {
        this.stop();
    };
    /**
     * 暂停闪烁并将透明度改变为最初的状态
     * @returns void
     */
    AlphaRender.prototype.stop = function () {
        DelayCall.removeCall("framework_nodep_aloharender_" + this._id);
        RenderManager.getIns().unregistRender(this);
        this._target.alpha = this._startArg;
    };
    /**
     * 停止闪烁并销毁并将透明度改变为最初的状态
     * @returns void
     */
    AlphaRender.prototype.dispose = function () {
        RenderManager.getIns().unregistRender(this);
        this._target.alpha = this._startArg;
        this._target = null;
    };
    AlphaRender._stepId = 0;
    AlphaRender._rds = new Map();
    return AlphaRender;
}());
__reflect(AlphaRender.prototype, "AlphaRender", ["IRender"]);
/**
 * 淡出淡入效果,tween的替代实验类
 * @author nodep
 * @version 1.0
 */
var FadeEffect = (function () {
    function FadeEffect(target, durT, callBack, thisObj, to) {
        if (to === void 0) { to = 0; }
        this._target = target;
        this._from = this._target.alpha;
        this._to = to;
        this._bt = this._to - this._from;
        this._callBack = callBack;
        this._thisObj = thisObj;
        this._durT = durT;
        this._turnT = 0;
        RenderManager.getIns().registRender(this);
    }
    FadeEffect.prototype.renderUpdate = function (interval) {
        this._turnT += interval;
        this._target.alpha = this._from + this._bt * this._turnT / this._durT;
        if (this._turnT >= this._durT) {
            this._target.alpha = this._to;
            RenderManager.getIns().unregistRender(this);
            if (this._callBack != null && this._thisObj != null)
                this._callBack.apply(this._thisObj);
        }
    };
    /**
     * 淡入
     * @param  {egret.DisplayObject} target 显示对象
     * @param  {number} durT 总时间毫秒
     * @param  {Function} callBack 完成时的回调函数
     * @param  {any} thisObj
     * @returns void
     */
    FadeEffect.fadeIn = function (target, durT, callBack, thisObj) {
        new FadeEffect(target, durT, callBack, thisObj, 1);
    };
    /**
     * 淡出
     * @param  {egret.DisplayObject} target 显示对象
     * @param  {number} durT 总时间毫秒
     * @param  {Function} callBack 完成时的回调函数
     * @param  {any} thisObj
     * @returns void
     */
    FadeEffect.fadeOut = function (target, durT, callBack, thisObj) {
        new FadeEffect(target, durT, callBack, thisObj, 0);
    };
    return FadeEffect;
}());
__reflect(FadeEffect.prototype, "FadeEffect", ["IRender"]);
/**
 * 资源组加载器,这里同时只允许加载一组
 * @author nodep
 * @version 1.2
 */
var GroupResManager = (function () {
    function GroupResManager() {
        //--------------加载信息--------------
        //当前正在加载的groups
        this._loadingGroups = [];
        //当前正在加载的group的加载信息
        this._loadingMap = new Map();
        //需要显示loading条的加载组
        this._showBars = [];
    }
    GroupResManager.getIns = function () {
        if (!GroupResManager._ins)
            GroupResManager._ins = new GroupResManager();
        return GroupResManager._ins;
    };
    /**
     * 注册加载时的进度条
     * @param  {string} winName 加载条界面名称
     * @param  {number} progressUpdateType 进度通知消息编号
     * @param  {any} loadingWindow 显示对象构造函数
     * @returns void
     */
    GroupResManager.prototype.registLoadingWindow = function (winName, progressUpdateType, loadingWindow) {
        this._winName = winName;
        this._progressUpdateType = progressUpdateType;
        this._loadingWindow = loadingWindow;
        RES.setMaxRetryTimes(2);
        RES.setMaxLoadingThread(3);
    };
    /**
     * 加载资源组
     * @param  {string} sname 组名称
     * @param  {Function} callBack 加载完成的回调函数
     * @param  {any} thisObj
     * @param  {boolean=true} showBar 是否显示加载进度条
     * @returns void
     */
    GroupResManager.prototype.loadGroup = function (gname, callBack, thisObj, showBar, prio, args) {
        if (showBar === void 0) { showBar = true; }
        if (prio === void 0) { prio = 0; }
        if (args === void 0) { args = null; }
        var vo = new CallBackVO(callBack, thisObj, args);
        if (RES.isGroupLoaded(gname)) {
            vo.call();
            return;
        }
        this._loadingMap.set(gname, vo);
        var needEvents = this._loadingGroups.length == 0;
        var needLoad = true;
        if (this._loadingGroups.indexOf(gname) < 0) {
            this._loadingGroups.push(gname);
            needLoad = true;
        }
        else {
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
    };
    /**
     * 资源组加载完成
     */
    GroupResManager.prototype.onResourceLoadComplete = function (event) {
        var gname = event.groupName;
        var index = this._loadingGroups.indexOf(gname);
        if (index >= 0)
            this._loadingGroups.splice(index, 1);
        var vo = this._loadingMap.get(gname);
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
    };
    /**
     * 资源组加载出错
     */
    GroupResManager.prototype.onItemLoadError = function (event) {
        console.warn("Url:" + event.resItem.url + " has failed to load");
    };
    /**
     * 资源组加载出错
     */
    GroupResManager.prototype.onResourceLoadError = function (event) {
        console.warn("Group:" + event.groupName + " has failed to load");
        this.onResourceLoadComplete(event);
    };
    /**
     * 资源组加载进度
     */
    GroupResManager.prototype.onResourceProgress = function (event) {
        WinsManager.getIns().updateWin(this._progressUpdateType, [this._winName], [event.itemsLoaded, event.itemsTotal]);
    };
    return GroupResManager;
}());
__reflect(GroupResManager.prototype, "GroupResManager");
/**
 * 日志输出
 * @author nodep
 * @version 1.0
 */
var LogTrace = (function () {
    function LogTrace() {
    }
    /**
     * 输出字符串
     * @param  {any} str
     * @returns void
     */
    LogTrace.log = function (str) {
        if (NodepConfig.isDebug == 1)
            console.log(str);
    };
    /**
     * 输出当前系统时间
     * @returns void
     */
    LogTrace.logTime = function () {
        if (NodepConfig.isDebug == 1)
            console.log("time:" + (new Date()).getTime());
    };
    LogTrace.errorInfo = function (str) {
        console.log("warnInfo:" + str);
    };
    return LogTrace;
}());
__reflect(LogTrace.prototype, "LogTrace");
/**
 * 一些不常用但必须有的功能集合的临时位置
 * 针对tip进行自动化与国际化预留
 * @author nodep
 * @version 1.1
 */
var NodepManager = (function () {
    function NodepManager() {
        /**当前是否激活,已由Render控制,也可通过对active事件监听并进行控制 */
        this.isActive = true;
        this._colorFlilter = new egret.ColorMatrixFilter([
            0.3, 0.6, 0, 0, 0,
            0.3, 0.6, 0, 0, 0,
            0.3, 0.6, 0, 0, 0,
            0, 0, 0, 1, 0
        ]);
        this._colorFlilter2 = new egret.ColorMatrixFilter([
            0.15, 0.3, 0, 0, 0,
            0.15, 0.3, 0, 0, 0,
            0.15, 0.3, 0, 0, 0,
            0, 0, 0, 1, 0
        ]);
        this._infoTMap = new Map();
        this._tipInit = false;
    }
    NodepManager.getIns = function () {
        if (NodepManager._ins == null)
            NodepManager._ins = new NodepManager();
        return NodepManager._ins;
    };
    NodepManager.prototype.regsitErrorOkHandler = function (okHandler, errorHandler, ht) {
        this._okHandler = okHandler;
        this._errorHandler = errorHandler;
        this._ht = ht;
    };
    /**
     * 粗暴的错误信息提示
     * @param  {string} str
     * @returns void
     */
    NodepManager.prototype.errorInfo = function (str) {
        if (this._infoTMap.get(str) != null && egret.getTimer() < this._infoTMap.get(str))
            return;
        if (this._errorHandler != null) {
            this._infoTMap.set(str, egret.getTimer() + 500);
            this._errorHandler.apply(this._ht, [str]);
        }
    };
    /**
     * 未实现
     * @param  {string} str
     * @returns void
     */
    NodepManager.prototype.okInfo = function (str) {
        if (this._okHandler != null)
            this._okHandler.apply(this._ht, [str]);
    };
    /**
     * 设置为灰色或重置
     * @param  {egret.DisplayObject} target
     * @param  {boolean} flag
     */
    NodepManager.prototype.setGrey = function (target, flag) {
        if (flag)
            target.filters = [this._colorFlilter];
        else
            target.filters = null;
    };
    /**
     * 设置为半灰色或重置
     * @param  {egret.DisplayObject} target
     * @param  {boolean} flag
     */
    NodepManager.prototype.setGreyHalf = function (target, flag) {
        if (flag)
            target.filters = [this._colorFlilter2];
        else
            target.filters = null;
    };
    /**
     * 注册tip的回调函数
     * @param  {Function} callBack
     * @param  {any} thisObj
     * @returns void
     */
    NodepManager.prototype.registTipHandler = function (callBack, thisObj, tipJsonName) {
        if (tipJsonName === void 0) { tipJsonName = "description_json"; }
        this._tipCallBack = callBack;
        this._tipThisObj = thisObj;
        this._tipJsonName = tipJsonName;
        if (!this._tipInit) {
            this._tipInit = true;
            this._tipObj = RES.getRes(this._tipJsonName);
        }
    };
    /**获取tip,必须以helpTip_n的方式从description_json的help对象中获取数组.
     * @param  {string} name
     */
    NodepManager.prototype.getTip = function (name) {
        if (!this._tipInit) {
            this._tipInit = true;
            this._tipObj = RES.getRes(this._tipJsonName);
        }
        if (name.indexOf("helpTip_") >= 0) {
            return this._tipObj[name.split("_")[1]];
        }
        return "";
    };
    /**
     * 为某个对象添加help点击事件
     * @param  {egret.DisplayObject} target
     */
    NodepManager.prototype.addHelpTipHandler = function (target) {
        target.addEventListener(egret.TouchEvent.TOUCH_TAP, this.helpTapHandler, this);
    };
    NodepManager.prototype.helpTapHandler = function (evt) {
        var tname = evt.target.name;
        var tipStr = this.getTip(tname);
        if (this._tipCallBack != null && this._tipThisObj != null)
            this._tipCallBack.apply(this._tipThisObj, [tipStr, evt.target]);
    };
    return NodepManager;
}());
__reflect(NodepManager.prototype, "NodepManager");
/**
 * 游戏主循环控制器
 * @see registRender,unregistRender,IRender
 * @author nodep
 * @version 1.2
 */
var RenderManager = (function () {
    function RenderManager() {
        RenderManager._renderList = new Array();
    }
    RenderManager.getIns = function () {
        if (!this._ins)
            this._ins = new RenderManager();
        return this._ins;
    };
    RenderManager.prototype.startRender = function (stage) {
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
    };
    RenderManager.enterFrameHandler = function (evt, isTimered) {
        if (isTimered === void 0) { isTimered = false; }
        var key;
        var t = egret.getTimer();
        var interval = t - RenderManager._lastTime;
        var trueT = interval;
        if (interval > RenderManager._frameTime)
            RenderManager._bzCount += interval - RenderManager._frameTime;
        RenderManager._lastTime = t;
        var renderT = interval;
        var flag = false;
        // if (renderT >= RenderManager._frameTime)
        // 	renderT = RenderManager._frameTime;
        do {
            var needBz = true;
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
        } while (flag);
        if ((trueT >= 1300 && !NodepManager.getIns().isActive) || (!NodepManager.getIns().isActive && trueT >= 1000 && egret.Capabilities.isMobile)) {
            if (!RenderManager._nodepTimered) {
                RenderManager._nodepTimered = true;
                if (!RenderManager._iframe) {
                    var duration = 0.03333; /* 1s */
                    RenderManager._iframe = document.createElement('iframe');
                    RenderManager._iframe.id = "nodepTimer";
                    RenderManager._iframe.style.display = 'none';
                    RenderManager._iframe.src = 'data:text/html,%3C%21DOCTYPE%20html%3E%0A%3Chtml%3E%0A%3Chead%3E%0A%09%3Cmeta%20charset%3D%22utf-8%22%20%2F%3E%0A%09%3Cmeta%20http-equiv%3D%22refresh%22%20content%3D%22' + duration + '%22%20id%3D%22metarefresh%22%20%2F%3E%0A%09%3Ctitle%3Ex%3C%2Ftitle%3E%0A%3C%2Fhead%3E%0A%3Cbody%3E%0A%09%3Cscript%3Etop.postMessage%28%27refresh%27%2C%20%27%2A%27%29%3B%3C%2Fscript%3E%0A%3C%2Fbody%3E%0A%3C%2Fhtml%3E';
                }
                document.body.insertBefore(RenderManager._iframe, document.body.childNodes[0]);
            }
        }
        if (!isTimered && RenderManager._nodepTimered) {
            if (t - RenderManager._lastTimeredTime < 1300) {
                var target = document.getElementById("nodepTimer");
                document.body.removeChild(document.getElementById("nodepTimer"));
                RenderManager._nodepTimered = false;
                WinsManager.getIns().globActive();
            }
            RenderManager._lastTimeredTime = t;
        }
    };
    /**
     * 启动
     * @param  {IRender} render
     */
    RenderManager.prototype.registRender = function (render) {
        if (RenderManager._renderList.indexOf(render) >= 0)
            return;
        RenderManager._renderList.push(render);
    };
    /**
     * 移除
     * @param  {IRender} render
     */
    RenderManager.prototype.unregistRender = function (render) {
        var indexN = RenderManager._renderList.indexOf(render);
        if (indexN >= 0) {
            RenderManager._renderList.splice(indexN, 1);
        }
    };
    RenderManager._lastTime = 0;
    RenderManager._frameTime = 1000 / 60;
    RenderManager._nodepTimered = false;
    RenderManager._lastTimeredTime = 0;
    RenderManager.frameRate = 60;
    RenderManager._bzCount = 0;
    return RenderManager;
}());
__reflect(RenderManager.prototype, "RenderManager");
/**
 * 适配器for Safari
 * @author nodep
 * @version 1.0
 */
var ScreenManager = (function () {
    function ScreenManager(ui) {
        if (navigator.userAgent.toLowerCase().indexOf("safari") < 0 || !egret.Capabilities.isMobile)
            return;
        if (ui.stage.orientation != egret.OrientationMode.LANDSCAPE)
            return;
        ScreenManager._baseUI = ui;
        window.addEventListener("resize", this.windowResizeHandler);
        this.windowResizeHandler(null);
    }
    ScreenManager.prototype.windowResizeHandler = function (evt) {
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
    };
    return ScreenManager;
}());
__reflect(ScreenManager.prototype, "ScreenManager");
/**
 * 声音管理器
 * @author nodep
 * @version 1.1
 */
var SoundManager = (function () {
    function SoundManager() {
        this._nowBg = "";
        this.enable = false;
        this._durTDic = new Map();
        this._soundDic = new Map();
    }
    SoundManager.getIns = function () {
        if (SoundManager._ins == null)
            SoundManager._ins = new SoundManager();
        return SoundManager._ins;
    };
    /**
     * 播放背景音乐
     * @param  {string} mp3 xxx_mp3
     * @param  {number=0} times 播放次数,默认循环
     */
    SoundManager.prototype.playBg = function (mp3, times) {
        if (times === void 0) { times = 0; }
        if (this._nowBg == mp3 || (!this.enable && mp3 != ""))
            return;
        this._nowBg = mp3;
        if (this._bgC) {
            TweenTs.removeTweens(this._bgC);
            try {
                this._bgC.stop();
            }
            catch (e) {
            }
        }
        var sd = RES.getRes(mp3);
        if (!sd)
            return;
        this._bgC = sd.play(0, times);
        if (this._bgC == null)
            return;
        this._bgC.volume = 0;
        TweenTs.get(this._bgC).to({ volume: NodepConfig.bgVolume }, 3000);
    };
    /**
     * 循环播放音效
     * @param  {string} mp3 xxx_mp3
     * @param  {number=1} toV
     */
    SoundManager.prototype.playSoundLoop = function (mp3, toV) {
        if (toV === void 0) { toV = 1; }
        if (!this.enable || !NodepManager.getIns().isActive)
            return;
        if (this._soundDic.get(mp3) != null)
            return;
        var sd = RES.getRes(mp3);
        if (!sd)
            return;
        var cc = sd.play(0, 0);
        if (cc == null)
            return;
        cc.volume = toV;
        this._soundDic.set(mp3, cc);
    };
    /**
     * 停止循环音效的播放
     * @param  {string} mp3
     */
    SoundManager.prototype.stopSoundLoop = function (mp3) {
        if (this._soundDic.get(mp3) == null)
            return;
        var cc = this._soundDic.get(mp3);
        cc.stop();
        this._soundDic.delete(mp3);
    };
    /**
     * 播放音效
     * @param  {string} mp3 音效名称 xxx_mp3
     * @param  {number=1} toV 音效大小
     * @param  {number=0} durT 多长时间以内不能再次播放次音效
     */
    SoundManager.prototype.playSound = function (mp3, toV, durT) {
        if (toV === void 0) { toV = 1; }
        if (durT === void 0) { durT = 0; }
        if (!this.enable || !NodepManager.getIns().isActive)
            return;
        if (durT > 0) {
            if (this._durTDic.get(mp3) == null)
                this._durTDic.set(mp3, 0);
            var t = new Date().getTime();
            if (t - this._durTDic.get(mp3) < durT)
                return;
            this._durTDic.set(mp3, t);
        }
        var sd = RES.getRes(mp3);
        if (!sd)
            return;
        var cc = sd.play(0, 1);
        if (cc == null)
            return;
        cc.volume = toV;
    };
    return SoundManager;
}());
__reflect(SoundManager.prototype, "SoundManager");
/**
 * 界面管理
 * 添加打开或关闭界面的方法:如果界面已打开,则进行关闭
 * @author nodep
 * @version 1.01;
 */
var WinsManager = (function () {
    function WinsManager() {
        this.$autoScaleX = 1;
        this.$autoScaleY = 1;
        if (WinsManager._ins != null)
            throw (new Error(NodepErrorType.ERROR_CODE));
        this._layerMap = new Map();
        this._windowMap = new Map();
    }
    WinsManager.getIns = function () {
        if (!WinsManager._ins)
            WinsManager._ins = new WinsManager();
        return WinsManager._ins;
    };
    /**
     * 整个框架的初始化入口
     * @param  {eui.UILayer} ui
     * @returns void
     */
    WinsManager.prototype.initGame = function (ui) {
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
    };
    WinsManager.prototype.addLayer = function (layerName, layer, endable) {
        if (endable === void 0) { endable = true; }
        if (!endable)
            layer.touchEnabled = layer.touchChildren = endable;
        this._layerMap.set(layerName, layer);
        this._baseUi.addChild(layer);
        LogTrace.log("add layer:" + layerName);
    };
    /**
     * 开启或关闭窗口
     * @param  {any} cls 类名
     * @returns void
     */
    WinsManager.prototype.switchWin = function (cls) {
        if (!this._windowMap.has(cls))
            this._windowMap.set(cls, new cls());
        var win = this._windowMap.get(cls);
        if (win.stage == null)
            this.openWindow(cls);
        else
            this.closeWin(cls);
    };
    /**
     * 某个界面是否在舞台上
     * @param  {any} cls 类名
     * @returns boolean
     */
    WinsManager.prototype.isInStage = function (cls) {
        if (!this._windowMap.has(cls))
            return false;
        var win = this._windowMap.get(cls);
        return win.parent != null;
    };
    /**
     * app模式的预加载,并不会打开,优先级低,在执行openWindow时,将优先级提高
     * 此优先级的不会占用加载显示
     * @param  {any} cls
     * @returns void
     */
    WinsManager.prototype.preOpenWindow = function (cls) {
        var gName = NoAppResCenter.getGroupName(cls);
        if (gName != null)
            GroupResManager.getIns().loadGroup(gName, null, null, false, -1);
    };
    /**
     * 打开一个界面
     * @param  {any} cls
     * @param  {boolean=false} clearLayer
     * @param  {number=0} index
     * @returns void
     */
    WinsManager.prototype.openWindow = function (cls, clearLayer, index, showLoading) {
        if (clearLayer === void 0) { clearLayer = false; }
        if (index === void 0) { index = 0; }
        if (showLoading === void 0) { showLoading = true; }
        if (!cls)
            return;
        var gName = NoAppResCenter.getGroupName(cls);
        if (NodepConfig.appMode == 1 && gName != null) {
            GroupResManager.getIns().loadGroup(gName, this.readyOpen, this, showLoading, 0, [cls, clearLayer, index]);
        }
        else {
            LogTrace.log("not app , mode=" + NodepConfig.appMode + " gName=" + gName);
            this.readyOpen(cls, clearLayer, index);
        }
    };
    WinsManager.prototype.readyOpen = function (cls, clearLayer, index) {
        if (clearLayer === void 0) { clearLayer = false; }
        if (index === void 0) { index = 0; }
        var gName = egret.getQualifiedClassName(cls);
        if (!this._windowMap.has(cls))
            this._windowMap.set(cls, new cls());
        var win = this._windowMap.get(cls);
        var flag = DelayCall.removeCall("removeWin:self_frameworkForNode" + win.hashCode);
        if (!win.stage) {
            if (this._layerMap.has(win.layerType)) {
                if (clearLayer)
                    this._layerMap.get(win.layerType).clearLayer();
                this._layerMap.get(win.layerType).addWindow(win, index);
                LogTrace.log("openWindow->" + win.typeName + "->" + gName + ":" + win.hashCode);
            }
            else {
                throw (new Error(NodepErrorType.LAYER_NO_EXISTENT));
            }
        }
        else {
            if (flag) {
                win.reOpen();
            }
        }
    };
    /**
     * 将界面打开到某个层
     * @param  {any} cls
     * @param  {string} layerType
     * @returns void
     */
    WinsManager.prototype.openWindowToLayer = function (cls, layerType) {
        if (!this._windowMap.has(cls))
            this._windowMap.set(cls, new cls());
        var win = this._windowMap.get(cls);
        if (!win.stage) {
            if (this._layerMap.has(layerType)) {
                this._layerMap.get(layerType).addWindow(win, 0);
                LogTrace.log("openWindow->" + win.typeName);
            }
            else {
                throw (new Error(NodepErrorType.LAYER_NO_EXISTENT));
            }
        }
    };
    /**
     * 关闭界面
     * @param  {any} target
     * @returns void
     */
    WinsManager.prototype.closeWin = function (target) {
        if (!target)
            return;
        var win = null;
        switch (typeof target) {
            case "object":
                win = target;
                break;
            case "string"://暂时不支持
                break;
            case "function":
                win = this._windowMap.get(target);
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
    };
    WinsManager.prototype.removeWinReady = function (win) {
        LogTrace.log("closeWin:" + win.hashCode);
        if (!win.parent)
            return;
        if (NodepConfig.auto == 1) {
            win.parent.parent.removeWindow(win);
        }
        else {
            win.parent.removeWindow(win);
        }
    };
    /**
     * 发送通知消息到指定的界面集合
     * @param  {number} updateType 消息编号
     * @param  {Array<string>} typeNames 需要接受通知的界面
     * @param  {any=null} updateData 消息体,绝大部分时候都应该是null,因为未打开的界面是接受不到消息的
     * @returns void
     */
    WinsManager.prototype.updateWin = function (updateType, typeNames, updateData) {
        if (updateData === void 0) { updateData = null; }
        this._windowMap.forEach(function (win) {
            if (typeNames.indexOf(win.typeName) >= 0 && win.stage != null)
                win.update(updateType, updateData);
        }, this);
    };
    /**
     * 界面被唤醒
     * @returns void
     */
    WinsManager.prototype.globActive = function () {
        this._windowMap.forEach(function (win) {
            if (win.stage != null)
                win.active();
        }, this);
    };
    /**
     * 发送通知到当前所有打开的界面
     * @param  {number} updateType
     * @param  {any} updateData
     * @returns void
     */
    WinsManager.prototype.globalUpdate = function (updateType, updateData) {
        this._windowMap.forEach(function (win) {
            if (win.stage != null)
                win.update(updateType, updateData);
        }, this);
    };
    WinsManager.prototype.stageResizeHandler = function (evt) {
        WinsManager.stageWidth = this._baseUi.stage.stageWidth;
        WinsManager.stageHeight = this._baseUi.stage.stageHeight;
        this.autoScale();
        this._layerMap.forEach(function (layer) {
            layer.resize();
        }, this);
    };
    WinsManager.prototype.autoScale = function () {
        if (NodepConfig.auto == 1) {
            var sx = WinsManager.stageWidth / window.innerWidth;
            var sy = WinsManager.stageHeight / window.innerHeight;
            if (sy >= sx && window.innerWidth < window.innerHeight)
                this.$autoScaleY = sy / sx;
            else
                this.$autoScaleY = 1;
            this._layerMap.forEach(function (layer) {
                layer.autoScale();
            }, this);
        }
    };
    /**
     * 回收制定的界面
     * @param  {any} key
     * @returns void
     */
    WinsManager.prototype.gcWindow = function (key) {
    };
    /**
     * 回收所有当前不在舞台的界面
     * @returns void
     */
    WinsManager.prototype.gcWindowAll = function () {
    };
    /**
     * 获取当前游戏的舞台
     * @returns egret
     */
    WinsManager.prototype.gameStage = function () {
        if (this._baseUi != null)
            return this._baseUi.stage;
        else
            return null;
    };
    WinsManager.stageWidth = 0;
    WinsManager.stageHeight = 0;
    return WinsManager;
}());
__reflect(WinsManager.prototype, "WinsManager");
var nodep;
(function (nodep) {
    var TweenItem = (function () {
        function TweenItem(t) {
            this.type = t;
        }
        TweenItem.prototype.dispose = function () {
            this.props = null;
            this.ease = null;
        };
        return TweenItem;
    }());
    nodep.TweenItem = TweenItem;
    __reflect(TweenItem.prototype, "nodep.TweenItem");
})(nodep || (nodep = {}));
/**
 * 事件调度
 * @author nodep
 * @version 1.0
 */
var EventDispatcher = (function () {
    function EventDispatcher() {
    }
    EventDispatcher.regist = function (type, handler, thisObj) {
        if (!this._lis.has(type))
            this._lis.set(type, []);
        var lis = this._lis.get(type);
        lis.push([handler, thisObj]);
    };
    EventDispatcher.unregist = function (type, handler, thisObj) {
        var lis = this._lis.get(type);
        if (!lis)
            return;
        for (var i = 0; i < lis.length; i++) {
            if (lis[i][0] == handler && lis[i][1] == thisObj) {
                lis.splice(i, 1);
                break;
            }
        }
    };
    EventDispatcher.dispatch = function (type, args) {
        if (args === void 0) { args = null; }
        var lis = this._lis.get(type);
        if (!lis)
            return;
        for (var i = 0; i < lis.length; i++) {
            lis[i][0].apply(lis[i][1], args);
        }
    };
    EventDispatcher._lis = new Map();
    return EventDispatcher;
}());
__reflect(EventDispatcher.prototype, "EventDispatcher");
/**
 * 临时加载的资源中心
 * @version 1.0
 * @author nodep
 */
var SynResCenter = (function () {
    function SynResCenter() {
    }
    /**
     * 获取一个图片资源
     * @param  {string} url
     * @returns egret
     */
    SynResCenter.getBitmapData = function (url) {
        return this._btds.get(url);
    };
    /**
     * 是否有某个图片
     * @param  {string} url
     * @returns boolean
     */
    SynResCenter.hasBtd = function (url) {
        return this._btds.has(url);
    };
    /**
     * 获取某个位图数据
     * @param  {string} url
     * @param  {egret.BitmapData} btd
     * @returns void
     */
    SynResCenter.setBitmapData = function (url, btd) {
        this._btds.set(url, btd);
    };
    SynResCenter.setBitmapDataAsHeadCir = function (url, btd) {
        var _fogLayer = new egret.DisplayObjectContainer();
        var _fogLayerShape = new egret.Shape();
        var _con = new egret.DisplayObjectContainer();
        var bit = new egret.Bitmap(btd);
        _con.addChild(bit);
        _con.addChild(_fogLayerShape);
        var renderTexture = new egret.RenderTexture();
        _fogLayerShape.graphics.beginFill(0, 1);
        _fogLayerShape.graphics.drawCircle(btd.width / 2, btd.height / 2, btd.width / 2);
        _fogLayerShape.graphics.endFill();
        bit.mask = _fogLayerShape;
        renderTexture.drawToTexture(_con);
        this._btds.set(url, renderTexture.bitmapData);
        btd.$dispose();
    };
    SynResCenter._btds = new Map();
    return SynResCenter;
}());
__reflect(SynResCenter.prototype, "SynResCenter");
/**
 * 位图的应用工具
 * 通过资源名称创建一个位图,
 * @author nodep
 * @version 1.0
 */
var BitmapUtil = (function () {
    function BitmapUtil() {
    }
    /**
     * 获取一个bitmap
     * @param  {string} name RES中的名称
     * @param  {boolean=false} centerFlag 是否为中心注册点
     */
    BitmapUtil.createBitmapByName = function (name, centerFlag) {
        if (centerFlag === void 0) { centerFlag = false; }
        var result = new egret.Bitmap();
        var texture = RES.getRes(name);
        result.texture = texture;
        if (centerFlag) {
            result.anchorOffsetX = result.width / 2;
            result.anchorOffsetY = result.height / 2;
        }
        return result;
    };
    /**
     * 获取一个贴图
     * @param  {string} name RES中的名称
     */
    BitmapUtil.getBitmapTexture = function (name) {
        return RES.getRes(name);
    };
    /**
     * 制作一个快照图片
     */
    BitmapUtil.createSnapshot = function (dis) {
        var rt = new egret.RenderTexture();
        rt.drawToTexture(dis);
        var b = new egret.Bitmap(rt);
        return b;
    };
    /**
     * 回收一个快照
     * @param  {egret.Bitmap} bit
     * @returns void
     */
    BitmapUtil.removeSnapshot = function (bit) {
        bit.texture.dispose();
        if (bit.bitmapData)
            bit.bitmapData.$dispose();
    };
    return BitmapUtil;
}());
__reflect(BitmapUtil.prototype, "BitmapUtil");
/**
 * 延迟调用函数
 * @author nodep
 * @version 1.1
 */
var DelayCall = (function () {
    function DelayCall(callBack, thisObject, args) {
        if (args === void 0) { args = null; }
        this.key = "";
        this.delayTime = 0;
        this.repeatCount = 0;
        this._costTime = 0;
        this._callBack = callBack;
        this._thisObject = thisObject;
        this._args = args;
    }
    /**
     * 延迟回调函数
     * @param  {number} delayTime 延迟时间毫秒
     * @param  {Function} callBack 回调函数
     * @param  {any} thisObject 函数父节点
     * @param  {Array<any>=null} args 返回给函数的参数集合
     * @param  {number=1} repeat 重复次数，默认为1次。<=0为无限次循环
     * @param  {string=""} key 该延迟函数封装体的Key。会覆盖一样的Key，导致上一个Key不能手动停止
     */
    DelayCall.call = function (delayTime, callBack, thisObject, args, repeat, key, autoClear) {
        if (args === void 0) { args = null; }
        if (repeat === void 0) { repeat = 1; }
        if (key === void 0) { key = ""; }
        if (autoClear === void 0) { autoClear = false; }
        if (autoClear)
            this.removeCall(key);
        var dcall = new DelayCall(callBack, thisObject, args);
        dcall.delayTime = delayTime;
        dcall.repeatCount = repeat;
        dcall.key = key;
        RenderManager.getIns().registRender(dcall);
        if (key && key != "") {
            DelayCall._delayMap.set(key, dcall);
        }
        return dcall;
    };
    /**
     * 根据构造时给的key,来移除和停止一个延迟函数
     * @param  {string} key
     */
    DelayCall.removeCall = function (key) {
        if (!key || key == "")
            return false;
        var dc = this._delayMap.get(key);
        if (dc)
            RenderManager.getIns().unregistRender(dc);
        this._delayMap.delete(key);
        return dc != null;
    };
    DelayCall.prototype.renderUpdate = function (interval) {
        this._costTime += interval;
        while (this._costTime >= this.delayTime) {
            this._costTime = this._costTime - this.delayTime;
            if (this.repeatCount > 0) {
                this.repeatCount -= 1;
                if (this.repeatCount <= 0) {
                    DelayCall.removeCall(this.key);
                    RenderManager.getIns().unregistRender(this);
                    if (null != this._callBack)
                        this._callBack.apply(this._thisObject, this._args);
                    this._callBack = null;
                    this._thisObject = null;
                    this._args = null;
                    break;
                }
                else {
                    if (null != this._callBack)
                        this._callBack.apply(this._thisObject, this._args);
                }
            }
            else {
                if (null != this._callBack)
                    this._callBack.apply(this._thisObject, this._args);
                break;
            }
        }
    };
    DelayCall._delayMap = new Map();
    return DelayCall;
}());
__reflect(DelayCall.prototype, "DelayCall", ["IRender"]);
/**
 * 数字应用
 */
var NumberUtil = (function () {
    function NumberUtil() {
    }
    /**
     * 将num转换为000,000,000的格式字符串
     * @param  {number} num
     * @param  {string="} sp 分隔符,默认为","。当使用bitmapLabel的时候需要
     * @param  {any} "
     */
    NumberUtil.getMoneyStr_1 = function (num, sp) {
        if (sp === void 0) { sp = ","; }
        var str = "";
        var s1 = num + "";
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
    };
    /**
     * 获取金币格式 xxx千，千万
     */
    NumberUtil.getMoneyStr_2 = function (num) {
        var len = (num + "").length;
        if (len <= 6)
            return this.getMoneyStr_1(num, ",");
        else
            return Math.floor(num / 10000) + "万";
    };
    /**
     * 獲取的金幣格式 1.2w
     */
    NumberUtil.getMoneyStr_3 = function (num) {
        num = parseInt(num + "");
        if (num >= 10000) {
            var kNum = parseInt(num / 10000 + "");
            var kSub = parseInt(parseInt(num % 10000 + "") / 1000 + "");
            if (kSub > 0)
                return kNum + "." + kSub + "萬";
            else
                return kNum + "萬";
        }
        else {
            return num + "";
        }
    };
    /**在這裡設置為xxxK的格式 */
    NumberUtil.getMoneyStr_4 = function (num) {
        num = parseInt(num + "");
        if (num >= 10000) {
            var kNum = parseInt(num / 1000 + "");
            var kSub = parseInt(parseInt(num % 1000 + "") / 100 + "");
            if (kSub > 0)
                return kNum + "." + kSub + "K";
            else
                return kNum + "K";
        }
        else {
            return num + "";
        }
    };
    /**在這裡設置為xxxK的格式 >=1000則會有 */
    NumberUtil.getMoneyStr_5 = function (num) {
        num = parseInt(num + "");
        if (num >= 1000) {
            var kNum = parseInt(num / 1000 + "");
            var kSub = parseInt(parseInt(num % 1000 + "") / 100 + "");
            if (kSub > 0)
                return kNum + "." + kSub + "K";
            else
                return kNum + "K";
        }
        else {
            return num + "";
        }
    };
    /**
     * 在前面补0,默认补足2位
     */
    NumberUtil.getRoundStr_1 = function (num, len) {
        if (len === void 0) { len = 2; }
        var str = num + "";
        while (str.length < len)
            str = "0" + str;
        return str;
    };
    /**
     * 保留2位小数,强制留00
     * @param  {number} num
     * @param  {number=2} len
     * @returns string
     */
    NumberUtil.getRoundStr_2 = function (num, len) {
        if (len === void 0) { len = 2; }
        var str = num.toFixed(2);
        if (str.indexOf(".") >= 0) {
            var args = str.split(".");
            return args[0] + "." + this.getRoundStr_3(args[1]);
        }
        else {
            return str + ".00";
        }
    };
    /**
     * 在后面补0
     */
    NumberUtil.getRoundStr_3 = function (str, len) {
        if (len === void 0) { len = 2; }
        while (str.length < len)
            str = str + "0";
        return str;
    };
    /**
     * 是否为手机号
     */
    NumberUtil.isPhoneNumber = function (str) {
        return str != null && str.length > 5;
    };
    /**
     * 獲取時間
     */
    NumberUtil.getHourFromMin = function (num) {
        num = parseInt(num + "");
        if (num >= 60) {
            var kNum = parseInt(num / 60 + "");
            var kSub = parseInt(parseInt(num % 60 + "") / 6 + "");
            if (kSub > 0)
                return kNum + "." + kSub + "h";
            else
                return kNum + "h";
        }
        else {
            return num + "m";
        }
    };
    /**
     * 获取小时和分钟 00:00
     * @param  {number} num
     * @returns string
     */
    NumberUtil.getHourMin = function (num) {
        if (num < 0)
            num = 0;
        var min = parseInt(num / 1000 / 60 + "");
        var hour = parseInt(min / 60 + "");
        min = parseInt(min % 60 + "");
        var m = min + "";
        if (m.length == 1)
            m = "0" + m;
        var h = hour + "";
        if (h.length == 1)
            h = "0" + h;
        return h + ":" + m;
    };
    /**
     * 获取时间xx:xx 分秒
     * @param  {number} num
     * @returns string
     */
    NumberUtil.getMinSec = function (num) {
        if (num < 0)
            num = 0;
        var min = parseInt(num / 1000 / 60 + "");
        var sec = parseInt(num / 1000 % 60 + "");
        var m = min + "";
        if (m.length == 1)
            m = "0" + m;
        var s = sec + "";
        if (s.length == 1)
            s = "0" + s;
        return m + ":" + s;
    };
    /**
     * 讲一个字符串返回为139****0295
     * @param  {string} str
     * @param  {number=3} font
     * @param  {number=4} back
     * @returns string
     */
    NumberUtil.getPhoneScr = function (str, font, back) {
        if (font === void 0) { font = 3; }
        if (back === void 0) { back = 4; }
        var len = str.length;
        var keys = "";
        for (var i = 0; i < len; i++) {
            if (i >= font && i < len - back)
                keys += "*";
            else
                keys += str.charAt(i);
        }
        return keys;
    };
    return NumberUtil;
}());
__reflect(NumberUtil.prototype, "NumberUtil");
/**
 * 焦点工具
 */
var FocusUtil = (function () {
    function FocusUtil() {
    }
    /**
     * 当target焦点发生变化时，指定bindImg的图片资源
     * @param  {egret.DisplayObject} target 例如：输入框
     * @param  {eui.Image} bindImg 例如：底部的横线
     * @param  {string} inSrc 例如：焦点进入时的图片
     * @param  {string} outSrc 例如：焦点退出时的图片
     * @returns void
     */
    FocusUtil.focusImgBind = function (target, bindImg, inSrc, outSrc) {
        this.focusImgBindRemove(target);
        var obj = { "img": bindImg, "inSrc": inSrc, "outSrc": outSrc };
        this._imgBind.set(target, obj);
        target.addEventListener(egret.Event.FOCUS_IN, this.focusImgInHandler, this);
        target.addEventListener(egret.Event.FOCUS_OUT, this.focusImgOutHandler, this);
    };
    /**
     * 解除绑定
     * @param  {egret.DisplayObject} target
     * @returns void
     */
    FocusUtil.focusImgBindRemove = function (target) {
        if (this._imgBind.has(target)) {
            target.removeEventListener(egret.Event.FOCUS_IN, this.focusImgInHandler, this);
            target.removeEventListener(egret.Event.FOCUS_OUT, this.focusImgOutHandler, this);
        }
        this._imgBind.delete(target);
    };
    FocusUtil.focusImgInHandler = function (evt) {
        var target = evt.target;
        var args = this._imgBind.get(target);
        var img = args.img;
        img.source = args.inSrc;
    };
    FocusUtil.focusImgOutHandler = function (evt) {
        var target = evt.target;
        var args = this._imgBind.get(target);
        var img = args.img;
        img.source = args.outSrc;
    };
    FocusUtil._imgBind = new Map();
    return FocusUtil;
}());
__reflect(FocusUtil.prototype, "FocusUtil");
/**
 * 时间工具
 * @version 1.0
 * @author nodep
 */
var TimeUtil = (function () {
    function TimeUtil() {
    }
    /**
     * 年月日部分 2017-08-10
     * @param  {number} ms
     * @param  {string="-"} spt
     * @returns string
     */
    TimeUtil.getTimeStr_1 = function (ms, spt) {
        if (spt === void 0) { spt = "-"; }
        var str = "";
        var date = new Date(ms);
        str = date.getFullYear() + spt + NumberUtil.getRoundStr_1((date.getMonth() + 1), 2) + spt + NumberUtil.getRoundStr_1(date.getDate(), 2);
        return str;
    };
    /**
     * 时分部分 11:00
     * @param  {number} ms
     * @param  {string=":"} spt
     * @returns string
     */
    TimeUtil.getTimeStr_2 = function (ms, spt, hasSec) {
        if (spt === void 0) { spt = ":"; }
        if (hasSec === void 0) { hasSec = false; }
        var str = "";
        var date = new Date(ms);
        str = NumberUtil.getRoundStr_1(date.getHours(), 2) + spt + NumberUtil.getRoundStr_1(date.getMinutes(), 2);
        if (hasSec) {
            str = str + spt + NumberUtil.getRoundStr_1(date.getSeconds());
        }
        return str;
    };
    /**
     * 月日部分 08-10
     * @param  {number} ms
     * @param  {string="-"} spt
     * @returns string
     */
    TimeUtil.getTimeStr_3 = function (ms, spt) {
        if (spt === void 0) { spt = "-"; }
        var str = "";
        var date = new Date(ms);
        str = NumberUtil.getRoundStr_1((date.getMonth() + 1), 2) + spt + NumberUtil.getRoundStr_1(date.getDate(), 2);
        return str;
    };
    /**
     * 话费分，不足分为秒
     * @param  {number} sec 秒
     * @returns string
     */
    TimeUtil.getLastStr_1 = function (sec) {
        if (sec >= 60)
            return parseInt(sec / 60 + "") + "分";
        else
            return sec + "秒";
    };
    return TimeUtil;
}());
__reflect(TimeUtil.prototype, "TimeUtil");
/**
 * eui常用的工具类
 * @version 1.0
 * @author nodep
 */
var EuiUtil = (function () {
    function EuiUtil() {
    }
    /**
     * 获取一个图片,可能支持九宫格
     * @param  {string} source
     * @param  {egret.Rectangle=null} scale9Grid
     * @returns eui
     */
    EuiUtil.getImage = function (source, scale9Grid) {
        if (scale9Grid === void 0) { scale9Grid = null; }
        var img = new eui.Image();
        img.source = source;
        if (scale9Grid != null)
            img.scale9Grid = scale9Grid;
        return img;
    };
    return EuiUtil;
}());
__reflect(EuiUtil.prototype, "EuiUtil");
/**
 * 常用算法
 * @version 1.0
 * @author nodep
 */
var NodepUtil = (function () {
    function NodepUtil() {
    }
    /**
     * 遍历数组中的项，依次循环添加到目标数组
     * @param  {any[]} sList
     * @param  {any[]} tos 二位数组
     * @param  {boolean=true} reset
     * @returns void
     */
    NodepUtil.listFillTo01 = function (sList, tos, reset) {
        if (reset === void 0) { reset = true; }
        var i = 0;
        if (reset) {
            for (i = 0; i < tos.length; i++) {
                var list = tos[i];
                while (list.length > 0)
                    list.pop();
            }
        }
        for (i = 0; i < sList.length; i += tos.length) {
            for (var j = 0; j < tos.length; j++) {
                tos[j].push(sList[i + j]);
            }
        }
    };
    /**
     * 利用cls类型填充list,也可能删减
     * @param  {any[]} list
     * @param  {any} cls
     * @param  {any} count
     * @returns void
     */
    NodepUtil.fill = function (list, cls, count, removed, p) {
        if (removed === void 0) { removed = false; }
        if (p === void 0) { p = null; }
        var t;
        while (list.length > count) {
            t = list.pop();
            if (removed && t.parent)
                t.parent.removeChild(t);
        }
        while (list.length < count) {
            t = new cls();
            list.push(t);
            if (removed && p != null)
                p.addChild(t);
        }
    };
    return NodepUtil;
}());
__reflect(NodepUtil.prototype, "NodepUtil");
/**
 * 服务器时间
 * @version 1.0
 * @author nodep
 */
var ServerTime = (function () {
    function ServerTime() {
    }
    ServerTime.initBySec = function (s) {
        DelayCall.removeCall("framework_servertime");
        DelayCall.call(1000, this.enterframe, this, null, 0, "framework_servertime");
        this._stime = s * 1000;
        this._startT = egret.getTimer();
    };
    ServerTime.getTime = function () {
        return this._stime + (egret.getTimer() - this._startT);
    };
    /**
     * 注册一个依赖于服务器时间的函数
     * @param  {string} key 所属组
     * @param  {Function} handler 监听函数
     * @param  {any} thisObj 回执
     * @param  {any[]} args 参数
     * @param  {number} t 时间
     * @returns void
     */
    ServerTime.regist = function (key, handler, thisObj, args, t) {
        if (this._groupNames.indexOf(key) < 0)
            this._groupNames.push(key);
        if (!this._groupMap.has(key))
            this._groupMap.set(key, []);
        var list = this._groupMap.get(key);
        var one = { "callBack": handler, "time": t, "thisObj": thisObj, "arg": args };
        list.push(one);
        list.sort(function (a, b) {
            return b.time - a.time;
        });
    };
    ServerTime.delGroup = function (key) {
        var index = this._groupNames.indexOf(key);
        if (index < 0)
            return;
        this._groupNames.splice(index, 1);
        var list = this._groupMap.get(key);
        while (list.length > 0)
            list.pop();
        this._groupMap.delete(key);
    };
    /**
     * 判断两天是否为同一天
     * @param  {number} ms
     * @returns boolean
     */
    ServerTime.isToday = function (ms) {
        var t = this.getTime();
        return TimeUtil.getTimeStr_1(t) == TimeUtil.getTimeStr_1(ms);
    };
    ServerTime.enterframe = function () {
        var i = 0;
        var st = this.getTime();
        for (i; i < this._groupNames.length; i++) {
            var key = this._groupNames[i];
            var list = this._groupMap.get(key);
            for (var j = list.length - 1; j >= 0; j--) {
                var arg = list[j];
                if (st >= arg.time) {
                    arg.callBack.apply(arg.thisObj, arg.arg);
                    list.splice(j, 1);
                }
            }
        }
    };
    ServerTime._stime = 0;
    ServerTime._startT = 0;
    ServerTime._groupMap = new Map();
    ServerTime._groupNames = [];
    return ServerTime;
}());
__reflect(ServerTime.prototype, "ServerTime");
/**
 * 对象工具
 * @author nodep
 * @version 1.0
 */
var ObjUtil = (function () {
    function ObjUtil() {
    }
    /**
     * 不严格的对象拷贝
     * @param  {any} from 数据源
     * @param  {any} to 输入到对象啊
     * @returns void
     */
    ObjUtil.copyTo = function (from, to) {
        var key;
        for (key in to) {
            if (from.hasOwnProperty(key))
                to[key] = from[key];
        }
    };
    return ObjUtil;
}());
__reflect(ObjUtil.prototype, "ObjUtil");
/**
 * 在此数组中存放的值对象的某个值是唯一的
 * 例如在这里存放一个结构为{"name":xxx,"value":xxxx}的对象数组，我们需要name是唯一的，那么构造为
 * new ArraySole<T> = new ArraySole(TClass,"name");
 * @author nodep
 * @version 1.0
 */
var ArraySole = (function () {
    /**
     * @param  {any} cls 该值对象的构造函数
     */
    function ArraySole(cls, key) {
        this.datas = [];
        this._key = key;
        this._cls = cls;
    }
    /**
     * 更新数据
     * @param  {any} obj
     * @returns void
     */
    ArraySole.prototype.addOrUpdate = function (obj) {
        var vo = null;
        for (var i = 0; i < this.datas.length; i++) {
            if (this.datas[i][this._key] == obj[this._key]) {
                vo = this.datas[i];
                break;
            }
        }
        if (!vo) {
            vo = new this._cls();
            this.datas.push(vo);
        }
        ObjUtil.copyTo(obj, vo);
    };
    /**
     * 批量更新
     * @param  {any} objs
     * @returns void
     */
    ArraySole.prototype.addOrUpdateDatas = function (objs) {
        while (objs.length > 0) {
            this.addOrUpdate(objs.pop());
        }
    };
    /**
     * 根据单一条件获取一个新的数组
     * @param  {string} key key值
     * @param  {any} value 属性
     * @returns T
     */
    ArraySole.prototype.getSubBy = function (key, value) {
        var rst = [];
        for (var i = 0; i < this.datas.length; i++) {
            if (this.datas[i][key] == value) {
                rst.push(this.datas[i]);
            }
        }
        return rst;
    };
    return ArraySole;
}());
__reflect(ArraySole.prototype, "ArraySole");
/**
 * 骨骼动画
 */
var DragonUtil = (function () {
    function DragonUtil() {
    }
    /**
     * 骨骼工厂,简单版
     */
    DragonUtil.getMc = function (dname, armatureName) {
        var fc;
        if (DragonUtil._fcMap.get(dname) == null) {
            fc = new dragonBones.EgretFactory();
            fc.parseDragonBonesData(this.getJson(dname + "_ske_json"));
            fc.parseTextureAtlasData(this.getJson(dname + "_tex_json"), RES.getRes(dname + "_tex_png"));
            DragonUtil._fcMap.set(dname, fc);
        }
        fc = DragonUtil._fcMap.get(dname);
        var mc;
        mc = fc.buildArmatureDisplay(armatureName);
        return mc;
    };
    DragonUtil.getJson = function (key) {
        if (this._zipData.has(key))
            return this._zipData.get(key);
        else
            return RES.getRes(key);
    };
    DragonUtil.registJson = function (key, value) {
        this._zipData.set(key, value);
    };
    DragonUtil._fcMap = new Map();
    DragonUtil._zipData = new Map();
    return DragonUtil;
}());
__reflect(DragonUtil.prototype, "DragonUtil");
/**
 * 图片加载
 * @author nodep
 * @version 1.0
 */
var Loader = (function (_super) {
    __extends(Loader, _super);
    function Loader() {
        var _this = _super.call(this) || this;
        _this.type = 0;
        return _this;
    }
    Object.defineProperty(Loader.prototype, "url", {
        get: function () {
            return this._url;
        },
        set: function (u) {
            if (this._url == u)
                return;
            this._url = u;
            this.updateImg();
        },
        enumerable: true,
        configurable: true
    });
    Loader.prototype.partAdded = function (partName, instance) {
        _super.prototype.partAdded.call(this, partName, instance);
    };
    Loader.prototype.childrenCreated = function () {
        _super.prototype.childrenCreated.call(this);
        this._bit = new egret.Bitmap();
        this.addChild(this._bit);
        this.updateImg();
    };
    Loader.prototype.updateImg = function () {
        if (!this._bit)
            return;
        if (this._url != null && this._url.length > 0 && this._url != undefined && this._url != "undefined") {
        }
        else {
            return;
        }
        if (SynResCenter.hasBtd(this._url)) {
            this._bit.bitmapData = SynResCenter.getBitmapData(this._url);
            this._bit.width = this.width;
            this._bit.height = this.height;
            return;
        }
        var imgld = new egret.ImageLoader();
        imgld.addEventListener(egret.Event.COMPLETE, this.loadCompleted, this);
        imgld.addEventListener(egret.IOErrorEvent.IO_ERROR, this.loadError, this);
        // var urlReq: egret.URLRequest = new egret.URLRequest(this._url);
        // var urlLoader: egret.URLLoader = new egret.URLLoader();
        // urlLoader.dataFormat = egret.URLLoaderDataFormat.TEXTURE;
        // urlLoader.load(urlReq);
        // urlLoader.addEventListener(egret.Event.COMPLETE, (event: egret.Event) => {
        // 	var texture: egret.Texture = <egret.Texture>urlLoader.data;
        // 	if (this.type == Loader.HEAD_CIRCLE)
        // 		SynResCenter.setBitmapDataAsHeadCir(this._url, texture.bitmapData);
        // 	else
        // 		SynResCenter.setBitmapData(this._url, texture.bitmapData);
        // 	this._bit.bitmapData = SynResCenter.getBitmapData(this._url);
        // 	this._bit.width = this.width;
        // 	this._bit.height = this.height;
        // }, this);
        imgld.load(this._url);
    };
    Loader.prototype.loadError = function (event) {
        LogTrace.log(this._url + ":loader error!");
        var imgld = event.currentTarget;
        imgld.removeEventListener(egret.Event.COMPLETE, this.loadCompleted, this);
        imgld.removeEventListener(egret.IOErrorEvent.IO_ERROR, this.loadError, this);
    };
    Loader.prototype.loadCompleted = function (event) {
        var imgld = event.currentTarget;
        imgld.removeEventListener(egret.Event.COMPLETE, this.loadCompleted, this);
        imgld.removeEventListener(egret.IOErrorEvent.IO_ERROR, this.loadError, this);
        var texture = new egret.Texture();
        texture._setBitmapData(imgld.data);
        if (this.type == Loader.HEAD_CIRCLE)
            SynResCenter.setBitmapDataAsHeadCir(this._url, texture.bitmapData);
        else
            SynResCenter.setBitmapData(this._url, texture.bitmapData);
        this._bit.bitmapData = SynResCenter.getBitmapData(this._url);
        this._bit.width = this.width;
        this._bit.height = this.height;
    };
    //圆形头像
    Loader.HEAD_CIRCLE = 1;
    return Loader;
}(eui.Component));
__reflect(Loader.prototype, "Loader", ["eui.UIComponent", "egret.DisplayObject"]);
/**
 * 传统手机目录缩放组件
 * @author nodep
 * @version 1.0
 */
var MenuGroup = (function () {
    /**
     * @param  {eui.Image} barImg 监听按钮点击的对象
     * @param  {string[]} imgs 长度2的图片，0:缩,1:开
     * @param  {egret.DisplayObject[]} targets 被控制的图片
     */
    function MenuGroup(barImg, imgs, targets, autoHide) {
        if (autoHide === void 0) { autoHide = false; }
        this._targetsPos = new Map();
        this._showed = true;
        this._px = 0;
        this._py = 0;
        this._bar = barImg;
        this._imgs = imgs;
        this._targets = targets;
        for (var i = 0; i < this._targets.length; i++) {
            var p = new egret.Point(this._targets[i].x, this._targets[i].y);
            this._targetsPos.set(this._targets[i], p);
        }
        this._bar.rotation = 45;
        this._bar.source = this._imgs[1];
        this._bar.addEventListener(egret.TouchEvent.TOUCH_TAP, this.showOrHide, this);
    }
    Object.defineProperty(MenuGroup.prototype, "isshowed", {
        get: function () {
            return this._showed;
        },
        enumerable: true,
        configurable: true
    });
    MenuGroup.prototype.showOrHide = function (evt) {
        if (this._showed) {
            this.hide();
            this._bar.source = this._imgs[0];
        }
        else {
            this.show();
            this._bar.source = this._imgs[1];
        }
    };
    MenuGroup.prototype.show = function (ease) {
        if (ease === void 0) { ease = true; }
        TweenTs.get(this._bar).to({ rotation: 0 }, 100);
        this._showed = true;
        for (var i = 0; i < this._targets.length; i++) {
            TweenTs.get(this._targets[i]).to({ alpha: 1, x: this._targetsPos.get(this._targets[i]).x + this._px, y: this._targetsPos.get(this._targets[i]).y + this._py }, 100, ease ? nodep.Ease.backOut : null);
        }
    };
    MenuGroup.prototype.hide = function () {
        TweenTs.get(this._bar).to({ rotation: 45 }, 100);
        this._showed = false;
        for (var i = 0; i < this._targets.length; i++) {
            TweenTs.get(this._targets[i]).to({ alpha: 0, x: this._bar.x, y: this._bar.y }, 100);
        }
    };
    //偏移量
    MenuGroup.prototype.offset = function (px, py) {
        this._px = px;
        this._py = py;
    };
    return MenuGroup;
}());
__reflect(MenuGroup.prototype, "MenuGroup");
/**
 * 列表
 */
var ListBox = (function () {
    /**
     * 通过一个容器与显示组件来构造一个List
     * @param  {eui.Group} box
     * @param  {any} cls
     */
    function ListBox(box, cls, spY, everyH, bottomH, over) {
        if (spY === void 0) { spY = 0; }
        if (everyH === void 0) { everyH = 0; }
        if (bottomH === void 0) { bottomH = 0; }
        if (over === void 0) { over = false; }
        this._spY = 0;
        this._everyH = 0;
        this._datas = [];
        this._items = [];
        this._gcItemds = [];
        this._autoBottom = true;
        this._bottomH = 0;
        this._over = false;
        this.toBottomSpeed = 800;
        this.maxLen = 0;
        this._needUp = false;
        this._needDown = false;
        this._over = over;
        this._box = box;
        this._cls = cls;
        this._spY = spY;
        this._everyH = everyH;
        this._bottomH = bottomH;
        if (this._bottomH > 0) {
            this._bottomRect = new eui.Rect(1, this._bottomH, 0);
            this._bottomRect.alpha = 0.01;
            this._box.addChild(this._bottomRect);
        }
        this._box.parent.addEventListener(eui.UIEvent.CHANGE, this.moveHandler, this);
        this._box.parent.addEventListener(eui.UIEvent.CHANGE_END, this.outHandler, this);
    }
    /**
     * 初始化响应函数
     * @param  {Function} upHandler 向上反弹时是否响应函数
     * @param  {Function} downHandler 向下反弹时是否相应函数
     * @param  {any} thisObj
     * @returns void
     */
    ListBox.prototype.initHandler = function (upHandler, downHandler, thisObj, autoB, autoT) {
        if (autoB === void 0) { autoB = null; }
        if (autoT === void 0) { autoT = null; }
        this._upH = upHandler;
        this._downH = downHandler;
        this._thisObj = thisObj;
        this._autoB = autoB;
        this._autoT = autoT;
    };
    ListBox.prototype.initMoveHandler = function (mh) {
        this._mh = mh;
    };
    ListBox.prototype.toTop = function (delayc, move) {
        if (delayc === void 0) { delayc = true; }
        if (move === void 0) { move = false; }
        var toy = 0;
        TweenTs.removeTweens(this._box);
        if (!move)
            this._box.scrollV = toy;
        else {
            TweenTs.get(this._box).to({ scrollV: toy }, this.toBottomSpeed);
        }
        if (delayc)
            DelayCall.call(50, this.toTop, this, [false]);
    };
    /**
     * 滚动到最底部
     * @param  {boolean=true} delayc
     * @returns void
     */
    ListBox.prototype.toBottom = function (delayc, move) {
        if (delayc === void 0) { delayc = true; }
        if (move === void 0) { move = false; }
        var toy = this._box.getBounds().height - this._box.scrollRect.height;
        if (toy < 0)
            toy = 0;
        if (toy >= 0 && toy < this._box.getBounds().height) {
            TweenTs.removeTweens(this._box);
            if (!move)
                this._box.scrollV = toy;
            else {
                TweenTs.get(this._box).to({ scrollV: toy }, this.toBottomSpeed);
            }
        }
        if (delayc)
            DelayCall.call(50, this.toBottom, this, [false]);
    };
    //触碰移动
    ListBox.prototype.moveHandler = function (evt) {
        this._autoBottom = false;
        if (this._box.scrollV < -100) {
            this._needUp = true;
        }
        if (this._box.scrollV + this._box.scrollRect.height > this._box.getBounds().height + 100) {
            this._needDown = true;
        }
        if (this._mh != null && this._thisObj) {
            var v = 0;
            if (this._box.scrollV < 0) {
                v = -Math.min(this._box.scrollV / -100, 1);
            }
            else if (this._box.scrollV + this._box.scrollRect.height > this._box.getBounds().height) {
                v = Math.min((this._box.scrollV + this._box.scrollRect.height - this._box.getBounds().height) / 100, 1);
            }
            this._mh.apply(this._thisObj, [v]);
        }
    };
    //触碰结束
    ListBox.prototype.outHandler = function (evt) {
        if (this._box.scrollV >= (this._box.getBounds().height - this._box.height) - 100) {
            if (this._autoB != null) {
                this._autoB.apply(this._thisObj, [true]);
            }
            this._autoBottom = true;
        }
        if (this._needUp) {
            this._needUp = false;
            if (this._box.scrollV == 0 && this._upH && this._thisObj) {
                this._upH.apply(this._thisObj, null);
            }
        }
        if (this._needDown) {
            this._needDown = false;
            if (this._downH && this._thisObj) {
                this._downH.apply(this._thisObj, null);
            }
        }
    };
    /**
     * 增加一条信息到下面
     * @param  {any} d
     * @param  {boolean=true} mc
     */
    ListBox.prototype.pushOneToBottom = function (d, mc, hard) {
        if (mc === void 0) { mc = true; }
        if (hard === void 0) { hard = false; }
        if (hard)
            this._autoBottom = true;
        var render;
        if (this._gcItemds.length > 0)
            render = this._gcItemds.pop();
        else
            render = new this._cls();
        render.alpha = 1;
        this._datas.push(d);
        render.updateData(d);
        this._box.addChild(render);
        this._items.push(render);
        this.checkLen();
        if (mc)
            render.playIn();
        this.updatePoses(false, this._autoBottom, true);
        DelayCall.call(1, this.updatePoses, this, [false, this._autoBottom, true]);
        return !this._autoBottom;
    };
    /**
     * 设置数据集,全部更新
     * @param  {any[]} ds
     * @returns void
     */
    ListBox.prototype.changeDatas = function (ds) {
        this._datas = ds;
        this.checkLen();
        this.updateDatas();
    };
    ListBox.prototype.checkLen = function () {
        if (this.maxLen <= 0)
            return;
        while (this._datas.length > this.maxLen) {
            this._datas.shift();
        }
        var render;
        while (this._items.length > this._datas.length) {
            render = this._items.shift();
            this._gcItemds.push(render);
            this._box.removeChild(render);
        }
    };
    /**
     * 通过片动画的方式删除一个alpha
     * @param  {any} target
     * @returns void
     */
    ListBox.prototype.removeOneByMc = function (target) {
        var render = target;
        if (this._box.getChildIndex(target) < 0) {
            return;
        }
        var pIndex = this._items.indexOf(render);
        if (pIndex >= 0)
            this._items.splice(pIndex, 1);
        pIndex = this._datas.indexOf(render.getData());
        if (pIndex >= 0)
            this._datas.splice(pIndex, 1);
        TweenTs.removeTweens(target);
        TweenTs.get(target).to({ alpha: 0, x: -target.width }, 100);
        DelayCall.call(120, this.removeOne, this, [target]);
        this.updatePoses(true);
    };
    ListBox.prototype.removeOne = function (target) {
        if (target.parent != null) {
            target.parent.removeChild(target);
            ;
        }
    };
    ListBox.prototype.updateDatas = function () {
        //删除多余的组件
        var i = this._items.length - 1;
        var render;
        for (i; i >= 0; i--) {
            if (i >= this._datas.length) {
                render = this._items[i];
                this._gcItemds.push(render);
                this._box.removeChild(render);
                this._items.splice(i, 1);
            }
        }
        //构造不足的组件
        for (i = 0; i < this._datas.length; i++) {
            if (i >= this._items.length) {
                if (this._gcItemds.length > 0)
                    render = this._gcItemds.pop();
                else
                    render = new this._cls();
                render.alpha = 1;
                this._box.addChild(render);
                this._items.push(render);
            }
        }
        //设置数据
        for (i = 0; i < this._items.length; i++) {
            render = this._items[i];
            render.updateData(this._datas[i]);
        }
        //刷新位置
        this.updatePoses();
        DelayCall.call(1, this.updatePoses, this);
    };
    ListBox.prototype.updatePoses = function (byMc, autoBottom, mcBottom) {
        if (byMc === void 0) { byMc = false; }
        if (autoBottom === void 0) { autoBottom = false; }
        if (mcBottom === void 0) { mcBottom = false; }
        var fy = 0;
        var render;
        for (var i = 0; i < this._items.length; i++) {
            render = this._items[i];
            render.alpha = 1;
            render.x = 0;
            TweenTs.removeTweens(render);
            if (byMc)
                TweenTs.get(render).to({ y: fy }, 100);
            else
                render.y = fy;
            if (this._everyH > 0) {
                fy += this._everyH;
            }
            else {
                fy += render.height;
            }
            fy += this._spY;
        }
        if (this._bottomRect != null) {
            this._bottomRect.y = fy;
            if (this._bottomRect.y < this._box.parent.height + 100 && this._over)
                this._bottomRect.y = this._box.parent.height + 100;
        }
        if (autoBottom)
            this.toBottom(true, mcBottom);
    };
    return ListBox;
}());
__reflect(ListBox.prototype, "ListBox");
/**
 * 基础层级容器的实现
 * @author nodep
 * @version 1.0
 */
var GameLayer = (function (_super) {
    __extends(GameLayer, _super);
    function GameLayer() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._wins = [];
        _this._popCount = 0;
        return _this;
    }
    /**
     * 添加一个界面到舞台
     */
    GameLayer.prototype.addWindow = function (win, toIndex) {
        win.visible = false;
        var target = win;
        if (NodepConfig.auto == 1) {
            if (win.parent == null) {
                var autoBox = new eui.Component();
                autoBox.addChild(win);
                target = autoBox;
            }
        }
        if (toIndex >= 0)
            this.addChild(target);
        else
            this.addChildAt(target, 0);
        this._wins.push(win);
        if (win.pop)
            this._popCount++;
        this.updateModel();
        if (win.__inited)
            win.reOpen();
        win.__inited = true;
    };
    GameLayer.prototype.clearLayer = function () {
        while (this._wins.length > 0) {
            var win = this._wins[0];
            this.removeWindow(win);
        }
    };
    /**
     * 移除一个界面
     */
    GameLayer.prototype.removeWindow = function (win) {
        if (win.pop)
            this._popCount--;
        this.updateModel();
        if (NodepConfig.auto == 1) {
            this.removeChild(win.parent);
            win.parent.removeChild(win);
        }
        else {
            this.removeChild(win);
        }
        this._wins.splice(this._wins.indexOf(win), 1);
    };
    /**
     * 刷新阻挡层
     */
    GameLayer.prototype.updateModel = function () {
        //添加
        if (this._popCount > 0 && (!this._popShape || !this._popShape.touchEnabled)) {
            if (!this._popShape) {
                this._popShape = new egret.Shape();
                this._popShape.alpha = 0;
            }
            this._popShape.graphics.clear();
            this._popShape.graphics.beginFill(0x000000, 0.7);
            this._popShape.graphics.drawRect(0, 0, WinsManager.stageWidth, WinsManager.stageHeight);
            this._popShape.graphics.endFill;
            this._popShape.touchEnabled = true;
            this.addChildAt(this._popShape, 0);
            TweenTs.removeTweens(this._popShape);
            TweenTs.get(this._popShape).to({ alpha: 1 }, 200);
        } //删除
        else if (this._popCount <= 0 && (this._popShape && this._popShape.touchEnabled)) {
            // this.removeChild(this._popShape);
            // this._popShape.graphics.clear();
            // this._popShape = null;
            this._popShape.touchEnabled = false;
            TweenTs.removeTweens(this._popShape);
            TweenTs.get(this._popShape).to({ alpha: 0 }, 200);
        }
    };
    /**
     * 界面大小变化
     */
    GameLayer.prototype.resize = function () {
        var key;
        for (key in this._wins) {
            this._wins[key].resize();
        }
    };
    GameLayer.prototype.autoScale = function () {
        var key;
        for (key in this._wins) {
            this._wins[key].autoScale();
        }
    };
    return GameLayer;
}(egret.DisplayObjectContainer));
__reflect(GameLayer.prototype, "GameLayer", ["GameLayerInterface"]);
/**
 * 不定模块模式的资源管理器
 * @author nodep
 * @version 1.0
 */
var NoAppResCenter = (function () {
    function NoAppResCenter() {
    }
    /**
     * 初始化NoAppResCenter的配置文件
     * @param  {string} jsonName 配置文件的Res名称
     * @returns void
     */
    NoAppResCenter.initConfig = function (jsonName) {
        //{skinList:["a","b","c"],res:{"a":["","",""]}}
        var cfgObj = RES.getRes(jsonName);
        if (!cfgObj || cfgObj["skinList"] == null || cfgObj["res"] == null)
            return;
        var keyList = cfgObj.skinList;
        var res = cfgObj.res;
        while (keyList.length > 0) {
            var key = keyList.pop();
            this._cfg.set(key, res[key]);
        }
    };
    //手动添加
    NoAppResCenter.append = function (key, values) {
        var list = this._cfg.get(key);
        while (values.length > 0) {
            var v = values.pop();
            if (values.indexOf(v) < 0)
                list.push(v);
        }
    };
    /**
     * 获取类的名称,同时如果没有设置过这个类的资源列表,则进行设置
     * @param  {any} cls
     */
    NoAppResCenter.getGroupName = function (cls) {
        var winName = egret.getQualifiedClassName(cls);
        var reses = this._cfg.get(winName);
        if (reses == null) {
            LogTrace.log("winName=" + winName + " is emt");
            return null;
        }
        if (this._getted.indexOf(winName) < 0) {
            RES.createGroup(winName, reses, true);
        }
        return winName;
    };
    NoAppResCenter._cfg = new Map();
    NoAppResCenter._getted = [];
    return NoAppResCenter;
}());
__reflect(NoAppResCenter.prototype, "NoAppResCenter");
var net;
(function (net) {
    var Http = (function () {
        function Http() {
        }
        /**
         * 注册监听
         * @param  {string} url
         * @param  {Function} callBack
         * @param  {any} thisObj
         * @returns void
         */
        Http.registerHandler = function (url, callBack, thisObj) {
            this._callBackMap.set(url, callBack);
            this._thisObjMap.set(url, thisObj);
        };
        /**
         * @param  {string} url 请求地址
         * @param  {string} args "gameid=" + NetConfig.gameid + "&username=" + user.username + "&password=" + user.password;
         * @returns void
         */
        Http.post = function (url, args, durT) {
            if (durT === void 0) { durT = 200; }
            if (!this.canSend(url))
                return;
            var request = new egret.HttpRequest();
            // request.withCredentials = true;
            this._requestMap.set(request, url);
            request.responseType = egret.HttpResponseType.TEXT;
            request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
            request.open(url, egret.HttpMethod.POST);
            request.send(args);
            request.addEventListener(egret.Event.COMPLETE, this.postCompletedHandler, this);
            request.addEventListener(egret.IOErrorEvent.IO_ERROR, this.postErrorHandler, this);
            LogTrace.log(url + "?" + args);
        };
        /**
         * post返回
         * @param  {egret.Event=null} event
         * @param  {string=""} phoneNumber
         * @returns void
         */
        Http.postCompletedHandler = function (event) {
            var request = event.currentTarget;
            request.removeEventListener(egret.Event.COMPLETE, this.postCompletedHandler, this);
            request.removeEventListener(egret.IOErrorEvent.IO_ERROR, this.postErrorHandler, this);
            LogTrace.log("back:" + request.response);
            var url = this._requestMap.get(request);
            this.clear(request);
            if (url != null) {
                var callBack = this._callBackMap.get(url);
                var thisObj = this._thisObjMap.get(url);
                callBack.apply(thisObj, [request.response]);
            }
            else {
                LogTrace.log("未注册的请求回置:" + request.response);
            }
            return;
        };
        Http.postErrorHandler = function (event) {
            var request = event.currentTarget;
            var url = this._requestMap.get(request);
            LogTrace.log("post error : " + url + ":" + event.type);
            this.clear(request);
        };
        Http.clear = function (request) {
            var url = this._requestMap.get(request);
            if (url != null) {
                this._getting.delete(url);
                this._requestMap.delete(request);
            }
        };
        /**是否可发送 */
        Http.canSend = function (key, t) {
            if (t === void 0) { t = 200; }
            if (this._getting.get(key) == null) {
                this._getting.set(key, (new Date()).getTime() + t);
                return true;
            }
            var time = this._getting.get(key);
            if ((new Date()).getTime() > time) {
                this._getting.set(key, (new Date()).getTime() + t);
                return true;
            }
            else
                return false;
        };
        Http._callBackMap = new Map();
        Http._thisObjMap = new Map();
        Http._getting = new Map(); //发送控制
        Http._requestMap = new Map();
        return Http;
    }());
    net.Http = Http;
    __reflect(Http.prototype, "net.Http");
})(net || (net = {}));
var net;
(function (net) {
    /**
     * socket,去掉了单例的要求
     * @author nodep
     * @version 2.0
     */
    var Socket = (function (_super) {
        __extends(Socket, _super);
        function Socket() {
            var _this = _super.call(this) || this;
            _this.canReconnect = true;
            _this._handlerMap = new Map();
            _this._handlerThis = new Map();
            _this._tryConnect = false;
            _this._errorCount = 3;
            _this._reconnet = false;
            _this._timeout = 5000;
            _this._locks = new Map();
            _this._used = false;
            _this.delayRe = 1000;
            _this._reTimes = [];
            _this._nos = [];
            _this._packOuts = [];
            return _this;
        }
        /**
         * 初始化一个socket
         * @param  {string} ip
         * @param  {number} port
         * @param  {boolean=false} autoLink
         * @returns void
         */
        Socket.prototype.init = function (ip, port) {
            this._ip = ip;
            this._port = port;
            this._url = ip + ":" + this._port;
            this.firstLink();
        };
        Socket.prototype.initByUrl = function (url) {
            this._url = url;
            this.firstLink();
        };
        /**
         * 注册链接打开的监听函数。函数的参数为一个boolean,true表示为第一次链接
         * @param  {Function} openHandler
         * @param  {any} thisObj
         * @returns void
         */
        Socket.prototype.registHandlers = function (openHandler, thisObj) {
            this._openHandler = openHandler;
            this._openThisObj = thisObj;
        };
        /**
         * 注册链接重新连接的监听函数。正在重新连接,由连接成功唤醒,一个参数,true表示开始连接,false代表连接结束
         * @param  {Function} openHandler
         * @param  {any} thisObj
         * @returns void
         */
        Socket.prototype.regsitReconnect = function (openHandler, thisObj) {
            this._reHandler = openHandler;
            this._reThisObj = thisObj;
        };
        Socket.prototype.unLognos = function (nos) {
            while (nos.length > 0) {
                this._nos.push(nos.pop());
            }
        };
        Socket.prototype.firstLink = function () {
            this._reTimes.push(egret.getTimer());
            this._tryConnect = true;
            this.type = egret.WebSocket.TYPE_BINARY;
            this.addEventListener(egret.ProgressEvent.SOCKET_DATA, this.onReceiveMessage, this);
            this.addEventListener(egret.Event.CONNECT, this.onSocketOpen, this);
            this.addEventListener(egret.Event.CLOSE, this.onSocketClose, this);
            this.addEventListener(egret.IOErrorEvent.IO_ERROR, this.onSocketError, this);
            LogTrace.log("尝试链接到服务器..." + this._url);
            DelayCall.call(this._timeout, this.onSocketError, this, null, 1, "net_socket_self_frameworkForNodep" + this._errorCount);
            this.connectByUrl(this._url);
        };
        //数据处理
        Socket.prototype.onReceiveMessage = function (e) {
            var bts = new egret.ByteArray();
            this.readBytes(bts);
            var packIn = new PackIn(bts.buffer);
            if (this._handlerMap.get(packIn.code) != null)
                this._handlerMap.get(packIn.code).apply(this._handlerThis.get(packIn.code), [packIn]);
            else {
                if (this._nos.indexOf(packIn.code) < 0)
                    LogTrace.log("socketMessage code=" + packIn.code + "缺少处理");
            }
        };
        /**连接成功 */
        Socket.prototype.onSocketOpen = function () {
            this._used = true;
            LogTrace.log("连接成功");
            RenderManager.getIns().registRender(this);
            LogTrace.log("WebSocketConnected!!");
            this._errorCount = 3;
            if (this._openHandler != null) {
                this._openHandler.apply(this._openThisObj, [!this._reconnet]);
            }
            if (this._reHandler != null && this._reconnet) {
                this._reHandler.apply(this._reThisObj, [false]);
            }
        };
        /**连接关闭 */
        Socket.prototype.onSocketClose = function () {
            LogTrace.log("连接断开");
            this._tryConnect = false;
            RenderManager.getIns().unregistRender(this);
            this.reconnet();
        };
        /**连接错误 */
        Socket.prototype.onSocketError = function () {
            this.reconnet();
        };
        Socket.prototype.registClose = function (handle, o) {
            this._closeHandler = handle;
            this._closeT = o;
        };
        /**重新连接 */
        Socket.prototype.reconnet = function () {
            if (this.connected || !this.canReconnect)
                return;
            DelayCall.removeCall("net_socket_self_frameworkForNodep" + this._errorCount);
            //判断网络是否稳定
            this._reTimes.push(egret.getTimer());
            if (this._reTimes.length > 3) {
                var tt = 0;
                for (var i = 0; i < 3; i++) {
                    tt += this._reTimes[this._reTimes.length - i - 1] - this._reTimes[this._reTimes.length - i - 2];
                }
                if (tt / 3 < this.delayRe * 5) {
                    this.canReconnect = false;
                    if (this._closeHandler != null)
                        this._closeHandler.apply(this._closeT, [this._used]);
                    return;
                }
            }
            this._errorCount--;
            if (this._errorCount > 0) {
                if (this._reHandler) {
                    this._reHandler.apply(this._reThisObj, [true]);
                }
                DelayCall.call(this.delayRe, this.readyReconnect, this, null, 1, "net_socket_self_frameworkForNodepRe", true);
            }
            else {
                if (this._closeHandler != null)
                    this._closeHandler.apply(this._closeT, [this._used]);
            }
        };
        Socket.prototype.readyReconnect = function () {
            this._reconnet = true;
            this.connectByUrl(this._url);
            DelayCall.call(this._timeout, this.onSocketError, this, null, 1, "net_socket_self_frameworkForNodep" + this._errorCount);
        };
        Socket.prototype.regist = function (no, handler, thisObj) {
            if (this._handlerMap.has(no)) {
                throw (new Error(NodepErrorType.NO_ALREADY_EXIST));
            }
            this._handlerMap.set(no, handler);
            this._handlerThis.set(no, thisObj);
        };
        /**發送 */
        Socket.prototype.sendPack = function (pack) {
            if (this._locks.has(pack.getCode())) {
                if (egret.getTimer() < this._locks.get(pack.getCode()))
                    return;
            }
            if (this._nos.indexOf(pack.getCode()) < 0 && !this.connected) {
                LogTrace.log("尝试发送" + pack.getCode());
            }
            this._packOuts.push(pack);
        };
        Socket.prototype.renderUpdate = function (interval) {
            if (!this.connected)
                return;
            while (this._packOuts.length > 0) {
                var pack = this._packOuts.shift();
                if (this._nos.indexOf(pack.getCode()) < 0) {
                    LogTrace.log("实际发送" + pack.getCode());
                }
                pack.writeHead();
                this.writeBytes(new egret.ByteArray(pack.getBuffer()));
            }
        };
        /**
        * 设置一个锁,在多少时间内不能发送此封包
        * @param  {number} no
        * @param  {number} times
        * @returns void
        */
        Socket.prototype.setLock = function (no, times) {
            this._locks.set(no, egret.getTimer() + times);
        };
        /**
         * 手动清除锁
         * @param  {number} no
         * @returns void
         */
        Socket.prototype.clearLock = function (no) {
            this._locks.delete(no);
        };
        return Socket;
    }(egret.WebSocket));
    net.Socket = Socket;
    __reflect(Socket.prototype, "net.Socket", ["IRender"]);
})(net || (net = {}));
/**
 * 接受到的服務器的消息包
 * @author nodep
 * @version 1.0
 */
var PackIn = (function () {
    function PackIn(ab) {
        this._pos = 0;
        this._signature = 0;
        this.identifier = 0;
        this.code = 0;
        this.session = 0;
        this.length = 0;
        this._dataView = new DataView(ab);
        // read head
        this.identifier = this._dataView.getUint16(this._pos, true);
        this._pos += 2;
        this.length = this._dataView.getUint16(this._pos, true);
        this._pos += 2;
        this.code = this._dataView.getUint16(this._pos, true);
        this._pos += 2;
        this._signature = this._dataView.getInt16(this._pos, true);
        this._pos += 2;
        this.session = this._dataView.getUint16(this._pos, true);
        this._pos += 2;
    }
    PackIn.prototype.rewind = function () {
        this._pos = 10;
    };
    PackIn.prototype.readJson = function () {
        return JSON.parse(this.readString());
    };
    PackIn.prototype.readBool = function () {
        var b = this._dataView.getInt8(this._pos);
        ++this._pos;
        return b == 1;
    };
    PackIn.prototype.readBoolean = function () {
        return this.readBool();
    };
    PackIn.prototype.readInteger = function () {
        var r = 0;
        var first = this._dataView.getUint8(this._pos);
        this._pos += 1;
        switch (first) {
            case 255:
                r = this._dataView.getInt8(this._pos);
                this._pos += 1;
                break;
            case 254:
                r = this._dataView.getInt16(this._pos, true);
                this._pos += 2;
                break;
            case 253:
                r = this._dataView.getUint16(this._pos, true);
                this._pos += 2;
                break;
            case 252:
                r = this._dataView.getInt32(this._pos, true);
                this._pos += 4;
                break;
            case 251:
                r = this._dataView.getUint32(this._pos, true);
                this._pos += 4;
                break;
            case 250:
                {
                    var str = '';
                    for (var i = 0; i < 8; ++i) {
                        var v = this._dataView.getUint8(this._pos);
                        var st = v.toString(2);
                        str = st + str;
                        for (var j = st.length; j < 8; ++j) {
                            str = '0' + str;
                        }
                        this._pos += 1;
                    }
                    r = parseInt(str, 2);
                }
                break;
            case 249:
                {
                    var str = '';
                    for (var i = 0; i < 8; ++i) {
                        var v = this._dataView.getUint8(this._pos);
                        var st = v.toString(2);
                        str = st + str;
                        for (var j = st.length; j < 8; ++j) {
                            str = '0' + str;
                        }
                        this._pos += 1;
                    }
                    r = parseInt(str, 2);
                }
                break;
            default:
                r = first;
                break;
        }
        return r;
    };
    PackIn.prototype.readInt = function () {
        return this.readInteger();
    };
    PackIn.prototype.readString = function () {
        var bytes = this.readByteArray();
        return UTF8.byteArrayToString(bytes);
    };
    PackIn.prototype.readByteArray = function () {
        var len = this.readInteger();
        var arr = new Uint8Array(len);
        for (var i = 0; i < len; ++i) {
            arr[i] = this._dataView.getUint8(this._pos);
            this._pos += 1;
        }
        return arr;
    };
    PackIn.prototype.readFloat = function () {
        var f = this._dataView.getFloat32(this._pos, true);
        this._pos += 4;
        return f;
    };
    PackIn.prototype.readDouble = function () {
        var f = this._dataView.getFloat64(this._pos, true);
        this._pos += 8;
        return f;
    };
    PackIn.prototype.readListAny = function (itemReaders) {
        var arr = [];
        var len = this.readInteger();
        for (var i = 0; i < len; ++i) {
            var data = [];
            for (var j = 0; j < itemReaders.length; j++) {
                data.push(itemReaders[j].call(this));
            }
            arr.push(data);
        }
        return arr;
    };
    PackIn.prototype.readList = function (itemReader) {
        var arr = [];
        var len = this.readInteger();
        for (var i = 0; i < len; ++i) {
            if (itemReader != null)
                arr.push(itemReader.call(this));
            else
                arr.push(this.readInt());
        }
        return arr;
    };
    /**读取二维数组 */
    PackIn.prototype.readList2 = function (itemReader, ppLen) {
        if (ppLen === void 0) { ppLen = 2; }
        var arr = [];
        var len = this.readInteger();
        for (var i = 0; i < len; ++i) {
            var args = [];
            for (var j = 0; j < ppLen; j++) {
                args.push(itemReader.call(this));
            }
            arr.push(args);
        }
        return arr;
    };
    return PackIn;
}());
__reflect(PackIn.prototype, "PackIn");
/**
 * 發送的封包
 * @author nodep
 * @version 1.0
 */
var PackOut = (function () {
    function PackOut(code, len) {
        if (len === void 0) { len = 1024; }
        this._session = 0;
        this._code = 0;
        this._length = 10;
        this._pos = 10;
        PackOut.addS++;
        this._session = PackOut.addS;
        this._buffer = new ArrayBuffer(len);
        this._code = code;
        this._dataView = new DataView(this._buffer, 0);
    }
    PackOut.prototype.getCode = function () {
        return this._code;
    };
    PackOut.prototype._ensureLength = function () {
        if (this._length < this._pos) {
            this._length = this._pos;
        }
    };
    PackOut.prototype.getBuffer = function () {
        return this._buffer.slice(0, this._length);
    };
    PackOut.prototype.setSession = function (session) {
        this._session = session;
    };
    PackOut.prototype.getSession = function () {
        return this._session;
    };
    PackOut.prototype.writeHead = function () {
        this._pos = 0;
        this._dataView.setUint16(this._pos, 56430, true);
        this._pos += 2;
        this._dataView.setUint16(this._pos, this._length, true);
        this._pos += 2;
        this._dataView.setUint16(this._pos, this._code, true);
        this._pos += 2;
        this._dataView.setInt16(this._pos, 0, true);
        this._pos += 2;
        this._dataView.setUint16(this._pos, this._session, true);
        this._pos += 2;
        this._ensureLength();
    };
    PackOut.prototype.writeDouble = function (v) {
        this._dataView.setFloat64(this._pos, v, true);
        this._pos += 8;
        this._ensureLength();
    };
    PackOut.prototype.writeInteger = function (v) {
        if (v >= 0) {
            if (v < 249) {
                this._dataView.setUint8(this._pos, v);
                this._pos += 1;
            }
            else if (v <= 32767) {
                this._dataView.setUint8(this._pos, 254);
                this._pos += 1;
                this._dataView.setInt16(this._pos, v, true);
                this._pos += 2;
            }
            else if (v <= 2147483647) {
                this._dataView.setUint8(this._pos, 252);
                this._pos += 1;
                this._dataView.setInt32(this._pos, v, true);
                this._pos += 4;
            }
            else {
                this._dataView.setUint8(this._pos, 250);
                this._pos += 1;
                var str = v.toString(2);
                var pos = str.length;
                var max = 8;
                while (max > 0) {
                    if (pos > 0) {
                        if (pos >= 8) {
                            v = parseInt(str.substr(pos - 8, 8), 2);
                            pos -= 8;
                        }
                        else {
                            v = parseInt(str.substr(0, pos), 2);
                            pos = 0;
                        }
                    }
                    else {
                        v = 0;
                    }
                    this._dataView.setUint8(this._pos, v);
                    this._pos += 1;
                    --max;
                }
            }
        }
        else {
            if (v >= -128) {
                this._dataView.setUint8(this._pos, 255);
                this._pos += 1;
                this._dataView.setInt8(this._pos, v);
                this._pos += 1;
            }
            else if (v >= -32768) {
                this._dataView.setUint8(this._pos, 254);
                this._pos += 1;
                this._dataView.setInt16(this._pos, v, true);
                this._pos += 2;
            }
            else if (v >= -2147483648) {
                this._dataView.setUint8(this._pos, 252);
                this._pos += 1;
                this._dataView.setInt32(this._pos, v, true);
                this._pos += 4;
            }
            else {
                this._dataView.setUint8(this._pos, 250);
                this._pos += 1;
                var str = v.toString(2);
                var pos = str.length;
                var max = 8;
                while (max > 0) {
                    if (pos > 0) {
                        if (pos >= 8) {
                            v = parseInt(str.substr(pos - 8, 8), 2);
                            pos -= 8;
                        }
                        else {
                            v = parseInt(str.substr(0, pos), 2);
                            pos = 0;
                        }
                    }
                    else {
                        v = 0;
                    }
                    this._dataView.setUint8(this._pos, v);
                    this._pos += 1;
                    --max;
                }
            }
        }
        this._ensureLength();
    };
    PackOut.prototype.writeString = function (str) {
        str = str || '';
        var byteArray = UTF8.stringToByteArray(str);
        this.writeInteger(byteArray.length);
        for (var i = 0; i < byteArray.length; ++i) {
            this._dataView.setUint8(this._pos, byteArray[i]);
            this._pos += 1;
        }
        this._ensureLength();
    };
    PackOut.prototype.writeBytes = function (ab) {
        this.writeInteger(ab.byteLength);
        for (var i = 0; i < ab.byteLength; i++) {
            this._dataView.setUint8(this._pos, ab[i]);
            this._pos += 1;
        }
        this._ensureLength();
    };
    PackOut.prototype.writeBoolean = function (b) {
        this._dataView.setInt8(this._pos, b ? 1 : 0);
        this._pos += 1;
        this._ensureLength();
    };
    PackOut.prototype.writeFloat = function (v) {
        this._dataView.setFloat32(this._pos, v, true);
        this._pos += 4;
        this._ensureLength();
    };
    PackOut.prototype.writeList = function (list, itemWriter) {
        this.writeInteger(list.length);
        var key;
        for (key in list) {
            itemWriter.call(this, list[key]);
        }
    };
    PackOut.prototype.dumpInfo = function () {
        LogTrace.log(this._code);
        var buffer = new egret.ByteArray(this.getBuffer());
        buffer.position = 0;
        var str = '';
        for (var i = 0; i < buffer.length; ++i) {
            str += (buffer[i] + ',');
        }
        LogTrace.log(str);
    };
    PackOut.addS = 0;
    return PackOut;
}());
__reflect(PackOut.prototype, "PackOut");
/**
 * UTF8
 * @version 1.0
 * @author nodep
 */
var UTF8 = (function () {
    function UTF8() {
    }
    /**
     * Unicode符号范围 | UTF-8编码方式
     * (十六进制) | （二进制）
     * --------------------+---------------------------------------------
     * 0000 0000-0000 007F | 0xxxxxxx
     * 0000 0080-0000 07FF | 110xxxxx 10xxxxxx
     * 0000 0800-0000 FFFF | 1110xxxx 10xxxxxx 10xxxxxx
     * 0001 0000-0010 FFFF | 11110xxx 10xxxxxx 10xxxxxx 10xxxxxx
     */
    /**
     *
     * @param {String} str
     * @returns {Uint8Array}
     */
    UTF8.stringToByteArray = function (str) {
        // 110xxxxx = 0xC0      2byte
        // 00011111 = 0x1F
        // 1110xxxx = 0xE0      3byte
        // 11110xxx = 0xF0      4byte
        // 10xxxxxx = 0x80
        // 00111111 = 0x3F
        var array = [];
        for (var i = 0; i < str.length; ++i) {
            var code = str.charCodeAt(i);
            if (code < 0x007F) {
                array.push(code);
            }
            else if (code < 0x07FF) {
                array.push(code >> 6 & 0x1F | 0xC0);
                array.push((code & 0x3F) | 0x80);
            }
            else if (code < 0xFFFF) {
                array.push(code >> 12 & 0xF | 0xE0);
                array.push(code >> 6 & 0x3F | 0x80);
                array.push(code & 0x3F | 0x80);
            }
            else {
                array.push(code >> 18 & 0xF8 | 0xF0);
                array.push(code >> 12 & 0x3F | 0x80);
                array.push(code >> 6 & 0x3F | 0x80);
                array.push(code & 0x3F | 0x80);
            }
        }
        return new Uint8Array(array);
    };
    /**
     *
     * @param array {Uint8Array}
     * @returns {String}
     */
    UTF8.byteArrayToString = function (array) {
        var str = '';
        var count = array.length;
        var idx = 0;
        var code = 0;
        while (idx < count) {
            var byte1 = array[idx];
            if ((byte1 & 0x80) === 0) {
                code = byte1;
                idx += 1;
            }
            else if ((byte1 >> 5 << 5) === 0xC0) {
                var byte2 = array[idx + 1];
                code = ((byte1 & 0x1F) << 6) | (byte2 & 0x3F);
                idx += 2;
            }
            else if ((byte1 >> 4 << 4) === 0xE0) {
                var byte2 = array[idx + 1];
                var byte3 = array[idx + 2];
                code = (0xF & byte1) << 12 | (byte2 & 0x3F) << 6 | (byte3 & 0x3F);
                idx += 3;
            }
            else if ((byte1 >> 3 << 3) === 0xF0) {
                var byte2 = array[idx + 1];
                var byte3 = array[idx + 2];
                var byte4 = array[idx + 3];
                code = (0xF & byte1 << 18) | (byte2 << 12 & 0x3F) | (byte3 << 6 & 0x3F) | (byte4 & 0x3F);
                idx += 4;
            }
            else {
                throw new Error('can not decode utf8 string');
            }
            str += String.fromCharCode(code);
        }
        return str;
    };
    return UTF8;
}());
__reflect(UTF8.prototype, "UTF8");
