module net {

	/**
	 * socket,去掉了单例的要求
	 * @author nodep
	 * @version 2.0
	 */
	export class Socket extends egret.WebSocket implements IRender {

		public canReconnect: boolean = true;
		private _handlerMap: Map<number, Function> = new Map();
		private _handlerThis: Map<number, any> = new Map();
		private _ip: string;
		private _port: number;
		private _tryConnect: boolean = false;
		private _errorCount: number = 3;
		private _reconnet: boolean = false;
		private _timeout: number = 5000;
		private _url: string;
		private _locks: Map<number, number> = new Map();
		private _used: boolean = false;
		public delayRe: number = 1000;
		private _reTimes: number[] = [];

		public constructor() {
			super();
		}

		/**
		 * 初始化一个socket
		 * @param  {string} ip
		 * @param  {number} port
		 * @param  {boolean=false} autoLink
		 * @returns void
		 */
		public init(ip: string, port: number): void {
			this._ip = ip;
			this._port = port;
			this._url = ip + ":" + this._port;
			this.firstLink();
		}

		public initByUrl(url: string): void {
			this._url = url;
			this.firstLink();
		}

		private _openHandler: Function;
		private _openThisObj: any;

		/**
		 * 注册链接打开的监听函数。函数的参数为一个boolean,true表示为第一次链接
		 * @param  {Function} openHandler
		 * @param  {any} thisObj
		 * @returns void
		 */
		public registHandlers(openHandler: Function, thisObj: any): void {
			this._openHandler = openHandler;
			this._openThisObj = thisObj;
		}

		private _reHandler: Function;
		private _reThisObj: any;

		/**
		 * 注册链接重新连接的监听函数。正在重新连接,由连接成功唤醒,一个参数,true表示开始连接,false代表连接结束
		 * @param  {Function} openHandler
		 * @param  {any} thisObj
		 * @returns void
		 */
		public regsitReconnect(openHandler: Function, thisObj: any): void {
			this._reHandler = openHandler;
			this._reThisObj = thisObj;
		}

		private _nos: number[] = [];

		public unLognos(nos: number[]): void {
			while (nos.length > 0) {
				this._nos.push(nos.pop());
			}
		}

		private firstLink(): void {
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
		}

		//数据处理
		private onReceiveMessage(e: egret.Event): void {
			var bts: egret.ByteArray = new egret.ByteArray();
			this.readBytes(bts);
			var packIn: PackIn = new PackIn(bts.buffer);
			if (this._handlerMap.get(packIn.code) != null)
				this._handlerMap.get(packIn.code).apply(this._handlerThis.get(packIn.code), [packIn]);
			else {
				if (this._nos.indexOf(packIn.code) < 0)
					LogTrace.log("socketMessage code=" + packIn.code + "缺少处理");
			}
		}

		/**连接成功 */
		private onSocketOpen(): void {
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
		}

		/**连接关闭 */
		private onSocketClose(): void {
			LogTrace.log("连接断开");
			this._tryConnect = false;
			RenderManager.getIns().unregistRender(this);
			this.reconnet();
		}

		/**连接错误 */
		private onSocketError(): void {
			this.reconnet();
		}

		private _closeHandler: Function;
		private _closeT: any;

		public registClose(handle: Function, o: any): void {
			this._closeHandler = handle;
			this._closeT = o;
		}

		/**重新连接 */
		private reconnet(): void {
			if (this.connected || !this.canReconnect)
				return;
			DelayCall.removeCall("net_socket_self_frameworkForNodep" + this._errorCount);
			//判断网络是否稳定
			this._reTimes.push(egret.getTimer());
			if (this._reTimes.length > 3) {
				var tt: number = 0;
				for (var i: number = 0; i < 3; i++) {
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
		}

		private readyReconnect(): void {
			this._reconnet = true;
			this.connectByUrl(this._url);
			DelayCall.call(this._timeout, this.onSocketError, this, null, 1, "net_socket_self_frameworkForNodep" + this._errorCount);
		}

		public regist(no: number, handler: Function, thisObj: any): void {
			if (this._handlerMap.has(no)) {
				throw (new Error(NodepErrorType.NO_ALREADY_EXIST));
			}
			this._handlerMap.set(no, handler);
			this._handlerThis.set(no, thisObj);
		}

		private _packOuts: PackOut[] = [];

		/**發送 */
		public sendPack(pack: PackOut): void {
			if (this._locks.has(pack.getCode())) {
				if (egret.getTimer() < this._locks.get(pack.getCode()))
					return;
			}
			if (this._nos.indexOf(pack.getCode()) < 0 && !this.connected) {
				LogTrace.log("尝试发送" + pack.getCode());
			}
			this._packOuts.push(pack);
		}

		public renderUpdate(interval: number): void {
			if (!this.connected)
				return;
			while (this._packOuts.length > 0) {
				var pack: PackOut = this._packOuts.shift();
				if (this._nos.indexOf(pack.getCode()) < 0) {
					LogTrace.log("实际发送" + pack.getCode());
				}
				pack.writeHead();
				this.writeBytes(new egret.ByteArray(pack.getBuffer()));
			}
		}

		/**
	 	* 设置一个锁,在多少时间内不能发送此封包
	 	* @param  {number} no
	 	* @param  {number} times
	 	* @returns void
	 	*/
		public setLock(no: number, times: number): void {
			this._locks.set(no, egret.getTimer() + times);
		}

		/**
		 * 手动清除锁
		 * @param  {number} no
		 * @returns void
		 */
		public clearLock(no: number): void {
			this._locks.delete(no);
		}
	}
}