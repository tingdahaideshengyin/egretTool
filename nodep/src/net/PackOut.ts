/**
 * 發送的封包
 * @author nodep
 * @version 1.0
 */
class PackOut {
	private static addS: number = 0;
	private _buffer: ArrayBuffer;
	private _session: number = 0;
	private _code: number = 0;
	private _dataView: DataView;
	private _length: number = 10;
	private _pos: number = 10;
	public constructor(code: number, len: number = 1024) {
		PackOut.addS++;
		this._session = PackOut.addS;
		this._buffer = new ArrayBuffer(len);
		this._code = code;
		this._dataView = new DataView(this._buffer, 0);
	}

	public getCode(): number {
		return this._code;
	}

	private _ensureLength(): void {
		if (this._length < this._pos) {
			this._length = this._pos;
		}
	}

	public getBuffer(): ArrayBuffer {
		return this._buffer.slice(0, this._length);
	}

	public setSession(session: number): void {
		this._session = session;
	}

	public getSession(): number {
		return this._session;
	}

	public writeHead(): void {
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
	}

	public writeDouble(v: number): void {
		this._dataView.setFloat64(this._pos, v, true);
		this._pos += 8;
		this._ensureLength();
	}

	public writeInteger(v: number): void {
		if (v >= 0) {
			if (v < 249) {
				this._dataView.setUint8(this._pos, v);
				this._pos += 1;
			} else if (v <= 32767) {
				this._dataView.setUint8(this._pos, 254);
				this._pos += 1;
				this._dataView.setInt16(this._pos, v, true);
				this._pos += 2;
			} else if (v <= 2147483647) {
				this._dataView.setUint8(this._pos, 252);
				this._pos += 1;
				this._dataView.setInt32(this._pos, v, true);
				this._pos += 4;
			} else {
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
						} else {
							v = parseInt(str.substr(0, pos), 2);
							pos = 0;
						}
					} else {
						v = 0;
					}
					this._dataView.setUint8(this._pos, v);
					this._pos += 1;
					--max;
				}
			}
		} else {
			if (v >= -128) {
				this._dataView.setUint8(this._pos, 255);
				this._pos += 1;
				this._dataView.setInt8(this._pos, v);
				this._pos += 1;
			} else if (v >= -32768) {
				this._dataView.setUint8(this._pos, 254);
				this._pos += 1;
				this._dataView.setInt16(this._pos, v, true);
				this._pos += 2;
			} else if (v >= -2147483648) {
				this._dataView.setUint8(this._pos, 252);
				this._pos += 1;
				this._dataView.setInt32(this._pos, v, true);
				this._pos += 4;
			} else {
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
						} else {
							v = parseInt(str.substr(0, pos), 2);
							pos = 0;
						}
					} else {
						v = 0;
					}
					this._dataView.setUint8(this._pos, v);
					this._pos += 1;
					--max;
				}
			}
		}
		this._ensureLength();
	}

	public writeString(str: string): void {
		str = str || '';
		var byteArray = UTF8.stringToByteArray(str);
		this.writeInteger(byteArray.length);
		for (var i = 0; i < byteArray.length; ++i) {
			this._dataView.setUint8(this._pos, byteArray[i]);
			this._pos += 1;
		}
		this._ensureLength();
	}

	public writeBytes(ab: ArrayBuffer): void {
		this.writeInteger(ab.byteLength);
		for (var i: number = 0; i < ab.byteLength; i++) {
			this._dataView.setUint8(this._pos, ab[i]);
			this._pos += 1;
		}
		this._ensureLength();
	}

	public writeBoolean(b: boolean): void {
		this._dataView.setInt8(this._pos, b ? 1 : 0);
		this._pos += 1;
		this._ensureLength();
	}

	public writeFloat(v: number): void {
		this._dataView.setFloat32(this._pos, v, true);
		this._pos += 4;
		this._ensureLength();
	}

	public writeList(list: any[], itemWriter: Function): void {
		this.writeInteger(list.length);
		var key: any;
		for (key in list) {
			itemWriter.call(this, list[key])
		}
	}

	public dumpInfo(): void {
		LogTrace.log(this._code);
		var buffer: egret.ByteArray = new egret.ByteArray(this.getBuffer());
		buffer.position = 0;
		var str = '';
		for (var i = 0; i < buffer.length; ++i) {
			str += (buffer[i] + ',');
		}
		LogTrace.log(str);
	}
}