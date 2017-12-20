/**
 * 接受到的服務器的消息包
 * @author nodep
 * @version 1.0
 */
class PackIn {
	private _dataView: DataView;
	private _pos: number = 0;
	private _signature: number = 0;
	public identifier: number = 0;
	public code: number = 0;
	public session: number = 0;
	public length: number = 0;
	public constructor(ab: ArrayBuffer) {
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

	public rewind(): void {
		this._pos = 10;
	}

	public readJson(): any {
		return JSON.parse(this.readString());
	}

	public readBool(): boolean {
		var b = this._dataView.getInt8(this._pos);
		++this._pos;
		return b == 1;
	}

	public readBoolean(): boolean {
		return this.readBool();
	}

	public readInteger(): number {
		var r: number = 0;
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
	}

	public readInt(): number {
		return this.readInteger();
	}

	public readString(): string {
		var bytes = this.readByteArray();
		return UTF8.byteArrayToString(bytes);
	}

	public readByteArray(): Uint8Array {
		var len = this.readInteger();
		var arr = new Uint8Array(len);
		for (var i = 0; i < len; ++i) {
			arr[i] = this._dataView.getUint8(this._pos);
			this._pos += 1;
		}
		return arr;
	}

	public readFloat(): number {
		var f = this._dataView.getFloat32(this._pos, true);
		this._pos += 4;
		return f;
	}

	public readDouble(): number {
		var f = this._dataView.getFloat64(this._pos, true);
		this._pos += 8;
		return f;
	}

	public readListAny(itemReaders: Function[]): any[] {
		var arr: any[] = [];
		var len = this.readInteger();
		for (var i = 0; i < len; ++i) {
			var data: any[] = [];
			for (var j: number = 0; j < itemReaders.length; j++) {
				data.push(itemReaders[j].call(this));
			}
			arr.push(data);
		}
		return arr;
	}

	public readList(itemReader): any[] {
		var arr = [];
		var len = this.readInteger();
		for (var i = 0; i < len; ++i) {
			if (itemReader != null)
				arr.push(itemReader.call(this));
			else
				arr.push(this.readInt());
		}
		return arr;
	}

	/**读取二维数组 */
	public readList2(itemReader, ppLen: number = 2): any[] {
		var arr = [];
		var len = this.readInteger();
		for (var i = 0; i < len; ++i) {
			var args = [];
			for (var j: number = 0; j < ppLen; j++) {
				args.push(itemReader.call(this));
			}
			arr.push(args);
		}
		return arr;
	}
}