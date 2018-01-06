module net {
	export class Http {

		private static _callBackMap: Map<string, Function> = new Map();
		private static _thisObjMap: Map<string, any> = new Map();
		private static _getting: Map<string, number> = new Map<string, number>();//发送控制
		private static _requestMap: Map<egret.HttpRequest, string> = new Map();

		/**
		 * 注册监听
		 * @param  {string} url
		 * @param  {Function} callBack
		 * @param  {any} thisObj
		 * @returns void
		 */
		public static registerHandler(url: string, callBack: Function, thisObj: any): void {
			this._callBackMap.set(url, callBack);
			this._thisObjMap.set(url, thisObj);
		}

		/**
		 * @param  {string} url 请求地址
		 * @param  {string} args "gameid=" + NetConfig.gameid + "&username=" + user.username + "&password=" + user.password;
		 * @returns void
		 */
		public static post(url: string, args: string, durT: number = 200): void {
			if (!this.canSend(url))
				return;
			var request: egret.HttpRequest = new egret.HttpRequest();
			// request.withCredentials = true;
			this._requestMap.set(request, url);
			request.responseType = egret.HttpResponseType.TEXT;
			request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
			request.open(url, egret.HttpMethod.POST);
			request.send(args);
			request.addEventListener(egret.Event.COMPLETE, this.postCompletedHandler, this);
			request.addEventListener(egret.IOErrorEvent.IO_ERROR, this.postErrorHandler, this);
			LogTrace.log(url + "?" + args);
		}

		/**
		 * post返回
		 * @param  {egret.Event=null} event
		 * @param  {string=""} phoneNumber
		 * @returns void
		 */
		private static postCompletedHandler(event: egret.Event): void {
			var request = <egret.HttpRequest>event.currentTarget;
			request.removeEventListener(egret.Event.COMPLETE, this.postCompletedHandler, this);
			request.removeEventListener(egret.IOErrorEvent.IO_ERROR, this.postErrorHandler, this);
			LogTrace.log("back:" + request.response);
			var url: string = this._requestMap.get(request);
			this.clear(request);
			if (url != null) {
				var callBack: Function = this._callBackMap.get(url);
				var thisObj: any = this._thisObjMap.get(url);
				callBack.apply(thisObj, [request.response]);
			} else {
				LogTrace.log("未注册的请求回置:" + request.response);
			}
			return;
		}

		private static postErrorHandler(event: egret.IOErrorEvent): void {
			var request = <egret.HttpRequest>event.currentTarget;
			var url: string = this._requestMap.get(request);
			LogTrace.log("post error : " + url + ":" + event.type);
			this.clear(request);
		}

		private static clear(request: egret.HttpRequest): void {
			var url: string = this._requestMap.get(request);
			if (url != null) {
				this._getting.delete(url);
				this._requestMap.delete(request);
			}
		}

		/**是否可发送 */
		private static canSend(key: string, t: number = 200): boolean {
			if (this._getting.get(key) == null) {
				this._getting.set(key, (new Date()).getTime() + t);
				return true;
			}
			var time: number = this._getting.get(key);
			if ((new Date()).getTime() > time) {
				this._getting.set(key, (new Date()).getTime() + t);
				return true;
			}
			else
				return false;
		}
	}
}