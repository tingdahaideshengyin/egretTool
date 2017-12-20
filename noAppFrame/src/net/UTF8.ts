/**
 * UTF8
 * @version 1.0
 * @author nodep
 */
class UTF8 {

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
	public static stringToByteArray(str: string): Uint8Array {
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
			} else if (code < 0x07FF) {
				array.push(code >> 6 & 0x1F | 0xC0);
				array.push((code & 0x3F) | 0x80);
			} else if (code < 0xFFFF) {
				array.push(code >> 12 & 0xF | 0xE0);
				array.push(code >> 6 & 0x3F | 0x80);
				array.push(code & 0x3F | 0x80);
			} else {
				array.push(code >> 18 & 0xF8 | 0xF0);
				array.push(code >> 12 & 0x3F | 0x80);
				array.push(code >> 6 & 0x3F | 0x80);
				array.push(code & 0x3F | 0x80);
			}
		}
		return new Uint8Array(array);
	}

    /**
     *
     * @param array {Uint8Array}
     * @returns {String}
     */
	public static byteArrayToString(array: Uint8Array): string {
		var str = '';
		var count = array.length;
		var idx = 0;
		var code = 0;
		while (idx < count) {
			var byte1 = array[idx];
			if ((byte1 & 0x80) === 0) {
				code = byte1;
				idx += 1;
			} else if ((byte1 >> 5 << 5) === 0xC0) {
				var byte2 = array[idx + 1];
				code = ((byte1 & 0x1F) << 6) | (byte2 & 0x3F);
				idx += 2;
			} else if ((byte1 >> 4 << 4) === 0xE0) {
				var byte2 = array[idx + 1];
				var byte3 = array[idx + 2];
				code = (0xF & byte1) << 12 | (byte2 & 0x3F) << 6 | (byte3 & 0x3F);
				idx += 3;
			} else if ((byte1 >> 3 << 3) === 0xF0) {
				var byte2 = array[idx + 1];
				var byte3 = array[idx + 2];
				var byte4 = array[idx + 3];
				code = (0xF & byte1 << 18) | (byte2 << 12 & 0x3F) | (byte3 << 6 & 0x3F) | (byte4 & 0x3F);
				idx += 4;
			} else {
				throw new Error('can not decode utf8 string');
			}
			str += String.fromCharCode(code);
		}
		return str;
	}
}