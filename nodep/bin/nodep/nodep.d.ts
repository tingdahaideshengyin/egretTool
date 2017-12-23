declare class Map<T, K> {
    private _keys;
    private _values;
    constructor();
    set(key: T, value: K): void;
    delete(key: T): K;
    log(): void;
    get(key: T): K;
    has(key: T): boolean;
    forEach(fun: Function, thisObj: any): void;
    clear(): void;
}
/**
 * 对象池
 * @author nodep
 * @version 1.0
 */
declare class ObjPool {
    private static _poolMap;
    /**
     * 通过class获取一个实例
     * @param  {any} cls
     * @returns any
     */
    static create(cls: any): any;
    /**
     * 释放一个
     * @param  {any} c
     * @returns void
     */
    static release(c: any): void;
}
/**
 * 性能更稳定,移动更精确的精简tween
 * 需要利用自己编写的触发器或直接用框架带的RenderManager做驱动。基于时间的，方便游戏中大量的位移动画。
 * 长距离精确位移过程中如果有抖动飘逸感觉，请自己在get,set中对应值取整数。
 * 因业务限制，暂时不做过多扩展
 * @version 1.0
 * @author nodep
 */
declare class TweenTs implements IRender {
    private static _tweenMap;
    /**
     * 移除某个对象的所有tween
     * @param  {any} t
     * @returns void
     */
    static removeTweens(t: any): void;
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
    static get(t: any, autoRemove?: boolean, loopTimes?: number, completeHandler?: Function, thisObj?: any, args?: any[]): TweenTs;
    private _loop;
    private _comH;
    private _tw;
    private _tO;
    private _args;
    private _ts;
    private _index;
    private _focusT;
    private _curT;
    private _curObj;
    private _startObj;
    private dispose();
    /**
     * 设置到某个group中,可以通过group进行整体控制
     * @param  {string} n
     */
    groupName: string;
    /**
     * 如果你是单独使用这个类,请在enterFrame事件中,传入两次调用的差。
     * 在Tween自身内部，不会来验证interval的真实和有效性。
     * @param  {number} interval
     * @returns void
     */
    renderUpdate(interval: number): void;
    private setFocusToItem(its);
    to(props: any, dur: number, esae?: Function): TweenTs;
    from(props: any, dur: number, ease?: Function): TweenTs;
    wait(dur: number): TweenTs;
    call(c: Function, thisObj: any): TweenTs;
}
declare module nodep {
    /**
     * 直接拷贝egret.Ease需要的函数做扩展
     */
    class Ease {
        static backOut(t: any): number;
    }
}
/**
 * 游戏通用的界面,继承之后可以通过GameWindow进行管理
 * 界面的缩放不影响布局效果
 * @author nodep
 * @version 1.01
 */
declare class GameWindow extends eui.Component implements eui.UIComponent {
    __inited: boolean;
    protected __align: string;
    private __offsetX;
    private __offsetY;
    /***所屬層級,需要在業務中自定義*/
    layerType: string;
    /**界面的唯一命名*/
    typeName: string;
    /**是否有遮罩,如果手动设置为有遮罩的,将会在弹出后阻挡后面的界面操作*/
    pop: boolean;
    /**界面是否已经创建完成,只有在创建完成的界面中才不会抛空*/
    protected created: boolean;
    private _initW;
    private _initH;
    private _backgrundColor;
    private _backBt;
    needDelayRemove: number;
    private static _backShape;
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
    constructor(typeName: string, layerType: string, backgrundColor?: number);
    protected partAdded(partName: string, instance: any): void;
    protected childrenCreated(): void;
    protected updateSelf(): void;
    /**
     *再次加入舞臺
     */
    reOpen(): void;
    protected addStageClose(): void;
    private autoCloseHandler(evt);
    /**
     * 捕获消息
     * @param  {number} updateType 消息编号
     * @param  {any} updateObject 消息体
     * @returns void
     */
    update(updateType: number, updateObject: any): void;
    /**
     * 关闭界面之前
     * 如果要添加关闭动画则在实现中返回false,并实现自己的关闭动画。则关闭动画完成后彻底移除。
     */
    beforeClose(): boolean;
    /**
     * 舞台大小发生变化
     */
    resize(): void;
    /**
     * 界面被激活
     * @returns void
     */
    active(): void;
    /**
     * 设置布局
     * @param  {string} alignType 布局方式
     * @param  {number=0} offsetX x偏移量
     * @param  {number=0} offsetY y偏移量
     * @see AlignType
     */
    align(alignType: string, offsetX?: number, offsetY?: number): void;
    /**
     * 为界面元素添加点击事件
     * @param  {any} args 需要添加事件的partID,或容器(如果是容器会为容器中的所有子对象添加事件)
     * @param  {string=""} paName args的父容器节点,只对2级容器有效。如果界面存在三级容器，请重新设计。或创建界面组件控制器
     * @see tapCallback
     */
    protected addEventTap(args: any, paName?: string): void;
    /**
     * 响应函数
     * @param  {string} childName
     * @returns void
     */
    protected tapCallback(childName: string): void;
    private eventTapHandler(evt);
    /**
     * 弹出界面
     * @param  {number=200} durT 经过的时间
     * @param  {number=0} fromScale 从多小或多大
     * @param {boolean=true} useBackOut 是否应用此效果
     */
    protected popup(durT?: number, fromScale?: number, useBackOut?: boolean): void;
    protected popOut(durT?: number, toScale?: number): boolean;
    /**
     * 获取某个一级输入框(TextInput)
     * @param  {string} str partID
     */
    protected getTxtInput(str: string): eui.TextInput;
    autoScale(): void;
    protected justScale(): void;
    protected sound(sn: string, dt?: number): void;
}
/**
 * 可视化组建基类
 * @author nodep
 * @version 1.0
 */
