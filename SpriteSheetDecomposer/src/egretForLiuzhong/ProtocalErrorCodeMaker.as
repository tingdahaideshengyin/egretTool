package egretForLiuzhong
{
	import flash.desktop.Clipboard;
	import flash.desktop.ClipboardFormats;
	import flash.filesystem.File;
	
	import nodep.util.FileUtil;
	
	public class ProtocalErrorCodeMaker
	{
		public static function errorCodeMake(targetFile:File):void{
			var str:String = FileUtil.getStr(targetFile.nativePath);
			var value:String = "";
			str = str.replace(/ /g,"");
			str = str.replace(/\n\n/g,"\n");
			var infos:Array = str.split("\n");
			//publicstaticLoginResult={
//			IMAGE_TYPE_NOT_CORRECT:59,//图像类型不正确
			//};
			//publicstaticErrorCode={
			var fillLogin:Boolean = false;
			var fillError:Boolean = false;
			value = value+"public static loginErrorInfo:any = {";
			for(var i:int =0;i<infos.length;i++) {
				if(infos[i] == "publicstaticLoginResult={"){
					fillLogin = true;
					continue;
				}
				if(fillLogin){
					if(infos[i]=="};"){
						fillLogin = false;
						value = value.substr(0,value.length-1);
						value = value+ "};\npublic static errorInfo:any = {";
						continue;
					}
					var loginStr:String = infos[i];
					var a1:String = loginStr.split("//")[1];
					var k1:String;
					if(loginStr.indexOf(",")>=0)
						k1 = loginStr.substring(loginStr.indexOf(":")+1,loginStr.indexOf(","));
					else
						k1 = loginStr.substring(loginStr.indexOf(":")+1,loginStr.indexOf("//"));
					value = value + k1 + ":\"" + a1 + "\",";
				}
				
				if(infos[i] == "publicstaticErrorCode={"){
					fillError = true;
					continue;
				}
				if(fillError){
					if(infos[i]=="};"){
						fillError = false;
						value = value.substr(0,value.length-1);
						value = value+ "};\n";
						break;
					}
					var errorStr:String = infos[i];
					var a2:String = errorStr.split("//")[1];
					var k2:String;
					if(errorStr.indexOf(",")>=0)
						k2 = errorStr.substring(errorStr.indexOf(":")+1,errorStr.indexOf(","));
					else
						k2 = errorStr.substring(errorStr.indexOf(":")+1,errorStr.indexOf("//"));
					value = value + k2 + ":\"" + a2 + "\",";
				}
			}
			Clipboard.generalClipboard.setData(ClipboardFormats.TEXT_FORMAT,value,false);
//			class Protocol {
//				
//				// 登录结果
//				public static LoginResult = {
//					OK: 0,        // 成功
//					BAD_SESSION: 1,        // 错误的认证
//					ACCOUNT_EXISTS: 2,        // 帐号已存在
//					ACCOUNT_NOT_EXISTS: 3,        // 帐号不存在
//					ACCOUNT_LOCKED: 4,        // 账号已锁定
//					DB_ERROR: 5,        // 数据库错误
//					TOKEN_INVALID: 6,        // Token无效
//					UNKNOWN_ERROR: 7,        // 未知错误
//					SERVER_MAINTENANCE: 8,        // 服务器维护
//					MOBILE_NOT_CORRECT: 9,        // 手机号不正确
//					PASSWORD_NOT_CORRECT: 10,        // 密码不正确
//					NICKNAME_NOT_CORRECT: 11,        // 昵称不正确
//					VERIFY_CODE_EXPIRED: 12,        // 验证码已过期
//					VERIFY_CODE_NOT_CORRECT: 13,        // 验证码不正确
//					MOBILE_EXISTS: 14,        // 手机号已注册
//					NICKNAME_EXISTS: 15,        // 昵称已注册
//					BAD_ARGUMENTS: 16,        // 错误的参数
//					SEND_VERIFY_CODE_FAIL: 17,        // 发送手机验证码失败
//					GENDER_NOT_CORRECT: 18,        // 性别不正确
//					REFERRER_NOT_CORRECT: 19,        // 推荐人不正确
//					REFERRER_NOT_EXISTS: 20,        // 推荐人不存在
//					ACCOUNT_EXCEPTION: 21,        // 帐号异常
//					ACCOUNT_ALREADY_LOGIN: 22         // 该帐号已登录
//				};
//				
//				// 被踢下线的原因
//				public static KickType = {
//					LOGIN_DUPLICATE: 1,        // 帐号在别处登录
//					LOGIN_LOCK: 2,        // 帐号被锁定
//					FOUND_ERROR: 3,        // 检查到帐号异常
//					SERVER_MAINTENANCE: 4,        // 服务器维护
//					SERVER_EXCEPTION: 5         // 服务器异常
//				};
//				
//				// 错误码
//				public static ErrorCode = {
//					OK: 0,        // OK
//					BAD_ARGUMENTS: 1,        // 错误的参数
//					NO_ENOUGH_GOLD: 2,        // 金币不足
//					ROOM_NOT_EXIST: 4,        // 房间不存在
//					ROOM_IS_FULL: 5,        // 房间已满人
//					ALREADY_IN_ROOM: 6,        // 已在某房间
//					USER_NOT_EXIST: 7,        // 用户不存在
//					KICKED: 9,        // 已被踢
//					INVALID_VERIFY_CODE: 10,        // 验证码错误
//					UNKNOWN_ERROR: 11,        // 未知错误，稍后重试
//					SERVER_MAINTENANCE: 12,        // 服务器维护
//					ACCESS_DENY: 13,        // 非授权操作
//					ACCOUNT_EXCEPTION: 14,        // 帐号异常
//					NOT_IN_CHAT_ROOM: 15,        // 不在聊天室中
//					NOT_IN_ROOM: 16,        // 不在游戏房间中
//					ALREADY_IS_FRIEND: 17,        // 已经是好友
//					NOT_FRIEND: 18,        // 不是好友
//					FRIEND_APPLY_NOT_EXIST: 19,        // 好友申请不存在
//					RED_ENVELOP_COMPLETED: 20,        // 红包已领完
//					RED_ENVELOP_EXPIRED: 21,        // 红包已过期
//					LACK_ARGUMENTS: 22,        // 缺少必要的参数
//					AMOUNT_NOT_CORRECT: 23,        // 金额不正确
//					COUNT_NOT_CORRECT: 24,        // 数量不正确
//					RED_ENVELOP_NOT_EXISTS: 25,        // 红包不存在
//					RECHARGE_AMOUNT_NOT_CORRECT: 26,        // 充值金额不正确
//					WITHDRAW_AMOUNT_NOT_CORRECT: 27,        // 提现金额不正确
//					FUND_PASSWORD_NOT_SET: 28,        // 尚未设定资金密码
//					WITHDRAW_NEED_MOBILE_CHECK: 29,        // 提现需要手机号验证
//					ACTION_UNREALIZED: 30,        // 接口尚未实现
//					ACTION_NOT_SUPPORT: 31,        // 接口不支持
//					PASSWORD_NOT_CORRECT: 32,        // 密码不正确
//					MOBILE_NOT_CORRECT: 33,        // 手机号不正确
//					VERIFY_CODE_EXPIRED: 34,        // 验证码已过期
//					VERIFY_CODE_NOT_CORRECT: 35,        // 验证码不正确
//					BANKCARD_ALREADY_BIND: 36,        // 银行卡已绑定
//					BANKCARD_NOT_EXISTS: 37,        // 银行卡不存在
//					FUND_PASSWORD_NOT_CORRECT: 38,        // 资金密码不正确
//					ADD_RECORD_FAIL: 39,        // 添加记录失败
//					UPDATE_RECORD_FAIL: 40,        // 更改记录失败
//					BANKCARD_NOT_CORRECT: 41,        // 银行卡号不正确
//					ISSUE_ALREADY_CLOSE: 42,        // 期彩已封盘
//					BET_ISSUE_NOT_EXISTS: 43,        // 注单不存在
//					BET_ISSUE_INVALID: 44,        // 下注无效
//					BET_ISSUE_ALREADY_DRAW: 45,        // 注单已开奖
//					ROOM_NOT_OPEN: 46,        // 房间未开放
//					OVER_MODE_MAX_AMOUNT: 47,        // 超过玩法限额
//					OVER_ONE_ISSUE_MAX_AMOUNT: 48,        // 超过单期最大限额
//					OVER_REPEAT_RANK_LIMIT: 49,        // 超过重复名次数量
//					OVER_ONE_GROUP_MAX_COUNT: 50,        // 超过同一组合最大数量
//					TYPE_NOT_CORRECT: 51,        // 类型不正确
//					DATE_NOT_CORRECT: 52,        // 日期不正确
//					TIME_NOT_CORRECT: 53,        // 时间不正确
//					DATETIME_NOT_CORRECT: 54,        // 日期时间不正确
//					CONTINUE_ACTION: 55,        // 继续操作
//					IMAGE_DATA_NOT_CORRECT: 56,        // 图像数据不正确
//					IMAGE_FILE_NOT_CORRECT: 57,        // 图像文件不正确
//					IMAGE_FILE_TOO_LARGE: 58,        // 图像文件太大
//					IMAGE_TYPE_NOT_CORRECT: 59,        // 图像类型不正确
//					IMAGE_SIZE_NOT_CORRECT: 60,        // 图像尺寸不正确
//					OVER_ONE_ISSUE_MAX_BET_TIMES: 61,        // 超过单期最大单数
//					CANNOT_AGAIN_OPEN_ENVELOP: 62         // 不能再次领取
//				};
//				
//				public static CS_SERVER_CONFIRM = 2;
//				public static CS_GET_MOBILE_CODE = 4;
//				public static CS_CHECK_USER_ITEM = 6;
//				public static CS_REGISTER = 8;
//				public static CS_LOGIN = 10;
//				public static CS_FORGET_PASSWORD = 12;
//				public static CS_LOGOUT = 14;
//				public static CS_LOGIN2 = 15;
//				public static CS_PING_REPLY = 19;
//				public static CS_CLIENT_READY = 22;
//				public static CS_GET_BULLETIN_LIST = 25;
//				public static CS_GET_MARQUEE_LIST = 27;
//				public static CS_MODIFY_USER_AVATAR = 29;
//				public static CS_GET_ROOM_LIST = 31;
//				public static CS_ENTER_GAME_ROOM = 32;
//				public static CS_EXIT_GAME_ROOM = 34;
//				public static CS_BET_ISSUE = 37;
//				public static CS_GET_BET_ISSUE_LIST = 39;
//				public static CS_ENTER_CHAT_ROOM = 41;
//				public static CS_EXIT_CHAT_ROOM = 42;
//				public static CS_CHAT = 43;
//				public static CS_GET_ROOM_CHAT_LIST = 45;
//				public static CS_GET_CHAT_LIST = 47;
//				public static CS_APPLY_FRIEND = 49;
//				public static CS_RESPONE_APPLY_FRIEND = 51;
//				public static CS_BATCH_RESPONE_APPLY_FRIEND = 53;
//				public static CS_REMOVE_FRIEND = 55;
//				public static CS_GET_APPLY_FRIEND_LIST = 57;
//				public static CS_GET_FRIEND_LIST = 59;
//				public static CS_SEND_RED_ENVELOP = 61;
//				public static CS_GET_RED_ENVELOP_LIST = 63;
//				public static CS_GET_RED_ENVELOP_DETAILS = 65;
//				public static CS_OPEN_RED_ENVELOP = 67;
//				public static CS_GET_WITHDRAW_SETTING = 69;
//				public static CS_BIND_BANKCARD = 71;
//				public static CS_UNBIAD_BANKCARD = 72;
//				public static CS_SET_FUND_PASSWORD = 73;
//				public static CS_UPDATE_PASSWORD = 74;
//				public static CS_WITHDRAW_MOBILE_CHECK = 75;
//				public static CS_USER_RECHARGE = 76;
//				public static CS_USER_WITHDRAW = 77;
//				public static CS_BET_ISSUE_DRAW = 78;
//				public static CS_GET_GOLD_DETAIL_LIST = 79;
//				public static CS_GET_ISSUE_RESULT = 81;
//				public static CS_GET_DAY_BALANCE = 83;
//				public static CS_GET_SERVER_TIME = 85;
//				public static CS_GET_NOT_DRAW_ISSUE_LIST = 87;
//				public static CS_GET_DATE_BET_ISSUE_LIST = 89;
//				public static CS_GET_USER_AVATAR_LIST = 91;
//				public static CS_UPLOAD_USER_AVATAR = 93;
//				public static CS_GET_ISSUE_DRAW_LIST = 95;
//				public static CS_GET_ISSUE_ALL_DRAW_LIST = 97;
//				public static CS_GET_USER_DAY_TOTAL = 99;
//				
//				
//				
//				public static SC_SERVER_CONFIRM = 1;
//				public static SC_CONFIG_NOTIFY = 3;
//				public static SC_GET_MOBILE_CODE = 5;
//				public static SC_CHECK_USER_ITEM = 7;
//				public static SC_REGISTER = 9;
//				public static SC_LOGIN = 11;
//				public static SC_FORGET_PASSWORD = 13;
//				public static SC_LOGIN2 = 16;
//				public static SC_LOGOUT = 17;
//				public static SC_PING = 18;
//				public static SC_PING_RESULT = 20;
//				public static SC_SERVER_READY = 21;
//				public static SC_COMMON_RESPONSE = 23;
//				public static SC_COMMON_NOTIFY = 24;
//				public static SC_GET_BULLETIN_LIST = 26;
//				public static SC_GET_MARQUEE_LIST = 28;
//				public static SC_GET_ROOM_LIST = 30;
//				public static SC_ENTER_GAME_ROOM = 33;
//				public static SC_EXIT_GAME_ROOM = 35;
//				public static SC_GAME_ROOM_NOTIFY = 36;
//				public static SC_BET_ISSUE = 38;
//				public static SC_GET_BET_ISSUE_LIST = 40;
//				public static SC_CHAT = 44;
//				public static SC_GET_ROOM_CHAT_LIST = 46;
//				public static SC_GET_CHAT_LIST = 48;
//				public static SC_APPLY_FRIEND = 50;
//				public static SC_RESPONE_APPLY_FRIEND = 52;
//				public static SC_BATCH_RESPONE_APPLY_FRIEND = 54;
//				public static SC_REMOVE_FRIEND = 56;
//				public static SC_GET_APPLY_FRIEND_LIST = 58;
//				public static SC_GET_FRIEND_LIST = 60;
//				public static SC_SEND_RED_ENVELOP = 62;
//				public static SC_GET_RED_ENVELOP_LIST = 64;
//				public static SC_GET_RED_ENVELOP_DETAILS = 66;
//				public static SC_OPEN_RED_ENVELOP = 68;
//				public static SC_GET_WITHDRAW_SETTING = 70;
//				public static SC_GET_GOLD_DETAIL_LIST = 80;
//				public static SC_GET_ISSUE_RESULT = 82;
//				public static SC_GET_DAY_BALANCE = 84;
//				public static SC_GET_SERVER_TIME = 86;
//				public static SC_GET_NOT_DRAW_ISSUE_LIST = 88;
//				public static SC_GET_DATE_BET_ISSUE_LIST = 90;
//				public static SC_GET_USER_AVATAR_LIST = 92;
//				public static SC_UPLOAD_USER_AVATAR = 94;
//				public static SC_GET_ISSUE_DRAW_LIST = 96;
//				public static SC_GET_ISSUE_ALL_DRAW_LIST = 98;
//				public static SC_GET_USER_DAY_TOTAL = 100;
//				
//				
//				
//			}
		}
	}
}