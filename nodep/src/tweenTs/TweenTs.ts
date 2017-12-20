/**
 * 性能更稳定,移动更精确的精简tween
 * 需要利用自己编写的触发器或直接用框架带的RenderManager做驱动。基于时间的，方便游戏中大量的位移动画。
 * 长距离精确位移过程中如果有抖动飘逸感觉，请自己在get,set中对应值取整数。
 * 因业务限制，暂时不做过多扩展
 * @version 1.0
 * @author nodep
 */
class TweenTs implements IRender {

	private static _tweenMap: Map<any, TweenTs> = new Map<any, TweenTs>();

	/**
	 * 设置到某个group中,可以通过group进行整体控制
	 * @param  {string} n
	 */
	public static set groupName(n: string) {

	}

	/**
	 * 移除某个对象的所有tween
	 * @param  {any} t
	 * @returns void
	 */
	public static removeTweens(t: any): void {
		if (!this._tweenMap.has(t))
			return;
		var tw: TweenTs = this._tweenMap.delete(t);
		RenderManager.getIns().unregistRender(tw);
		tw.dispose();
		this._tweenMap.log();
	}

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
	public static get(t: any, autoRemove: boolean = true, loopTimes: number = 1, completeHandler: Function = null, thisObj: any = null, args: any[] = null): TweenTs {
		if (autoRemove)
			this.removeTweens(t);
		var tw: TweenTs = new TweenTs();
		tw._tw = t;
		tw._loop = loopTimes;
		tw._comH = completeHandler;
		tw._tO = thisObj;
		tw._args = args;
		this._tweenMap.set(t, tw);
		return tw;
	}

	private _loop: number;
	private _comH: Function;
	private _tw: any;
	private _tO: any;
	private _args: any[];
	private _ts: nodep.TweenItem[] = [];
	private _index: number = 0;
	private _focusT: nodep.TweenItem;
	private _curT: number;
	private _curObj: any;
	private _startObj: any;

	private dispose(): void {
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
	}

	/**
	 * 如果你是单独使用这个类,请在enterFrame事件中,传入两次调用的差。
	 * 在Tween自身内部，不会来验证interval的真实和有效性。
	 * @param  {number} interval
	 * @returns void
	 */
	public renderUpdate(interval: number): void {
		if (!this._curObj)
			return;
		this._curT += interval;
		var key: any;
		for (key in this._curObj) {
			if (this._focusT.ease != null)
				this._tw[key] = this._startObj[key] + this._focusT.ease.call(nodep.Ease, this._curT / this._focusT.durT);
			else
				this._tw[key] = this._startObj[key] + Math.min(this._curT / this._focusT.durT, 1) * this._curObj[key];
		}
		if (this._curT >= this._focusT.durT) {//动画如果结束
			this._index++;
			if (this._index >= this._ts.length) {//如果已经循环完一次了
				if (this._comH != null)
					this._comH.apply(this._tO, this._args);
				this._loop--;
				if (this._loop <= 0) {//循环结束了
					TweenTs.removeTweens(this._tw);
					return;
				}
				this._index = 0;
			}
			this.setFocusToItem(this._ts[this._index]);
		}
	}

	private setFocusToItem(its: nodep.TweenItem): void {
		this._focusT = its;
		this._curObj = new Object();
		this._startObj = new Object();
		var key: any;
		for (key in its.props) {
			this._curObj[key] = its.props[key] - this._tw[key];
			this._startObj[key] = this._tw[key];
		}
		this._curT = 0;
	}

	public to(props: any, dur: number, esae: Function = null): TweenTs {
		var ts: nodep.TweenItem = new nodep.TweenItem("go");
		ts.durT = dur;
		ts.ease = esae;
		ts.props = props;
		this._ts.push(ts);
		if (!this._focusT)
			this.setFocusToItem(ts);
		RenderManager.getIns().registRender(this);
		return this;
	}

	public from(props: any, dur: number, ease: Function = null): TweenTs {
		return this;
	}

	public wait(dur: number): TweenTs {
		return this;
	}

	public call(c: Function, thisObj: any): TweenTs {
		return this;
	}
}