declare class GameComp extends eui.Component {
    protected created: boolean;
    protected _data: any;
    index: number;
    /**
     * 构造函数
     * @param  {number=0} cid 可以通过index获取当前设置的值
     */
    constructor(cid?: number);
    /**
     * 捕获消息
     * @param  {number} updateType 消息编号
     * @param  {any} updateObject 消息体
     * @returns void
     */
    update(updateType: number, updateObject: any): void;
    protected partAdded(partName: string, instance: any): void;
    protected childrenCreated(): void;
    data: any;
    protected updateSelf(): void;
    /**
     * 为界面元素添加点击事件
     * @param  {any} args 需要添加事件的partID,或容器(如果是容器会为容器中的所有子对象添加事件)
     * @param  {string=""} paName args的父容器节点,只对2级容器有效。如果界面存在三级容器，请重新设计。或创建界面组件控制器
     * @see tapCallback
     */
    protected addEventTap(args: any, paName?: string): void;
    /**
     * 响应函数
     * @param  {string} childName
     * @returns void
     */
    protected tapCallback(childName: string): void;
    private eventTapHandler(evt);
}
/**
 * 横向滚动容器控制器
 * egret.getQualifiedClassName(this)
 */
declare class HViewStack {
    private static _pageMaker;
    private static _pageMap;
    private _keys;
    private _box;
    private _focus;
    private _focusIndex;
    constructor(box: eui.Group);
    update(key: number, args: any): void;
    /**
     * 设置一组构造函数,必须是继承于GameComp的
     * @param  {any[]} cls
     * @returns void
     */
    setPages(cls: any[]): void;
    removeAll(): void;
    /**
     * 瞬间反页到
     * @param  {number} index
     * @param  {any} data
     * @returns void
     */
    initPageTo(index: number, data: any): void;
    /**
     * 渐变的方式到达
     * @param  {number} index
     * @param  {any} data
     * @returns void
     */
    changeToPage(index: number, data: any): void;
    private removeHandler(tg);
    private static getPage(key);
}
/**
 * 图片配合链接
 * @version 1.0
 * @author nodep
 */
declare class TabBox extends egret.DisplayObjectContainer {
    private _w;
    private _h;
    private _urls;
    private _imgs;
    private _index;
    private _loaders;
    private _showIndex;
    private _stcs;
    private _setImg;
    private _unsetImg;
    private _sw;
    constructor(w: number, h: number, setImg?: string, unSetImg?: string, sw?: number);
    setDatas(urls: string[]): void;
    private updateShow();
    private setLast(l, str);
    private changeImg();
    start(times: number): void;
    private tapHandler(evt);
    stop(): void;
    gc(): void;
}
/**
 * 跑马灯式控制器,以eui的group为参数,以第一个child为txt。可设置右侧边距
 * @version 1.0
 * @author nodep
 */
declare class NoticeBar {
    private _g;
    private _label;
    private _left;
    private _right;
    private _txts;
    private _urls;
    private _index;
    private _durT;
    private _hash;
    constructor(g: eui.Group, right: number);
    setDatas(urls: string[]): void;
    private playOne();
    private startPlay();
    private nextOne();
    private tapHandler(evt);
    start(t?: number): void;
    stop(): void;
}
/**
 * 游戏层级容器接口,因为存在扩展layer的可能,所以这里实现接口
 * @author nodep
 * @version 1.0
 */
interface GameLayerInterface {
    /**
     * 添加並顯示一個window
     */
    addWindow(win: GameWindow, toIndex: number): void;
    /**
     * 舞台大小变化导致
     */
    resize(): void;
    clearLayer(): void;
    autoScale(): void;
}
/**
 * 框架的基础配置文件,可通过window属性进行更改
 * @author nodep
 * @version 1.0;
 */
declare class NodepConfig {
    /**是否属于测试 */
    static isTest: number;
    /**是否打印 */
    static isDebug: number;
    /**音乐默认大小 */
    static bgVolume: number;
    /**是否属于app模式 */
    static appMode: number;
    /**是否自动布局 */
    static auto: number;
    /**
     * 设置启动参数
     * @returns void
     */
    static init(): void;
}
/**
 * 回调对象
 */
declare class CallBackVO {
    callBack: Function;
    thisObj: any;
    args: Array<any>;
    /**
     * 构造一个存放回调函数的对象
     * @param  {Function} callBack
     * @param  {any} thisObj
     * @param  {any[]=null} args
     */
    constructor(callBack: Function, thisObj: any, args?: any[]);
    /**
     * 执行调用
     * @param  {boolean=true} clear
     * @returns void
     */
    call(clear?: boolean): void;
}
/**
 * 对齐方式
 * @author nodep
 */
declare class AlignType {
    static TOP_LEFT: string;
    static TOP_CENTER: string;
    static TOP_RIGHT: string;
    static CENTER: string;
    static BOTTOM_LEFT: string;
    static BOTTOM_CENTER: string;
    static BOTTOM_RIGHT: string;
    static NONE: string;
    static CENTER_STAGE: string;
}
/**
 * 层级常量
 *@author nodep
 */
