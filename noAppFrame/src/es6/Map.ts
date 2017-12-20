class Map<T, K> {

	private _keys: any[] = [];
	private _values: any[] = [];

	public constructor() {
	}

	public set(key: T, value: K) {
		var idx: number = this._keys.indexOf(key);
		if (idx >= 0) {
			this._keys[idx] = key;
			this._values[idx] = value;
		} else {
			this._keys.push(key);
			this._values.push(value);
		}
	}

	public delete(key: T): void {
		var idx: number = this._keys.indexOf(key);
		if (idx >= 0) {
			this._keys.splice(idx, 1);
			this._values.splice(idx, 1);
		}
	}

	public get(key: T): K {
		var idx: number = this._keys.indexOf(key);
		if (idx >= 0)
			return this._values[idx];
		else
			return null;
	}

	public has(key: T): boolean {
		var idx: number = this._keys.indexOf(key);
		return idx >= 0;
	}

	public forEach(fun: Function, thisObj: any): void {
		for (var i: number = 0; i < this._values.length; i++) {
			fun.call(thisObj, this._values[i]);
		}
	}

	public clear(): void {
		this._keys = [];
		this._values = [];
	}
}