declare class LayerType {
    /**場景層*/
    static LAYER_GROUND: string;
    /**战斗 */
    static LAYER_BATTLE: string;
    /**导航界面层 */
    static LAYER_MENU: string;
    /**UI层*/
    static LAYER_UI: string;
    /**弹出层*/
    static LAYER_POP: string;
    /**提示层 */
    static LAYER_TIP: string;
}
/**
 * 错误类型
 * @author nodep
 */
declare class NodepErrorType {
    static LAYER_NO_EXISTENT: string;
    static PARAM_TYPE_ERROR: string;
    static ERROR_CODE: string;
    static NO_ALREADY_EXIST: string;
}
/**
 * Alpha闪烁效果
 * @author nodep
 * @version 1.2 增加自动山所事件
 */
declare class AlphaRender implements IRender {
    private static _stepId;
    private _id;
    private _target;
    private _startArg;
    private _arg;
    private _durTime;
    private _lastDurT;
    private static _rds;
    private static createApr(target, durTime?, arg?);
    /**
     * 开始对某个对象进行闪烁
     * @param  {egret.DisplayObject} target
     * @param  {number=0} autoStop
     * @returns void
     */
    static startStatic(target: egret.DisplayObject, autoStop?: number, durTime?: number, arg?: number): void;
    /**
     * 停止某个对象的闪烁
     * @param  {egret.DisplayObject} target
     * @returns void
     */
    static stopStatic(target: egret.DisplayObject): void;
    /**
     * @param  {egret.DisplayObject} dis 目标显示对象
     * @param  {number=50} durTime 多少毫秒变化一次
     * @param  {number=0.1} arg 一次变化多少透明度
     */
    constructor(dis: egret.DisplayObject, durTime?: number, arg?: number);
    renderUpdate(interval: number): void;
    /**
     * 开始闪烁,需要手动调用
     * @returns void
     */
    start(autoStop?: number): void;
    private stopSelf();
    /**
     * 暂停闪烁并将透明度改变为最初的状态
     * @returns void
     */
    stop(): void;
    /**
     * 停止闪烁并销毁并将透明度改变为最初的状态
     * @returns void
     */
    dispose(): void;
}
/**
 * 淡出淡入效果,tween的替代实验类
 * @author nodep
 * @version 1.0
 */
declare class FadeEffect implements IRender {
    private _from;
    private _to;
    private _bt;
    private _target;
    private _callBack;
    private _thisObj;
    private _turnT;
    private _durT;
    private constructor();
    renderUpdate(interval: number): void;
    /**
     * 淡入
     * @param  {egret.DisplayObject} target 显示对象
     * @param  {number} durT 总时间毫秒
     * @param  {Function} callBack 完成时的回调函数
     * @param  {any} thisObj
     * @returns void
     */
    static fadeIn(target: egret.DisplayObject, durT: number, callBack: Function, thisObj: any): void;
    /**
     * 淡出
     * @param  {egret.DisplayObject} target 显示对象
     * @param  {number} durT 总时间毫秒
     * @param  {Function} callBack 完成时的回调函数
     * @param  {any} thisObj
     * @returns void
     */
    static fadeOut(target: egret.DisplayObject, durT: number, callBack: Function, thisObj: any): void;
}
/**
 * 资源组加载器,这里同时只允许加载一组
 * @author nodep
 * @version 1.2
 */
declare class GroupResManager {
    private static _ins;
    private _winName;
    private _progressUpdateType;
    private _loadingWindow;
    private _loadingGroups;
    private _loadingMap;
    private _showBars;
    static getIns(): GroupResManager;
    /**
     * 注册加载时的进度条
     * @param  {string} winName 加载条界面名称
     * @param  {number} progressUpdateType 进度通知消息编号
     * @param  {any} loadingWindow 显示对象构造函数
     * @returns void
     */
    registLoadingWindow(winName: string, progressUpdateType: number, loadingWindow: any): void;
    /**
     * 加载资源组
     * @param  {string} sname 组名称
     * @param  {Function} callBack 加载完成的回调函数
     * @param  {any} thisObj
     * @param  {boolean=true} showBar 是否显示加载进度条
     * @returns void
     */
    loadGroup(gname: string, callBack: Function, thisObj: any, showBar?: boolean, prio?: number, args?: Array<any>): void;
    /**
     * 资源组加载完成
     */
    private onResourceLoadComplete(event);
    /**
     * 资源组加载出错
     */
    private onItemLoadError(event);
    /**
     * 资源组加载出错
     */
    private onResourceLoadError(event);
    /**
     * 资源组加载进度
     */
    private onResourceProgress(event);
}
/**
 * 可以逐帧调用的接口
 * @see RenderManager
 * @author nodep
 * @version 1.0
 */
interface IRender {
    /**
     * 触发函数
     * @param  {number} interval 距离上一次触发经过的时间
     */
    renderUpdate(interval: number): any;
}
/**
 * 日志输出
 * @author nodep
 * @version 1.0
 */
declare class LogTrace {
    /**
     * 输出字符串
     * @param  {any} str
     * @returns void
     */
    static log(str: any): void;
    /**
     * 输出当前系统时间
     * @returns void
     */
    static logTime(): void;
    static errorInfo(str: any): void;
}
/**
 * 一些不常用但必须有的功能集合的临时位置
 * 针对tip进行自动化与国际化预留
 * @author nodep
 * @version 1.1
 */
declare class NodepManager {
    /**当前是否激活,已由Render控制,也可通过对active事件监听并进行控制 */
    isActive: boolean;
    private static _ins;
    private _colorFlilter;
    private _colorFlilter2;
    private constructor();
    static getIns(): NodepManager;
    private _okHandler;
    private _errorHandler;
    private _ht;
    private _infoTMap;
    regsitErrorOkHandler(okHandler: Function, errorHandler: Function, ht: any): void;
    /**
     * 粗暴的错误信息提示
     * @param  {string} str
     * @returns void
     */
    errorInfo(str: string): void;
    /**
     * 未实现
     * @param  {string} str
     * @returns void
     */
    okInfo(str: string): void;
    /**
     * 设置为灰色或重置
     * @param  {egret.DisplayObject} target
     * @param  {boolean} flag
     */
    setGrey(target: egret.DisplayObject, flag: boolean): void;
    /**
     * 设置为半灰色或重置
     * @param  {egret.DisplayObject} target
     * @param  {boolean} flag
     */
    setGreyHalf(target: egret.DisplayObject, flag: boolean): void;
    private _tipInit;
    private _tipObj;
    private _tipCallBack;
    private _tipThisObj;
    private _tipJsonName;
    /**
     * 注册tip的回调函数
     * @param  {Function} callBack
     * @param  {any} thisObj
     * @returns void
     */
    registTipHandler(callBack: Function, thisObj: any, tipJsonName?: string): void;
    /**获取tip,必须以helpTip_n的方式从description_json的help对象中获取数组.
     * @param  {string} name
     */
    getTip(name: string): string;
    /**
     * 为某个对象添加help点击事件
     * @param  {egret.DisplayObject} target
     */
    addHelpTipHandler(target: egret.DisplayObject): void;
    private helpTapHandler(evt);
}
/**
 * 游戏主循环控制器
 * @see registRender,unregistRender,IRender
 * @author nodep
 * @version 1.2
 */
declare class RenderManager {
    private static _ins;
    private static _stage;
    private static _renderList;
    private static _lastTime;
    private static _frameTime;
    private static _nodepTimered;
    private static _lastTimeredTime;
    static frameRate: number;
    private static _iframe;
    private static _bzCount;
    static getIns(): RenderManager;
    private constructor();
    startRender(stage: egret.Stage): void;
    protected static enterFrameHandler(evt: egret.Event, isTimered?: boolean): void;
    /**
     * 启动
     * @param  {IRender} render
     */
    registRender(render: IRender): void;
    /**
     * 移除
     * @param  {IRender} render
     */
    unregistRender(render: IRender): void;
}
/**
 * 适配器for Safari
 * @author nodep
 * @version 1.0
 */
declare class ScreenManager {
    private static _baseUI;
    constructor(ui: egret.DisplayObjectContainer);
    private windowResizeHandler(evt);
}
/**
 * 声音管理器
 * @author nodep
 * @version 1.1
 */
declare class SoundManager {
    private static _ins;
    private _nowBg;
    private _bgC;
    enable: boolean;
    private _durTDic;
    private _soundDic;
    constructor();
    static getIns(): SoundManager;
    /**
     * 播放背景音乐
     * @param  {string} mp3 xxx_mp3
     * @param  {number=0} times 播放次数,默认循环
     */
    playBg(mp3: string, times?: number): void;
    /**
     * 循环播放音效
     * @param  {string} mp3 xxx_mp3
     * @param  {number=1} toV
     */
    playSoundLoop(mp3: string, toV?: number): void;
    /**
     * 停止循环音效的播放
     * @param  {string} mp3
     */
    stopSoundLoop(mp3: string): void;
    /**
     * 播放音效
     * @param  {string} mp3 音效名称 xxx_mp3
     * @param  {number=1} toV 音效大小
     * @param  {number=0} durT 多长时间以内不能再次播放次音效
     */
    playSound(mp3: string, toV?: number, durT?: number): void;
}
/**
 * 界面管理
 * 添加打开或关闭界面的方法:如果界面已打开,则进行关闭
 * @author nodep
 * @version 1.01;
 */
declare class WinsManager {
    private _sm;
    private static _ins;
    private _baseUi;
    private _layerMap;
    private _windowMap;
    static stageWidth: number;
    static stageHeight: number;
    private constructor();
    static getIns(): WinsManager;
    /**
     * 整个框架的初始化入口
     * @param  {eui.UILayer} ui
     * @returns void
     */
    initGame(ui: eui.UILayer): void;
    private addLayer(layerName, layer, endable?);
    /**
     * 开启或关闭窗口
     * @param  {any} cls 类名
     * @returns void
     */
    switchWin(cls: any): void;
    /**
     * 某个界面是否在舞台上
     * @param  {any} cls 类名
     * @returns boolean
     */
    isInStage(cls: any): boolean;
    /**
     * app模式的预加载,并不会打开,优先级低,在执行openWindow时,将优先级提高
     * 此优先级的不会占用加载显示
     * @param  {any} cls
     * @returns void
     */
    preOpenWindow(cls: any): void;
    /**
     * 打开一个界面
     * @param  {any} cls
     * @param  {boolean=false} clearLayer
     * @param  {number=0} index
     * @returns void
     */
    openWindow(cls: any, clearLayer?: boolean, index?: number, showLoading?: boolean): void;
    private readyOpen(cls, clearLayer?, index?);
    /**
     * 将界面打开到某个层
     * @param  {any} cls
     * @param  {string} layerType
     * @returns void
     */
    openWindowToLayer(cls: any, layerType: string): void;
    /**
     * 关闭界面
     * @param  {any} target
     * @returns void
     */
    closeWin(target: any): void;
    private removeWinReady(win);
    /**
     * 发送通知消息到指定的界面集合
     * @param  {number} updateType 消息编号
     * @param  {Array<string>} typeNames 需要接受通知的界面
     * @param  {any=null} updateData 消息体,绝大部分时候都应该是null,因为未打开的界面是接受不到消息的
     * @returns void
     */
    updateWin(updateType: number, typeNames: Array<string>, updateData?: any): void;
    /**
     * 界面被唤醒
     * @returns void
     */
    globActive(): void;
    /**
     * 发送通知到当前所有打开的界面
     * @param  {number} updateType
     * @param  {any} updateData
     * @returns void
     */
    globalUpdate(updateType: number, updateData: any): void;
    private stageResizeHandler(evt);
    $autoScaleX: number;
    $autoScaleY: number;
    private autoScale();
    /**
     * 回收制定的界面
     * @param  {any} key
     * @returns void
     */
    gcWindow(key: any): void;
    /**
     * 回收所有当前不在舞台的界面
     * @returns void
     */
    gcWindowAll(): void;
    /**
     * 获取当前游戏的舞台
     * @returns egret
     */
    gameStage(): egret.Stage;
}
declare module nodep {
    class TweenItem {
        type: string;
        props: any;
        durT: number;
        ease: Function;
        constructor(t: string);
        dispose(): void;
    }
}
/**
 * 事件调度
 * @author nodep
 * @version 1.0
 */
declare class EventDispatcher {
    private static _lis;
    static regist(type: number, handler: Function, thisObj: any): void;
    static unregist(type: number, handler: Function, thisObj: any): void;
    static dispatch(type: number, args?: any[]): void;
}
/**
 * 临时加载的资源中心
 * @version 1.0
 * @author nodep
 */
declare class SynResCenter {
    private static _btds;
    /**
     * 获取一个图片资源
     * @param  {string} url
     * @returns egret
     */
    static getBitmapData(url: string): egret.BitmapData;
    /**
     * 是否有某个图片
     * @param  {string} url
     * @returns boolean
     */
    static hasBtd(url: string): boolean;
    /**
     * 获取某个位图数据
     * @param  {string} url
     * @param  {egret.BitmapData} btd
     * @returns void
     */
    static setBitmapData(url: string, btd: egret.BitmapData): void;
    static setBitmapDataAsHeadCir(url: string, btd: egret.BitmapData): void;
}
/**
 * 位图的应用工具
 * 通过资源名称创建一个位图,
 * @author nodep
 * @version 1.0
 */
declare class BitmapUtil {
    private constructor();
    /**
     * 获取一个bitmap
     * @param  {string} name RES中的名称
     * @param  {boolean=false} centerFlag 是否为中心注册点
     */
    static createBitmapByName(name: string, centerFlag?: boolean): egret.Bitmap;
    /**
     * 获取一个贴图
     * @param  {string} name RES中的名称
     */
    static getBitmapTexture(name: string): egret.Texture;
    /**
     * 制作一个快照图片
     */
    static createSnapshot(dis: egret.DisplayObject): egret.Bitmap;
    /**
     * 回收一个快照
     * @param  {egret.Bitmap} bit
     * @returns void
     */
    static removeSnapshot(bit: egret.Bitmap): void;
}
/**
 * 延迟调用函数
 * @author nodep
 * @version 1.1
 */
declare class DelayCall implements IRender {
    protected key: string;
    protected delayTime: number;
    protected repeatCount: number;
    private _costTime;
    private _callBack;
    private _thisObject;
    private _args;
    private static _delayMap;
    private constructor();
    /**
     * 延迟回调函数
     * @param  {number} delayTime 延迟时间毫秒
     * @param  {Function} callBack 回调函数
     * @param  {any} thisObject 函数父节点
     * @param  {Array<any>=null} args 返回给函数的参数集合
     * @param  {number=1} repeat 重复次数，默认为1次。<=0为无限次循环
     * @param  {string=""} key 该延迟函数封装体的Key。会覆盖一样的Key，导致上一个Key不能手动停止
     */
    static call(delayTime: number, callBack: Function, thisObject: any, args?: Array<any>, repeat?: number, key?: string, autoClear?: boolean): DelayCall;
    /**
     * 根据构造时给的key,来移除和停止一个延迟函数
     * @param  {string} key
     */
    static removeCall(key: string): boolean;
    renderUpdate(interval: number): void;
}
/**
 * 数字应用
 */
declare class NumberUtil {
    /**
     * 将num转换为000,000,000的格式字符串
     * @param  {number} num
     * @param  {string="} sp 分隔符,默认为","。当使用bitmapLabel的时候需要
     * @param  {any} "
     */
    static getMoneyStr_1(num: number, sp?: string): string;
    /**
     * 获取金币格式 xxx千，千万
     */
    static getMoneyStr_2(num: number): string;
    /**
     * 獲取的金幣格式 1.2w
     */
    static getMoneyStr_3(num: number): string;
    /**在這裡設置為xxxK的格式 */
    static getMoneyStr_4(num: number): string;
    /**在這裡設置為xxxK的格式 >=1000則會有 */
    static getMoneyStr_5(num: number): string;
    /**
     * 在前面补0,默认补足2位
     */
    static getRoundStr_1(num: number, len?: number): string;
    /**
     * 保留2位小数,强制留00
     * @param  {number} num
     * @param  {number=2} len
     * @returns string
     */
    static getRoundStr_2(num: number, len?: number): string;
    /**
     * 在后面补0
     */
    static getRoundStr_3(str: string, len?: number): string;
    /**
     * 是否为手机号
     */
    static isPhoneNumber(str: string): boolean;
    /**
     * 獲取時間
     */
    static getHourFromMin(num: number): string;
    /**
     * 获取小时和分钟 00:00
     * @param  {number} num
     * @returns string
     */
    static getHourMin(num: number): string;
    /**
     * 获取时间xx:xx 分秒
     * @param  {number} num
     * @returns string
     */
    static getMinSec(num: number): string;
    /**
     * 讲一个字符串返回为139****0295
     * @param  {string} str
     * @param  {number=3} font
     * @param  {number=4} back
     * @returns string
     */
    static getPhoneScr(str: string, font?: number, back?: number): string;
}
/**
 * 焦点工具
 */
declare class FocusUtil {
    private static _imgBind;
    /**
     * 当target焦点发生变化时，指定bindImg的图片资源
     * @param  {egret.DisplayObject} target 例如：输入框
     * @param  {eui.Image} bindImg 例如：底部的横线
     * @param  {string} inSrc 例如：焦点进入时的图片
     * @param  {string} outSrc 例如：焦点退出时的图片
     * @returns void
     */
    static focusImgBind(target: egret.DisplayObject, bindImg: eui.Image, inSrc: string, outSrc: string): void;
    /**
     * 解除绑定
     * @param  {egret.DisplayObject} target
     * @returns void
     */
    static focusImgBindRemove(target: egret.DisplayObject): void;
    private static focusImgInHandler(evt);
    private static focusImgOutHandler(evt);
}
/**
 * 时间工具
 * @version 1.0
 * @author nodep
 */
declare class TimeUtil {
    /**
     * 年月日部分 2017-08-10
     * @param  {number} ms
     * @param  {string="-"} spt
     * @returns string
     */
    static getTimeStr_1(ms: number, spt?: string): string;
    /**
     * 时分部分 11:00
     * @param  {number} ms
     * @param  {string=":"} spt
     * @returns string
     */
    static getTimeStr_2(ms: number, spt?: string, hasSec?: boolean): string;
    /**
     * 月日部分 08-10
     * @param  {number} ms
     * @param  {string="-"} spt
     * @returns string
     */
    static getTimeStr_3(ms: number, spt?: string): string;
    /**
     * 话费分，不足分为秒
     * @param  {number} sec 秒
     * @returns string
     */
    static getLastStr_1(sec: number): string;
}
/**
 * eui常用的工具类
 * @version 1.0
 * @author nodep
 */
declare class EuiUtil {
    /**
     * 获取一个图片,可能支持九宫格
     * @param  {string} source
     * @param  {egret.Rectangle=null} scale9Grid
     * @returns eui
     */
    static getImage(source: string, scale9Grid?: egret.Rectangle): eui.Image;
}
/**
 * 常用算法
 * @version 1.0
 * @author nodep
 */
declare class NodepUtil {
    /**
     * 遍历数组中的项，依次循环添加到目标数组
     * @param  {any[]} sList
     * @param  {any[]} tos 二位数组
     * @param  {boolean=true} reset
     * @returns void
     */
    static listFillTo01(sList: any[], tos: any[], reset?: boolean): void;
    /**
     * 利用cls类型填充list,也可能删减
     * @param  {any[]} list
     * @param  {any} cls
     * @param  {any} count
     * @returns void
     */
    static fill(list: any[], cls: any, count: number, removed?: boolean, p?: egret.DisplayObjectContainer): void;
}
/**
 * 服务器时间
 * @version 1.0
 * @author nodep
 */
declare class ServerTime {
    private static _stime;
    private static _startT;
    static initBySec(s: number): void;
    static getTime(): number;
    private static _groupMap;
    private static _groupNames;
    /**
     * 注册一个依赖于服务器时间的函数
     * @param  {string} key 所属组
     * @param  {Function} handler 监听函数
     * @param  {any} thisObj 回执
     * @param  {any[]} args 参数
     * @param  {number} t 时间
     * @returns void
     */
    static regist(key: string, handler: Function, thisObj: any, args: any[], t: number): void;
    static delGroup(key: string): void;
    /**
     * 判断两天是否为同一天
     * @param  {number} ms
     * @returns boolean
     */
    static isToday(ms: number): boolean;
    private static enterframe();
}
/**
 * 对象工具
 * @author nodep
 * @version 1.0
 */
declare class ObjUtil {
    /**
     * 不严格的对象拷贝
     * @param  {any} from 数据源
     * @param  {any} to 输入到对象啊
     * @returns void
     */
    static copyTo(from: any, to: any): void;
}
/**
 * 在此数组中存放的值对象的某个值是唯一的
 * 例如在这里存放一个结构为{"name":xxx,"value":xxxx}的对象数组，我们需要name是唯一的，那么构造为
 * new ArraySole<T> = new ArraySole(TClass,"name");
 * @author nodep
 * @version 1.0
 */
declare class ArraySole<T> {
    private _cls;
    private _key;
    datas: Array<T>;
    /**
     * @param  {any} cls 该值对象的构造函数
     */
    constructor(cls: any, key: string);
    /**
     * 更新数据
     * @param  {any} obj
     * @returns void
     */
    addOrUpdate(obj: any): void;
    /**
     * 批量更新
     * @param  {any} objs
     * @returns void
     */
    addOrUpdateDatas(objs: any[]): void;
    /**
     * 根据单一条件获取一个新的数组
     * @param  {string} key key值
     * @param  {any} value 属性
     * @returns T
     */
    getSubBy(key: string, value: any): T[];
}
/**
 * 骨骼动画
 */
declare class DragonUtil {
    private static _fcMap;
    private static _zipData;
    /**
     * 骨骼工厂,简单版
     */
    static getMc(dname: string, armatureName: string): dragonBones.EgretArmatureDisplay;
    private static getJson(key);
    static registJson(key: string, value: any): void;
}
/**
 * 图片加载
 * @author nodep
 * @version 1.0
 */
declare class Loader extends eui.Component implements eui.UIComponent {
    static HEAD_CIRCLE: number;
    private _url;
    private _bit;
    _data: any;
    type: number;
    url: string;
    constructor();
    protected partAdded(partName: string, instance: any): void;
    protected childrenCreated(): void;
    updateImg(): void;
    private loadError(event);
    private loadCompleted(event);
}
/**
 * 传统手机目录缩放组件
 * @author nodep
 * @version 1.0
 */
declare class MenuGroup {
    private _bar;
    private _imgs;
    private _targets;
    private _targetsPos;
    private _showed;
    private _px;
    private _py;
    /**
     * @param  {eui.Image} barImg 监听按钮点击的对象
     * @param  {string[]} imgs 长度2的图片，0:缩,1:开
     * @param  {egret.DisplayObject[]} targets 被控制的图片
     */
    constructor(barImg: eui.Image, imgs: string[], targets: egret.DisplayObject[], autoHide?: boolean);
    readonly isshowed: boolean;
    private showOrHide(evt);
    show(ease?: boolean): void;
    hide(): void;
    offset(px: number, py: number): void;
}
/**
 * 列表
 */
declare class ListBox {
    private _box;
    private _cls;
    private _spY;
    private _everyH;
    private _upH;
    private _downH;
    private _mh;
    private _thisObj;
    private _datas;
    private _items;
    private _gcItemds;
    _autoBottom: boolean;
    private _bottomH;
    private _bottomRect;
    private _autoB;
    private _autoT;
    private _over;
    toBottomSpeed: number;
    /**
     * 通过一个容器与显示组件来构造一个List
     * @param  {eui.Group} box
     * @param  {any} cls
     */
    constructor(box: eui.Group, cls: any, spY?: number, everyH?: number, bottomH?: number, over?: boolean);
    /**
     * 初始化响应函数
     * @param  {Function} upHandler 向上反弹时是否响应函数
     * @param  {Function} downHandler 向下反弹时是否相应函数
     * @param  {any} thisObj
     * @returns void
     */
    initHandler(upHandler: Function, downHandler: Function, thisObj: any, autoB?: Function, autoT?: Function): void;
    initMoveHandler(mh: Function): void;
    toTop(delayc?: boolean, move?: boolean): void;
    /**
     * 滚动到最底部
     * @param  {boolean=true} delayc
     * @returns void
     */
    toBottom(delayc?: boolean, move?: boolean): void;
    private _needUp;
    private _needDown;
    private moveHandler(evt);
    private outHandler(evt);
    /**
     * 增加一条信息到下面
     * @param  {any} d
     * @param  {boolean=true} mc
     */
    pushOneToBottom(d: any, mc?: boolean, hard?: boolean): boolean;
    /**
     * 设置数据集,全部更新
     * @param  {any[]} ds
     * @returns void
     */
    changeDatas(ds: any[]): void;
    /**
     * 通过片动画的方式删除一个alpha
     * @param  {any} target
     * @returns void
     */
    removeOneByMc(target: any): void;
    private removeOne(target);
    private updateDatas();
    private updatePoses(byMc?, autoBottom?, mcBottom?);
}
/**
 * 数据
 */
interface ItemRender {
    updateData(d: any): any;
    getData(): any;
    playIn(): any;
}
/**
 * 基础层级容器的实现
 * @author nodep
 * @version 1.0
 */
declare class GameLayer extends egret.DisplayObjectContainer implements GameLayerInterface {
    /**
     * 层级的唯一名称
     */
    layerType: string;
    private _wins;
    private _popCount;
    private _popShape;
    /**
     * 添加一个界面到舞台
     */
    addWindow(win: GameWindow, toIndex: number): void;
    clearLayer(): void;
    /**
     * 移除一个界面
     */
    removeWindow(win: GameWindow): void;
    /**
     * 刷新阻挡层
     */
    private updateModel();
    /**
     * 界面大小变化
     */
    resize(): void;
    autoScale(): void;
}
/**
 * 不定模块模式的资源管理器
 * @author nodep
 * @version 1.0
 */
declare class NoAppResCenter {
    private static _cfg;
    private static _getted;
    /**
     * 初始化NoAppResCenter的配置文件
     * @param  {string} jsonName 配置文件的Res名称
     * @returns void
     */
    static initConfig(jsonName: string): void;
    /**
     * 获取类的名称,同时如果没有设置过这个类的资源列表,则进行设置
     * @param  {any} cls
     */
    static getGroupName(cls: any): string;
}
declare module net {
    class Http {
        private static _callBackMap;
        private static _thisObjMap;
        private static _getting;
        private static _requestMap;
        /**
         * 注册监听
         * @param  {string} url
         * @param  {Function} callBack
         * @param  {any} thisObj
         * @returns void
         */
        static registerHandler(url: string, callBack: Function, thisObj: any): void;
        /**
         * @param  {string} url 请求地址
         * @param  {string} args "gameid=" + NetConfig.gameid + "&username=" + user.username + "&password=" + user.password;
         * @returns void
         */
        static post(url: string, args: string, durT?: number): void;
        /**
         * post返回
         * @param  {egret.Event=null} event
         * @param  {string=""} phoneNumber
         * @returns void
         */
        private static postCompletedHandler(event);
        private static postErrorHandler(event);
        private static clear(request);
        /**是否可发送 */
        private static canSend(key, t?);
    }
}
declare module net {
    /**
     * socket,去掉了单例的要求
     * @author nodep
     * @version 2.0
     */
    class Socket extends egret.WebSocket implements IRender {
        canReconnect: boolean;
        private _handlerMap;
        private _handlerThis;
        private _ip;
        private _port;
        private _tryConnect;
        private _errorCount;
        private _reconnet;
        private _timeout;
        private _url;
        private _locks;
        private _used;
        delayRe: number;
        private _reTimes;
        constructor();
        /**
         * 初始化一个socket
         * @param  {string} ip
         * @param  {number} port
         * @param  {boolean=false} autoLink
         * @returns void
         */
        init(ip: string, port: number): void;
        initByUrl(url: string): void;
        private _openHandler;
        private _openThisObj;
        /**
         * 注册链接打开的监听函数。函数的参数为一个boolean,true表示为第一次链接
         * @param  {Function} openHandler
         * @param  {any} thisObj
         * @returns void
         */
        registHandlers(openHandler: Function, thisObj: any): void;
        private _reHandler;
        private _reThisObj;
        /**
         * 注册链接重新连接的监听函数。正在重新连接,由连接成功唤醒,一个参数,true表示开始连接,false代表连接结束
         * @param  {Function} openHandler
         * @param  {any} thisObj
         * @returns void
         */
        regsitReconnect(openHandler: Function, thisObj: any): void;
        private _nos;
        unLognos(nos: number[]): void;
        private firstLink();
        private onReceiveMessage(e);
        /**连接成功 */
        private onSocketOpen();
        /**连接关闭 */
        private onSocketClose();
        /**连接错误 */
        private onSocketError();
        private _closeHandler;
        private _closeT;
        registClose(handle: Function, o: any): void;
        /**重新连接 */
        private reconnet();
        private readyReconnect();
        regist(no: number, handler: Function, thisObj: any): void;
        private _packOuts;
        /**發送 */
        sendPack(pack: PackOut): void;
        renderUpdate(interval: number): void;
        /**
        * 设置一个锁,在多少时间内不能发送此封包
        * @param  {number} no
        * @param  {number} times
        * @returns void
        */
        setLock(no: number, times: number): void;
        /**
         * 手动清除锁
         * @param  {number} no
         * @returns void
         */
        clearLock(no: number): void;
    }
}
/**
 * 接受到的服務器的消息包
 * @author nodep
 * @version 1.0
 */
declare class PackIn {
    private _dataView;
    private _pos;
    private _signature;
    identifier: number;
    code: number;
    session: number;
    length: number;
    constructor(ab: ArrayBuffer);
    rewind(): void;
    readJson(): any;
    readBool(): boolean;
    readBoolean(): boolean;
    readInteger(): number;
    readInt(): number;
    readString(): string;
    readByteArray(): Uint8Array;
    readFloat(): number;
    readDouble(): number;
    readListAny(itemReaders: Function[]): any[];
    readList(itemReader: any): any[];
    /**读取二维数组 */
    readList2(itemReader: any, ppLen?: number): any[];
}
/**
 * 發送的封包
 * @author nodep
 * @version 1.0
 */
declare class PackOut {
    private static addS;
    private _buffer;
    private _session;
    private _code;
    private _dataView;
    private _length;
    private _pos;
    constructor(code: number, len?: number);
    getCode(): number;
    private _ensureLength();
    getBuffer(): ArrayBuffer;
    setSession(session: number): void;
    getSession(): number;
    writeHead(): void;
    writeDouble(v: number): void;
    writeInteger(v: number): void;
    writeString(str: string): void;
    writeBytes(ab: ArrayBuffer): void;
    writeBoolean(b: boolean): void;
    writeFloat(v: number): void;
    writeList(list: any[], itemWriter: Function): void;
    dumpInfo(): void;
}
/**
 * UTF8
 * @version 1.0
 * @author nodep
 */
declare class UTF8 {
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
    static stringToByteArray(str: string): Uint8Array;
    /**
     *
     * @param array {Uint8Array}
     * @returns {String}
     */
    static byteArrayToString(array: Uint8Array): string;
}
