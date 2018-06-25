/**
 * 斗地主相关算法,未做成单例是为了方便翻译为其他语言
 * 赖子单独使用不成牌，所以在所有的运算中，赖子从数量最小的开始消耗
 * 赖子不能变成赖子
 * 还需要完成模糊匹配getMatchCountFuzzy 和顺子判断 isFlush
 * 模糊匹配的重点就是顺子之外,没有在顺子中的都补到结尾,（在填充的时候，顺子中的赖子只可以补充到非空缺位，而不在顺子中的赖子只能补充到未定为的中）
 * 顺子的判断比较简单，这里不做描述
 * @author nodep
 * @version 1.0
 */
class DdzUtil {
	public static Lv0: number = 0;//不能构成牌组
	public static Lv1: number = 1;//单牌,算法验证通过
	public static Lv2: number = 2;//对牌,算法验证通过
	public static Lv3: number = 3;//三张,算法验证通过
	public static Lv4: number = 4;//三带一,算法验证通过
	public static Lv5: number = 5;//三带对,算法验证通过
	public static Lv6: number = 6;//顺子,算法验证通过
	public static Lv7: number = 7;//连对,算法验证通过
	public static Lv8: number = 8;//飞机,算法验证通过
	public static Lv9: number = 9;//飞机带翅膀,算法验证通过
	public static Lv10: number = 10;//四带二,算法验证通过
	public static Lv11: number = 11;//炸蛋,算法验证通过
	public static Lv12: number = 12;//王炸(就是火箭),算法验证通过
	//牌型一共11种,1~11对应单牌到王炸.赖子牌不能做为小丑
	private static _pool: DdzCardVO[];
	//计数用的数组
	private static _counterArray: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
	//vo的key对应vo
	private static _poolMap: Map<string, DdzCardVO> = new Map();
	//vo的唯一sortId对应vo,算法详见vo构造函数
	public static _poolMapByID: Map<number, DdzCardVO> = new Map();
	//获取牌的类型的函数
	public static _typeHandlerMap: Map<number, Function> = new Map();
	//获取指定类型的对比参数，也可用于确认是否是这个类型。后端主要用这个
	private static _argsHandlerMap: Map<number, Function> = new Map();
	//赖子牌
	private static _laizi: number[] = [];
	//手牌
	private _handCards: DdzCardVO[] = [];
	//提示牌组
	private _tipCards: any[];
	//当前提示牌组
	private _tipIndex: number = 0;
	//提示的顺序
	private _tipIndexSort: number[] = [];
	//提示用的排序对象
	private _tipSortArgs: any[] = [];
	//提示字符串
	private _tipUsed: string[] = [];

	public constructor() {
		if (DdzUtil._pool == null) {
			DdzUtil._pool = [];
			var vo: DdzCardVO;
			//创建3~K A 2
			for (var i: number = 3; i <= 15; i++) {
				for (var j: number = 1; j <= 4; j++) {
					vo = new DdzCardVO(i, j);
					DdzUtil._pool.push(vo);
					DdzUtil._poolMap.set(vo.key, vo);
					DdzUtil._poolMapByID.set(vo.sortId, vo);
				}
			}
			//创建小丑
			vo = new DdzCardVO(16, 1);
			DdzUtil._pool.push(vo);
			DdzUtil._poolMap.set(vo.key, vo);
			DdzUtil._poolMapByID.set(vo.sortId, vo);
			vo = new DdzCardVO(17, 1);
			DdzUtil._pool.push(vo);
			DdzUtil._poolMap.set(vo.key, vo);
			DdzUtil._poolMapByID.set(vo.sortId, vo);
			DdzUtil._typeHandlerMap.set(1, DdzUtil.getCard_1);
			DdzUtil._typeHandlerMap.set(2, DdzUtil.getCard_2);
			DdzUtil._typeHandlerMap.set(3, DdzUtil.getCard_3);
			DdzUtil._typeHandlerMap.set(4, DdzUtil.getCard_4);
			DdzUtil._typeHandlerMap.set(5, DdzUtil.getCard_5);
			DdzUtil._typeHandlerMap.set(6, DdzUtil.getCard_6);

			DdzUtil._argsHandlerMap.set(DdzUtil.Lv1, DdzUtil.getArg_1);
			DdzUtil._argsHandlerMap.set(DdzUtil.Lv2, DdzUtil.getArg_2);
			DdzUtil._argsHandlerMap.set(DdzUtil.Lv3, DdzUtil.getArg_3);
			DdzUtil._argsHandlerMap.set(DdzUtil.Lv4, DdzUtil.getArg_4);
			DdzUtil._argsHandlerMap.set(DdzUtil.Lv5, DdzUtil.getArg_5);
			DdzUtil._argsHandlerMap.set(DdzUtil.Lv6, DdzUtil.getArg_6);
			DdzUtil._argsHandlerMap.set(DdzUtil.Lv7, DdzUtil.getArg_7);
			DdzUtil._argsHandlerMap.set(DdzUtil.Lv8, DdzUtil.getArg_8);
			DdzUtil._argsHandlerMap.set(DdzUtil.Lv9, DdzUtil.getArg_9);
			DdzUtil._argsHandlerMap.set(DdzUtil.Lv10, DdzUtil.getArg_10);
			DdzUtil._argsHandlerMap.set(DdzUtil.Lv11, DdzUtil.getArg_11);
			DdzUtil._argsHandlerMap.set(DdzUtil.Lv12, DdzUtil.getArg_12);
		}
	}

	public checkSelfCards(): void {
		var rest: DdzCardVO[] = [];
		var ids: number[] = [];
		while (this._handCards.length > 0) {
			var cc: DdzCardVO = this._handCards.pop();
			if (ids.indexOf(cc.sortId) < 0) {
				rest.push(cc);
				ids.push(cc.sortId);
			}
		}
		this._handCards = rest;
	}

	/**
	 * 重新设定,赖子,手牌
	 * 在一局结束之后需要重新设定
	 */
	public resetAll(): void {
		DdzUtil._laizi = [];
		while (this._handCards.length > 0)
			this._handCards.pop();
	}

	/**
	 * 获取手牌列表
	 * @returns DdzCardVO
	 */
	public getHandCards(): DdzCardVO[] {
		return this._handCards;
	}

	//清手排
	public clearHandCards(): void {
		this._handCards = [];
	}

	/**
	 * 添加赖子牌
	 * @param  {number[]} nums
	 */
	public addLaizi(nums: number[]): void {
		DdzUtil._laizi = [];
		while (nums.length > 0)
			DdzUtil._laizi.push(nums.pop());
	}

	public pushLaizi(num: number): void {
		DdzUtil._laizi.push(num);
	}

	public getLaizi(): number[] {
		return DdzUtil._laizi;
	}

	/**
	 * 添加手牌
	 * @param  {DdzCardVO[]} cards
	 * @param  {boolean=true} autoSort
	 * @returns void
	 */
	public addHandCards(cards: DdzCardVO[], autoSort: boolean = true): void {
		while (cards.length > 0)
			this._handCards.push(cards.pop());
		if (autoSort)
			this.sortHandCard();
	}

	/**
	 * 删除手牌
	 */
	public removeHandCards(sortIds: number[]): void {
		var i: number = this._handCards.length - 1;
		for (i; i >= 0; i--) {
			if (sortIds.indexOf(this._handCards[i].sortId) >= 0) {
				this._handCards.splice(i, 1);
			}
		}
	}

	/**
	 * 根据已确定的类型,获取比较用参数
	 * @param  {DdzCardVO[]} targetCards
	 * @returns any
	 */
	public getCompareArgs(type: number, targetCards: DdzCardVO[]): any {
		var arg: any;
		if (targetCards.length == 4) {//炸弹
			arg = DdzUtil.getArg_11(targetCards);
			if (arg != null)
				return arg;
		}
		else if (targetCards.length == 2) {
			arg = DdzUtil.getArg_12(targetCards);
			if (arg != null)
				return arg;
		}
		var handle: Function = DdzUtil._argsHandlerMap.get(type);
		return handle(targetCards);
	}

	/**
	* 比较牌的大小,必须有类型。客户端用的,后端无视
	* @param  {number} type 目标牌的类型
	* @param  {DdzCardVO[]} targetCards 目标牌的集合
	* @param  {DdzCardVO[]} selfCards 自己的牌组
	* @returns number 大于 = 1 等于 = 0 下于 = -1
	*/
	public isBiggerThan(type: number, targetCards: DdzCardVO[], selfCards: DdzCardVO[]): number {
		var args: any = this.getCompareArgs(type, targetCards);
		var selfArgs: any = null;
		if (selfCards.length == 4)//判断是否是炸蛋
			selfArgs = this.getCompareArgs(DdzUtil.Lv11, selfCards);
		if (selfCards.length == 2)//是否是王炸
			selfArgs = this.getCompareArgs(DdzUtil.Lv12, selfCards);
		if (!selfArgs)
			selfArgs = this.getCompareArgs(type, selfCards);
		return this.compareBigger(args, selfArgs);
	}

	/**
	 * 比较大小,如果大返回正数,否则返回负数
	 * @param  {any} args
	 * @param  {DdzCardVO[]} selfCards
	 * @returns number
	 */
	public compareBigger(args: any, selfCards: any): number {
		if (selfCards == null)
			return -1;
		var isBomb: boolean = selfCards.type == DdzUtil.Lv11 || selfCards.type == DdzUtil.Lv12;
		if (args.type < DdzUtil.Lv11 && isBomb)
			return 1;
		switch (args.type) {//目标类型
			case DdzUtil.Lv1://单牌
			case DdzUtil.Lv2://对牌
			case DdzUtil.Lv3://三条
			case DdzUtil.Lv4://三带一
			case DdzUtil.Lv5://三带对
			case DdzUtil.Lv10://四带二
				if (selfCards.type == args.type) {
					return selfCards.max > args.max ? 1 : -1;
				}
				break;
			case DdzUtil.Lv6://顺子
			case DdzUtil.Lv7://连续对
			case DdzUtil.Lv8://飞机
			case DdzUtil.Lv9://飞机翅膀
				if (selfCards.type == args.type && selfCards.count == args.count) {
					return selfCards.max > args.max ? 1 : -1;
				}
				break;
			case DdzUtil.Lv11:
				if (selfCards.type == DdzUtil.Lv12) {
					return args.subType < 3 ? 1 : -1;
				} else if (selfCards.type == DdzUtil.Lv11) {
					if (selfCards.subType > args.subType) {
						return 1;
					} else if (selfCards.subType == args.subType) {
						return selfCards.max > args.max ? 1 : -1;
					} else {
						return -1;
					}
				}
				break;
			case DdzUtil.Lv12://如果对方是王炸,自己必须是赖子炸弹才可能
				if (selfCards.type == DdzUtil.Lv11) {
					if (selfCards.subType > 3)//赖子炸弹才能大过
						return 1;
					else
						return -1;
				}
				break;
		}
		return -1;
	}

	/**
	 * 清除提示牌数组
	 * @returns void
	 */
	public clearTip(): void {
		this._tipCards = null;
		this._tipIndex = -1;
	}

	/**
	 * 获取某个牌对应的提示牌,如果当前没有初始化提示牌,则创建提示牌
	 * @param  {number} type 目标牌类型
	 * @param  {DdzCardVO[]} targetCards 需要比较的牌，提示牌必须比这个牌大
	 * @returns DdzCardVO
	 */
	public getTipCards(type: number, targetCards: DdzCardVO[]): DdzCardVO[] {
		if (this._tipCards != null) {
			this._tipIndex++;
			if (this._tipIndex >= this._tipCards.length)
				this._tipIndex = 0;
			if (this._tipCards.length > 0)
				return this._tipCards[this._tipIndexSort[this._tipIndex]];
			else
				return [];
		}
		this._tipUsed = [];
		this._tipCards = [];
		this._tipIndexSort = [];
		this._tipSortArgs = [];
		//----------从手牌中寻找可能的提示牌组----------
		this.updateTipCards(type, targetCards);
		//讲_tipSortArgs的count从大到小排序,然后将他们的index存入_tipIndexSort
		this._tipSortArgs.sort(function (a, b) {
			return b.count - a.count;
		});
		for (var i: number = 0; i < this._tipSortArgs.length; i++) {
			this._tipIndexSort.push(this._tipSortArgs[i].index);
		}
		//------------------------------------------
		this._tipIndex++;
		if (this._tipIndex >= this._tipCards.length)
			this._tipIndex = 0;
		if (this._tipCards.length > 0)
			return this._tipCards[this._tipIndexSort[this._tipIndex]];
		else
			return [];
	}

	private sortTips(type: number): void {

	}

	/**
	 * 获取牌组所属类型
	 * @param  {DdzCardVO[]} selfCards 获取一个牌组的类型,如果为0,则不成牌组
	 * @returns number
	 */
	public static getCardsType(selfCards: DdzCardVO[]): number {
		if (selfCards.length == 0)
			return 0;
		var cardCount: number = selfCards.length;
		var handle: Function = DdzUtil._typeHandlerMap.get(cardCount);
		if (handle == null)
			handle = DdzUtil.getCardMore;
		var obj: any = handle(selfCards);
		if (obj != null)
			return obj.type;
		else
			return DdzUtil.Lv0;
	}

	/**
	 * 获取牌组所属类型
	 * @param  {DdzCardVO[]} selfCards 获取一个牌组的类型,如果为0,则不成牌组
	 * @returns number
	 */
	public static getCardsArgs(selfCards: DdzCardVO[]): any {
		if (!selfCards || selfCards.length == 0)
			return null;
		var cardCount: number = selfCards.length;
		var handle: Function = DdzUtil._typeHandlerMap.get(cardCount);
		if (handle == null)
			handle = DdzUtil.getCardMore;
		var obj: any = handle(selfCards);
		return obj;
	}

	//---------------------下面是牌组类型判断函数---------------------

	/**
	 * 一张牌,只有可能是单牌,不可能变牌
	 * @param  {DdzCardVO[]} targets
	 * @returns number
	 */
	private static getCard_1(targets: DdzCardVO[]): any {
		var arg: any = new Object();
		arg.type = DdzUtil.Lv1;
		arg.max = targets[0].num;
		return arg;
	}

	/**
	 * 两张牌,只有对牌和王炸
	 * @param  {DdzCardVO[]} targets
	 * @returns number
	 */
	private static getCard_2(targets: DdzCardVO[]): any {
		var arg: any = new Object();
		if (targets[0].num == targets[1].num) {//对子
			arg.type = DdzUtil.Lv2;
			arg.max = targets[0].num;
			return arg;
		}
		else if ((targets[0].num + targets[1].num) == 33) {//王炸
			arg.type = DdzUtil.Lv12;
			arg.max = targets[0].num;
			arg.subType = 3;
			return arg;
		}
		else {
			if (targets[0].num > 15 || targets[1].num > 15) {
				return null;//如果有小丑,则不可能是对子(赖子不能做小丑)
			}
			if (DdzUtil._laizi.indexOf(targets[0].num) >= 0 && DdzUtil._laizi.indexOf(targets[1].num) >= 0) {
				return null;//对子
			} else if (DdzUtil._laizi.indexOf(targets[0].num) >= 0) {//赖子与另外一个成对
				arg.type = DdzUtil.Lv2;
				arg.max = targets[1].num;
				arg.change = [targets[0].sortId, DdzUtil.getSortId(targets[0].type, targets[1].num)];
				return arg;
			} else if (DdzUtil._laizi.indexOf(targets[1].num) >= 0) {//赖子与另外一个成对
				arg.type = DdzUtil.Lv2;
				arg.max = targets[0].num;
				arg.change = [targets[1].sortId, DdzUtil.getSortId(targets[1].type, targets[0].num)];
				return arg;
			}
		}
		return null;
	}

	/**
	 * 三张牌,只会是三张
	 * @param  {DdzCardVO[]} targets
	 * @returns number
	 */
	private static getCard_3(targets: DdzCardVO[]): any {
		var matchs: number[] = DdzUtil.getMatchCount([3], targets);
		if (matchs != null) {
			var arg: any = new Object();
			arg.type = DdzUtil.Lv3;
			arg.max = matchs[0];
			DdzUtil.addChangeArgs(arg, matchs, targets);
			return arg;
		}
		return null;
	}

	/**
	 * 四张牌,三带一或者炸弹
	 * @param  {DdzCardVO[]} targets
	 * @returns number
	 */
	private static getCard_4(targets: DdzCardVO[]): any {
		var matchs: number[] = DdzUtil.getMatchCount([4], targets);
		var arg: any = new Object();
		if (matchs != null) {//炸
			arg.type = DdzUtil.Lv11;
			arg.max = matchs[1];
			arg.subType = matchs[0];
			DdzUtil.addChangeArgs(arg, matchs, targets);
			return arg;
		}
		matchs = DdzUtil.getMatchCount([3, 1], targets);
		if (matchs != null) {//3带1
			arg.type = DdzUtil.Lv4;
			arg.max = matchs[0];
			DdzUtil.addChangeArgs(arg, matchs, targets);
			return arg;
		}
		return null;
	}

	/**
	 * 五张牌,顺子,三带对
	 * @param  {DdzCardVO[]} targets
	 * @returns number
	 */
	private static getCard_5(targets: DdzCardVO[]): any {
		var matchs: number[] = DdzUtil.isFlush(targets);
		var arg: any = new Object();
		if (matchs != null) {
			arg.type = DdzUtil.Lv6;
			arg.max = matchs[0];
			arg.count = matchs[1];
			DdzUtil.addChangeArgs(arg, matchs, targets);
			return arg;
		}
		matchs = DdzUtil.getMatchCount([3, 2], targets);
		if (matchs != null) {
			arg.type = DdzUtil.Lv5;
			arg.max = matchs[0];
			DdzUtil.addChangeArgs(arg, matchs, targets);
			return arg;
		}
		return null;
	}

	/**
	 * 六张 四带二,连对,飞机,顺子
	 * @param  {DdzCardVO[]} targets
	 * @returns number
	 */
	private static getCard_6(targets: DdzCardVO[]): any {
		var matchs: number[] = DdzUtil.getMatchCount([4, 2], targets);
		var arg: any = new Object();
		if (matchs != null) {//四带二
			arg.type = DdzUtil.Lv10;
			arg.max = matchs[0];
			DdzUtil.addChangeArgs(arg, matchs, targets);
			return arg;
		}
		matchs = DdzUtil.getMatchCount([4, 1, 1], targets);
		if (matchs != null) {//四带二
			arg.type = DdzUtil.Lv10;
			arg.max = matchs[0];
			DdzUtil.addChangeArgs(arg, matchs, targets);
			return arg;
		}
		matchs = DdzUtil.isFlush(targets);
		if (matchs != null) {
			arg.type = DdzUtil.Lv6;
			arg.max = matchs[0];
			arg.count = matchs[1];
			DdzUtil.addChangeArgs(arg, matchs, targets);
			return arg;
		}
		matchs = DdzUtil.getMatchCount([2, 2, 2], targets);
		if (matchs != null) {
			arg.type = DdzUtil.Lv7;
			arg.max = matchs[0];
			arg.count = 3;
			DdzUtil.addChangeArgs(arg, matchs, targets);
			return arg;
		}
		matchs = DdzUtil.getMatchCount([3, 3], targets);
		if (matchs != null) {
			arg.type = DdzUtil.Lv8;
			arg.max = matchs[0];
			arg.count = 2;
			DdzUtil.addChangeArgs(arg, matchs, targets);
			return arg;
		}
		return null;
	}

	/**
	 * 七张即以上,顺子,连对(2的倍数),飞机(3的倍数),飞机带翅膀(4的倍数)
	 * @param  {DdzCardVO[]} targets
	 * @returns number
	 */
	private static getCardMore(targets: DdzCardVO[]): any {
		var matchs: number[] = DdzUtil.isFlush(targets);
		var arg: any = new Object();
		if (matchs != null) {//顺子
			arg.type = DdzUtil.Lv6;
			arg.max = matchs[0];
			arg.count = matchs[1];
			DdzUtil.addChangeArgs(arg, matchs, targets);
			return arg;
		}
		arg = DdzUtil.getArg_7(targets);//连对
		if (arg != null)
			return arg;
		arg = DdzUtil.getArg_8(targets);//飞机
		if (arg != null)
			return arg;
		arg = DdzUtil.getArg_9(targets);//飞机带翅膀
		return arg;
	}

	/**
	 * 是否为顺子,获取顺子的最大牌
	 * @param  {DdzCardVO[]} targets
	 * @returns number[] 0是顺子最大牌,1是顺子长度
	 */
	private static isFlush(targets: DdzCardVO[]): number[] {
		//从三开始算顺子,最多只可能14张
		if (targets.length > 14 || targets.length < 5)
			return null;
		var cgs: number[] = [0];
		DdzUtil.resetCounter();
		var i: number = 0;
		var lz: number = 0;//赖子数
		var lzs: number[] = [];
		//首先排除赖子,进行计数
		var ptCardCount: number = 0;//普通牌数
		for (i; i < targets.length; i++) {
			if (DdzUtil._laizi.indexOf(targets[i].num) < 0) {//排除赖子排出小丑
				ptCardCount++;
				var c: number = DdzUtil._counterArray[targets[i].num] + 1;
				if (c > 1)
					return null;
				DdzUtil._counterArray[targets[i].num] = c;
			} else {
				lz++;
				lzs.push(targets[i].num);
			}
		}
		if (DdzUtil._counterArray[16] > 0 || DdzUtil._counterArray[17] > 0)
			return null;
		if (DdzUtil._counterArray[15] > 0 && DdzUtil._laizi.indexOf(15) < 0)
			return;
		var maxNum: number = 0;
		var kqCount: number = 0;
		var startFlush: boolean = false;
		for (i = 3; i <= 14; i++) {
			if (startFlush) {
				if (DdzUtil._counterArray[i] == 0)
					kqCount++;
				else {
					ptCardCount--;
					maxNum = i;
					if (ptCardCount <= 0) {
						break;
					}
				}
			} else {
				if (DdzUtil._counterArray[i] != 0 && !startFlush) {
					startFlush = true;
					ptCardCount--;
				}
			}
		}
		if (lz >= kqCount) {
			maxNum = maxNum + (lz - kqCount);
			maxNum = maxNum > 14 ? 14 : maxNum;
			var fh: number[] = [maxNum, targets.length];
			//检查补位
			lzs.sort(function (a, b) {//从小到大排列
				return b - a;
			});
			for (var j: number = maxNum; j > maxNum - targets.length; j--) {
				if (DdzUtil._counterArray[j] <= 0) {//如果没有计数器
					cgs.push(lzs.shift());
					cgs.push(j);
				}
			}
			if (cgs.length > 1) {
				while (cgs.length > 0) {
					fh.push(cgs.shift());
				}
			}
			return fh;
		}
		return null;
	}

	/**
	 * 模糊匹配,只要从大可匹配即可
	 * 模糊匹配的重点就是顺子之外,没有在顺子中的都补到结尾,（在填充的时候，顺子中的赖子只可以补充到非空缺位，而不在顺子中的赖子只能补充到未定为的中）
 	 * 顺子的判断比较简单，这里不做描述
	 * @param  {number[]} match 需要匹配的组合数量
	 * @param  {DdzCardVO[]} targets
	 * @returns number[] 匹配结果牌,从大到小,如果匹配不上则返回null
	 */
	private static getMatchCountFuzzy(match: number[], targets: DdzCardVO[]): number[] {
		DdzUtil.resetCounter();
		//0.首先从match中获取匹配的最大数的连续数量(比如3,3,1,1;连续3,3长度为2)，记录牌号需求的最大数
		var i: number = 0;
		var maxNeedCount: number = match[0];//连续中最大需求数
		var lxCount: number = 0;//连续数量
		var lzCount: number = 0;//赖子总数
		var unSameCount: number = 0;//非赖子牌数量
		var cvo: DdzCardVO;
		for (i; i < match.length; i++) {
			if (match[i] == maxNeedCount)
				lxCount++;
		}
		//1.取计数器,包括所有的牌（另外存储赖子的数量）
		for (i = 0; i < targets.length; i++) {
			cvo = targets[i];
			DdzUtil._counterArray[cvo.num] = DdzUtil._counterArray[cvo.num] + 1;
			if (DdzUtil._laizi.indexOf(cvo.num) >= 0)
				lzCount++;
			else if (DdzUtil._counterArray[cvo.num] == 1)
				unSameCount++;
		}
		//2.从A开始向下取最大的顺子(如果是普通牌,必须有对应缺口个赖子数,如不足,则从新的起点取顺子。
		//任何时候缺口不足都从确认缺口不足的位置开始重新启算。如果该位置是赖子，则需要补充要求个数的相同值的赖子牌)
		//这里需要记录已经消耗到顺子中的赖子自备数
		var useLzCount: DdzCardCounter[] = [];
		var useLzCounts: number = 0;
		var findFlush: boolean = false;//是否找到顺子
		var flushStart: number = 14;
		if (lxCount == 1)
			flushStart = 15;
		var findLx: number = 0;
		var maxStart: number = 0;
		while (!findFlush) {
			maxStart = 0;
			if (useLzCount.length > 0)
				useLzCount = [];
			useLzCounts = 0;
			var hasLzCount: number = lzCount;
			findLx = 0;
			for (i = flushStart; i >= 3; i--) {
				var canContinue: boolean = true;
				if (DdzUtil._counterArray[i] > 0) {
					findLx++;
					if (findLx == 1) {
						maxStart = i;
					}
					var hasCount: number = DdzUtil._counterArray[i];
					if (DdzUtil._laizi.indexOf(i) >= 0) {//如果是赖子,需要赖子本身足够
						if (hasCount < maxNeedCount) {//不符合条件
							canContinue = false;
							flushStart = maxStart - 1;
							findLx = 0;
							hasLzCount = lzCount;
							break;
						} else {
							hasLzCount -= maxNeedCount;
							useLzCounts += maxNeedCount;
							useLzCount.push(new DdzCardCounter(i, maxNeedCount));
						}
					} else {//否则减赖子
						var needAddCount: number = maxNeedCount - hasCount;
						while (needAddCount > 0) {
							needAddCount--;
							hasLzCount--;
						}
						canContinue = hasLzCount >= 0;
						if (!canContinue) {
							flushStart = maxStart - 1;
							findLx = 0;
							hasLzCount = lzCount;
							break;
						}
					}
					if (findLx >= lxCount) {//如果连续数达到
						if (canContinue) {
							findFlush = true;
							break;
						} else {
							flushStart = maxStart - 1;
							findLx = 0;
							hasLzCount = lzCount;
							break;
						}
					}
				} else {
					maxStart = 0;
					findLx = 0;
					hasLzCount = lzCount;
				}
			}
			if (maxStart == 0 || (maxStart - 3 + 1) < lxCount) {//3.如果找不到顺子，则直接退出循环，匹配失败
				return null;
			}
		}
		//4.如果找到了顺子，记录顺子（包含的牌）的值，并将所有缺口从小到大排列
		//useLzCount,useLzCounts->已经花费在顺子里的赖子计数器,总共的赖子牌->lzCount
		var szList: DdzCardCounter[] = [];
		var szNums: number[] = [];
		for (i = maxStart; i >= 3; i--) {
			if (szList.length < lxCount) {
				if (DdzUtil._laizi.indexOf(i) >= 0) {//如果是赖子
					if (DdzUtil._counterArray[i] > maxNeedCount) {
						szList.push(new DdzCardCounter(i, maxNeedCount));
					} else {
						szList.push(new DdzCardCounter(i, DdzUtil._counterArray[i]));
					}
				} else {
					szList.push(new DdzCardCounter(i, DdzUtil._counterArray[i]));
				}
				szNums.push(i);
			}
		}
		szList.sort(function (a, b) {//从小到大排列
			return (maxNeedCount - a.count) - (maxNeedCount - b.count);
		});
		var otherList: DdzCardCounter[] = [];
		for (i = 3; i <= 17; i++) {
			if (DdzUtil._counterArray[i] > 0 && DdzUtil._laizi.indexOf(i) < 0 && szNums.indexOf(i) < 0) {//（再将不再顺子中的非赖子牌补充到末尾）
				otherList.push(new DdzCardCounter(i, DdzUtil._counterArray[i]));
			}
		}
		otherList.sort(function (a, b) {//从小到大排列
			return (maxNeedCount - a.count) - (maxNeedCount - b.count);
		});
		while (otherList.length > 0) {
			szList.push(otherList.shift());
		}
		//如果长度过长,则直接返回,匹配长度不足的补足
		if (szList.length > match.length * 2) {
			return null;
		}
		var dyCount: number = szList.length - match.length;
		var cut: number = match.length - dyCount;
		while (cut > 0) {
			cut--;
			dyCount--;
			match.push(2);
		}
		while (dyCount > 0) {
			dyCount--;
			match.push(1);
		}
		return DdzUtil.getMatchCount(match, targets);
	}

	/**
	 * 通过数量进行匹配[3,2]匹配三带一对(这里必须从大到小)
	 * @param  {number[]} match 需要匹配的组合数量
	 * @param  {DdzCardVO[]} targets
	 * @returns number[] 匹配,从大到小num排序,如果是炸弹,则需要在头加上subType
	 */
	private static getMatchCount(match: number[], targets: DdzCardVO[]): number[] {
		var cgs: number[] = [0];
		DdzUtil.resetCounter();
		//0.首先从match中获取匹配的最大数的连续数量(比如3,3,1,1;连续3,3长度为2)，记录牌号需求的最大数
		var i: number = 0;
		var maxNeedCount: number = match[0];//连续中最大需求数
		var lxCount: number = 0;//连续数量
		var lzCount: number = 0;//赖子总数
		var unSameCount: number = 0;//非赖子牌数量
		var cvo: DdzCardVO;
		for (i; i < match.length; i++) {
			if (match[i] == maxNeedCount)
				lxCount++;
		}
		//1.取计数器,包括所有的牌（另外存储赖子的数量）
		for (i = 0; i < targets.length; i++) {
			cvo = targets[i];
			DdzUtil._counterArray[cvo.num] = DdzUtil._counterArray[cvo.num] + 1;
			if (DdzUtil._laizi.indexOf(cvo.num) >= 0)
				lzCount++;
			else if (DdzUtil._counterArray[cvo.num] == 1)
				unSameCount++;
		}
		if (unSameCount > match.length)
			return null;
		//2.从A开始向下取最大的顺子(如果是普通牌,必须有对应缺口个赖子数,如不足,则从新的起点取顺子。
		//任何时候缺口不足都从确认缺口不足的位置开始重新启算。如果该位置是赖子，则需要补充要求个数的相同值的赖子牌)
		//这里需要记录已经消耗到顺子中的赖子自备数
		var useLzCount: DdzCardCounter[] = [];
		var useLzCounts: number = 0;
		var findFlush: boolean = false;//是否找到顺子
		var flushStart: number = 14;
		if (lxCount == 1)
			flushStart = 15;
		var findLx: number = 0;
		var maxStart: number = 0;
		while (!findFlush) {
			maxStart = 0;
			if (useLzCount.length > 0)
				useLzCount = [];
			useLzCounts = 0;
			var hasLzCount: number = lzCount;
			findLx = 0;
			for (i = flushStart; i >= 3; i--) {
				var canContinue: boolean = true;
				if (DdzUtil._counterArray[i] > 0) {
					findLx++;
					if (findLx == 1) {
						maxStart = i;
					}
					var hasCount: number = DdzUtil._counterArray[i];
					if (DdzUtil._laizi.indexOf(i) >= 0) {//如果是赖子,需要赖子本身足够
						if (hasCount < maxNeedCount) {//不符合条件
							canContinue = false;
							flushStart = maxStart - 1;
							findLx = 0;
							hasLzCount = lzCount;
							break;
						} else {
							hasLzCount -= maxNeedCount;
							useLzCounts += maxNeedCount;
							useLzCount.push(new DdzCardCounter(i, maxNeedCount));
						}
					} else {//否则减赖子
						var needAddCount: number = maxNeedCount - hasCount;
						while (needAddCount > 0) {
							needAddCount--;
							hasLzCount--;
						}
						canContinue = hasLzCount >= 0;
						if (!canContinue) {
							flushStart = maxStart - 1;
							findLx = 0;
							hasLzCount = lzCount;
							break;
						}
					}
					if (findLx >= lxCount) {//如果连续数达到
						if (canContinue) {
							findFlush = true;
							break;
						} else {
							flushStart = maxStart - 1;
							findLx = 0;
							hasLzCount = lzCount;
							break;
						}
					}
				} else {
					maxStart = 0;
					findLx = 0;
					hasLzCount = lzCount;
				}
			}
			if (maxStart == 0 || (maxStart - 3 + 1) < lxCount) {//3.如果找不到顺子，则直接退出循环，匹配失败
				return null;
			}
		}
		//4.如果找到了顺子，记录顺子（包含的牌）的值，并将所有缺口从小到大排列
		//useLzCount,useLzCounts->已经花费在顺子里的赖子计数器,总共的赖子牌->lzCount
		var szList: DdzCardCounter[] = [];
		var szNums: number[] = [];
		for (i = maxStart; i >= 3; i--) {
			if (szList.length < lxCount) {
				if (DdzUtil._laizi.indexOf(i) >= 0) {//如果是赖子
					if (DdzUtil._counterArray[i] > maxNeedCount) {
						szList.push(new DdzCardCounter(i, maxNeedCount));
					} else {
						szList.push(new DdzCardCounter(i, DdzUtil._counterArray[i]));
					}
				} else {
					szList.push(new DdzCardCounter(i, DdzUtil._counterArray[i]));
				}
				szNums.push(i);
			}
		}
		szList.sort(function (a, b) {//从小到大排列
			return (maxNeedCount - a.count) - (maxNeedCount - b.count);
		});
		var otherList: DdzCardCounter[] = [];
		for (i = 3; i <= 17; i++) {
			if (DdzUtil._counterArray[i] > 0 && DdzUtil._laizi.indexOf(i) < 0 && szNums.indexOf(i) < 0) {//（再将不再顺子中的非赖子牌补充到末尾）
				otherList.push(new DdzCardCounter(i, DdzUtil._counterArray[i]));
			}
		}
		otherList.sort(function (a, b) {//从小到大排列
			return (maxNeedCount - a.count) - (maxNeedCount - b.count);
		});
		while (otherList.length > 0) {
			szList.push(otherList.shift());
		}
		//如果长度过长,则直接返回,匹配长度不足的补足
		if (szList.length > match.length) {
			return null;
		}
		var cid: number = -1;
		while (szList.length < match.length) {
			szList.push(new DdzCardCounter(cid, 0));
			cid--;
		}
		var lzMap: Map<number, DdzCardCounter> = new Map();
		for (i = 0; i < useLzCount.length; i++) {
			lzMap.set(useLzCount[i].type, useLzCount[i]);
		}
		//5.对赖子计数进行从小到大排列（排除包含在顺子中的赖子）
		var lzArray: DdzCardCounter[] = [];
		for (i = 3; i <= 17; i++) {
			if (DdzUtil._laizi.indexOf(i) >= 0 && DdzUtil._counterArray[i] > 0) {
				var hasLz: number = DdzUtil._counterArray[i];
				if (lzMap.get(i) != null) {
					hasLz -= lzMap.get(i).count;
				}
				if (hasLz < 0) {
					return null;
				}
				if (hasLz > 0) {
					lzArray.push(new DdzCardCounter(i, hasLz));
				}
			}
		}
		lzArray.sort(function (a, b) {//从小到大排列
			return a.count - b.count;
		});
		//6.从赖子最小缺口计数从左到右补充到上面的序列中
		var bcCounter: DdzCardCounter;
		// lzArray用来补位的,不过要将在连子中用过的赖子放前面,他们只能补充到有号码的位置。szNums就是顺子中的
		var bwArray: DdzCardCounter[] = [];
		for (i = lzArray.length - 1; i >= 0; i--) {
			if (szNums.indexOf(lzArray[i].type) >= 0) {//如果在顺子中
				bwArray.push(lzArray[i]);
				lzArray.splice(i, 1);
			}
		}
		bwArray.reverse();
		while (lzArray.length > 0) {
			bwArray.push(lzArray.shift());
		}
		for (i = 0; i < match.length; i++) {
			var arg: DdzCardCounter = szList[i];
			while (arg.count < match[i]) {
				if (bcCounter == null) {
					if (bwArray.length <= 0)
						return null;
					bcCounter = bwArray.shift();
				}
				if (DdzUtil._laizi.indexOf(arg.type) >= 0)//赖子不能补
					return null;
				if (arg.type < 0) {//空位,必定是赖子,不会变
					if (bcCounter.reUse == 0) {
						if (arg.count == 0) {
							bcCounter.reUse = arg.type;
						} else {
							return null;
						}
					}
					if (bcCounter.reUse == arg.type) {
						bcCounter.count--;
						arg.count++;
						if (bcCounter.count == 0)
							bcCounter = null;
					} else {
						return null;
					}
				} else {
					bcCounter.count--;
					arg.count++;
					cgs.push(bcCounter.type);
					cgs.push(arg.type);
					if (bcCounter.count == 0)
						bcCounter = null;
				}
			}
		}
		//7.查看补充后的匹配值是否等于要匹配的值
		for (i = 0; i < match.length; i++) {
			if (szList[i].count != match[i])
				return null;
		}
		//8.中途有任何不符合条件的直接返回匹配不成功
		if (match.length == 1 && match[0] == 4) {
			//癞子炸弹>王炸>炸弹>软炸弹    4,3,2,1
			if (lzCount == 4)
				szNums.unshift(4);//赖子炸弹
			else if (lzCount > 0)
				szNums.unshift(1);//软炸弹
			else
				szNums.unshift(2);//硬炸弹
		}
		if (cgs.length > 1) {
			while (cgs.length > 0) {
				szNums.push(cgs.shift());
			}
		}
		return szNums;
	}


	//重置计数器
	private static resetCounter(): void {
		for (var i: number = 0; i < 18; i++) {
			DdzUtil._counterArray[i] = 0;
		}
	}

	/**
	 * 将当前手牌进行排序
	 * 从大到小排列
	 * @returns void
	 */
	public sortHandCard(): void {
		this._handCards.sort(function (a, b) {
			return b.sortId - a.sortId;
		});
	}

	//--------------------获取对比参数,验证是否是某个类型------------------

	/**
	 * 获取单牌结果参数
	 * @param  {DdzCardVO[]} targets
	 */
	public static getArg_1(targets: DdzCardVO[]): any {
		if (targets.length == 1) {
			return DdzUtil.getCard_1(targets);
		}
		return null;
	}

	/**
	 * 获取对子的结果参数
	 * @param  {DdzCardVO[]} targets
	 * @returns any
	 */
	public static getArg_2(targets: DdzCardVO[]): any {
		if (targets.length == 2) {
			return DdzUtil.getCard_2(targets);
		}
		return null;
	}
	/**
	 * 获取三个的结果参数
	 * @param  {DdzCardVO[]} targets
	 * @returns any
	 */
	public static getArg_3(targets: DdzCardVO[]): any {
		if (targets.length == 3) {
			return DdzUtil.getCard_3(targets);
		}
		return null;
	}

	/**
	 * 获取3带1的结果参数
	 * @param  {DdzCardVO[]} targets
	 */
	public static getArg_4(targets: DdzCardVO[]): any {
		if (targets.length != 4)
			return null;
		var matchs: number[] = DdzUtil.getMatchCount([3, 1], targets);
		if (matchs != null) {//3带1
			var arg: any = new Object();
			arg.type = DdzUtil.Lv4;
			arg.max = matchs[0];
			DdzUtil.addChangeArgs(arg, matchs, targets);
			return arg;
		}
		return null;
	}

	/**
	 * 三带对 比较参数
	 * @param  {DdzCardVO[]} targets
	 */
	public static getArg_5(targets: DdzCardVO[]): any {
		if (targets.length != 5)
			return null;
		var matchs: number[] = DdzUtil.getMatchCount([3, 2], targets);
		if (matchs != null) {
			var arg: any = new Object();
			arg.type = DdzUtil.Lv5;
			arg.max = matchs[0];
			DdzUtil.addChangeArgs(arg, matchs, targets);
			return arg;
		}
		return null;
	}

	/**
	 * 顺子 比较参数
	 * @param  {DdzCardVO[]} targets
	 */
	public static getArg_6(targets: DdzCardVO[]): any {
		var matchs: number[] = DdzUtil.isFlush(targets);
		if (matchs != null) {
			var arg: any = new Object();
			arg.type = DdzUtil.Lv6;
			arg.max = matchs[0];
			arg.count = matchs[1];
			DdzUtil.addChangeArgs(arg, matchs, targets);
			return arg;
		}
		return null;
	}

	/**
	 * 连对 比较结果
	 * @param  {DdzCardVO[]} targets
	 * @returns any
	 */
	public static getArg_7(targets: DdzCardVO[]): any {
		if (targets.length < 6 || targets.length % 2 != 0) {
			return null;
		}
		var count: number = targets.length / 2;
		var args: number[] = [];
		while (count > 0) {
			count--;
			args.push(2);
		}
		var matchs: number[] = DdzUtil.getMatchCount(args, targets);
		if (matchs != null) {
			var arg: any = new Object();
			arg.type = DdzUtil.Lv7;
			arg.max = matchs[0];
			arg.count = matchs.length;
			DdzUtil.addChangeArgs(arg, matchs, targets);
			return arg;
		}
		return null;
	}

	/**
	 * 飞机 比较参数
	 * @param  {DdzCardVO[]} targets
	 * @returns any
	 */
	public static getArg_8(targets: DdzCardVO[]): any {
		if (targets.length < 6 || targets.length % 3 != 0) {
			return null;
		}
		var count: number = targets.length / 3;
		var args: number[] = [];
		while (count > 0) {
			count--;
			args.push(3);
		}
		var matchs: number[] = DdzUtil.getMatchCount(args, targets);
		if (matchs != null) {
			var arg: any = new Object();
			arg.type = DdzUtil.Lv8;
			arg.max = matchs[0];
			arg.count = matchs.length;
			DdzUtil.addChangeArgs(arg, matchs, targets);
			return arg;
		}
		return null;
	}

	/**
	 * 飞机带翅膀,使用模糊匹配
	 * @param  {DdzCardVO[]} targets
	 * @returns any
	 */
	public static getArg_9(targets: DdzCardVO[]): any {
		if (targets.length < 8) {
			return null;
		}
		var matchs: number[] = null;
		if (targets.length % 5 == 0) {
			var count: number = targets.length / 5;
			var args: number[] = [];
			for (var i: number = 0; i < count; i++) {
				args.push(3);
			}
			for (i = 0; i < count; i++) {
				args.push(2);
			}
			matchs = DdzUtil.getMatchCount(args, targets);
			if (matchs != null) {
				var arg: any = new Object();
				arg.type = DdzUtil.Lv9;
				arg.max = matchs[0];
				arg.count = matchs.length;
				DdzUtil.addChangeArgs(arg, matchs, targets);
				return arg;
			}
		}
		if (targets.length % 4 == 0 && matchs == null) {
			var count: number = targets.length / 4;
			var args: number[] = [];
			while (count > 0) {
				count--;
				args.push(3);
			}
			matchs = DdzUtil.getMatchCountFuzzy(args, targets);
			if (matchs != null) {
				var arg: any = new Object();
				arg.type = DdzUtil.Lv9;
				arg.max = matchs[0];
				arg.count = matchs.length;
				DdzUtil.addChangeArgs(arg, matchs, targets);
				return arg;
			}
		}
		return null;
	}

	/**
	 * 四带二 比较参数
	 * @param  {DdzCardVO[]} targets
	 * @returns any
	 */
	public static getArg_10(targets: DdzCardVO[]): any {
		var matchs: number[] = DdzUtil.getMatchCount([4, 2], targets);
		var arg: any = new Object();
		if (matchs != null) {//四带二
			arg.type = DdzUtil.Lv10;
			arg.max = matchs[0];
			DdzUtil.addChangeArgs(arg, matchs, targets);
			return arg;
		}
		matchs = DdzUtil.getMatchCount([4, 1, 1], targets);
		if (matchs != null) {//四带二
			arg.type = DdzUtil.Lv10;
			arg.max = matchs[0];
			DdzUtil.addChangeArgs(arg, matchs, targets);
			return arg;
		}
		return null;
	}

	/**
	 * 获取炸蛋的对比参数
	 * @param  {DdzCardVO[]} targets
	 */
	public static getArg_11(targets: DdzCardVO[]): any {
		var matchs: number[] = DdzUtil.getMatchCount([4], targets);
		var arg: any = new Object();
		if (matchs != null) {//炸
			arg.type = DdzUtil.Lv11;
			arg.max = matchs[1];
			arg.subType = matchs[0];
			DdzUtil.addChangeArgs(arg, matchs, targets);
			return arg;
		}
		return null;
	}

	/**
	 * 获取王炸对比参数
	 * @param  {DdzCardVO[]} targets
	 */
	public static getArg_12(targets: DdzCardVO[]): any {
		if (targets.length != 2)
			return null;
		if ((targets[0].num + targets[1].num) == 33) {//王炸
			var arg: any = new Object();
			arg.type = DdzUtil.Lv12;
			arg.max = targets[0].num;
			arg.subType = 3;
			return arg;
		}
		return null;
	}

	//--------------------下面是获取手牌中的提示牌组部分,后端无视---------------------

	public updateTipCards(type: number, targetCards: DdzCardVO[]): void {
		//----------计算炸弹----------
		DdzUtil.resetCounter();
		for (i; i < this._handCards.length; i++) {
			var c: number = DdzUtil._counterArray[this._handCards[i].num] + 1;
			DdzUtil._counterArray[this._handCards[i].num] = c;
		}
		// this._tipCards
		// this._handCards
		var hisCompareArgs: any = this.getCompareArgs(type, targetCards);
		if (!hisCompareArgs || hisCompareArgs.type != type) {
			LogTrace.log(JSON.stringify(targetCards) + ":比较参数有异常");
			if (hisCompareArgs != null) {
				LogTrace.log("发来的参数是:" + type + "客户端计算的类型是" + hisCompareArgs.type);
			}
			return;
		}
		if (type < DdzUtil.Lv11) {//非炸弹,需要绝对匹配
			var findLenPt: number = targetCards.length;//需要提取多少个组合
			var ptArgs: any[] = this.getHandArgs(findLenPt);
			//如果對方是單牌,需要特殊處理,當且只當自己的組合中沒有大過對方單牌的單牌時，才允許拆開對子或其他
			var rest: any[] = [];
			var wyK: number[] = [];
			var sames: number[] = [];
			if (targetCards.length == 1) {
				for (var i: number = 0; i < ptArgs.length; i++) {
					if (ptArgs[i].length == 1) {
						if (wyK.indexOf(ptArgs[i][0].num) < 0)
							wyK.push(ptArgs[i][0].num);
						else
							sames.push(ptArgs[i][0].num);
					}
				}
				for (i = 0; i < ptArgs.length; i++) {
					if (ptArgs[i].length == 1 && wyK.indexOf(ptArgs[i][0].num) >= 0 && sames.indexOf(ptArgs[i][0].num) < 0
						&& hisCompareArgs.max < ptArgs[i][0].num)
						rest.push(ptArgs[i]);
				}
				if (rest.length > 0)
					ptArgs = rest;
			}
			this.trySetInTipList(hisCompareArgs, ptArgs);
			ptArgs = this.getHandArgs(4);
			this.trySetInTipList(hisCompareArgs, ptArgs);
			ptArgs = this.getHandArgs(2);
			this.trySetInTipList(hisCompareArgs, ptArgs);
		} else {
			if (type == DdzUtil.Lv11) {//如果是炸弹
				var findLenBomb: number = 4;//找到更大的炸弹
				var bombArgs: any[] = this.getHandArgs(4);
				if (hisCompareArgs.subType < 3) {//非赖子炸弹,非王炸
					var bombs: DdzCardVO[] = [];
					for (var k: number = 0; k < this._handCards.length; k++) {
						if (this._handCards[k].num >= 16)
							bombs.push(this._handCards[k]);
					}
				}
				if (bombs && bombs.length == 2)
					bombArgs.push(bombs);
				this.trySetInTipList(hisCompareArgs, bombArgs);
			} else {//如果是王炸,必须是赖子炸弹
				//找到赖子炸弹即可
				var bombArgs: any[] = this.getHandArgs(4);
				this.trySetInTipList(hisCompareArgs, bombArgs);
			}
		}
	}

	/**将符合条件的设置到提示牌组中 */
	private trySetInTipList(hisCompareArgs: any, cards: any[]): void {
		for (var i: number = 0; i < cards.length; i++) {
			var selfArgs: any = DdzUtil.getCardsArgs(cards[i]);
			if (this.compareBigger(hisCompareArgs, selfArgs) > 0) {
				var canUse: boolean = true;
				if (selfArgs.type < 10) {
					//如果包含炸弹牌,则跳过
					for (var j: number = 0; j < cards[i].length; j++) {
						if (DdzUtil._counterArray[cards[i][j].num] >= 4) {
							canUse = false;
							break;
						}
					}
					if (!canUse)
						continue;
				}
				//检查是否已有了
				var str: string = "";
				for (var j: number = 0; j < cards[i].length; j++) {
					str += cards[i][j].num + "";
				}
				if (this._tipUsed.indexOf(str) < 0) {
					this._tipUsed.push(str);
				} else {
					continue;
				}
				var arg: any = new Object();
				arg.type = selfArgs.type;
				arg.index = this._tipCards.length;
				arg.count = this.getFs(selfArgs, cards[i]);
				this._tipSortArgs.push(arg);
				this._tipCards.push(cards[i]);
			}
		}
	}

	private getFs(arg: any, cards: DdzCardVO[]): number {
		var n: number = 0;
		if (arg.type == DdzUtil.Lv1) {//单牌(A) =（5-An)*16+（15-A）+(-Ln*5)
			n = (5 - DdzUtil._counterArray[arg.max]) * 16 + (15 - arg.max);
			n -= this.lzCount(cards) * 5;
		} else if (arg.type == DdzUtil.Lv2) {//对牌(AA) =（5-An)*16+（15-A）+(-Ln*5)
			n = (5 - DdzUtil._counterArray[arg.max]) * 16 + (15 - arg.max);
			n -= this.lzCount(cards) * 5;
		} else if (arg.type == DdzUtil.Lv3) {//三张(AAA) =（5-An)*16+（15-A）+(-Ln*5)
			n = (5 - DdzUtil._counterArray[arg.max]) * 16 + (15 - arg.max);
			n -= this.lzCount(cards) * 5;
		} else if (arg.type == DdzUtil.Lv4) {//三带一(AAAB)=（5-An)*16+（15-A）+（5-Bn）*16+（15-B）+(-Ln*5)
			n = (5 - DdzUtil._counterArray[arg.max]) * 16 + (15 - arg.max) + (5 - DdzUtil._counterArray[this.getBCD(cards, arg.max, 1)]) * 16 + (15 - this.getBCD(cards, arg.max, 1));
			n -= this.lzCount(cards) * 5;
		} else if (arg.type == DdzUtil.Lv5) {//三带二(AAAB)=（5-An)*16+（15-A）+（5-Bn）*16+（15-B）+(-Ln*5)
			n = (5 - DdzUtil._counterArray[arg.max]) * 16 + (15 - arg.max) + (5 - DdzUtil._counterArray[this.getBCD(cards, arg.max, 1)]) * 16 + (15 - this.getBCD(cards, arg.max, 1));
			n -= this.lzCount(cards) * 5;
		} else if (arg.type == DdzUtil.Lv6) {//顺子(ABCDE) =-(A~N)n*16+(-Ln*5)
			n = -(DdzUtil._counterArray[arg.max] + DdzUtil._counterArray[this.getBCD(cards, arg.max, 1)] + DdzUtil._counterArray[this.getBCD(cards, arg.max, 2)] + DdzUtil._counterArray[this.getBCD(cards, arg.max, 3)]) * 16;
			n -= this.lzCount(cards) * 5;
		} else if (arg.type == DdzUtil.Lv7) {//连对(AABBCC) =-(A~N)n*16+(-Ln*5)
			n = -(DdzUtil._counterArray[arg.max] + DdzUtil._counterArray[this.getBCD(cards, arg.max, 1)] + DdzUtil._counterArray[this.getBCD(cards, arg.max, 2)]) * 16;
			n -= this.lzCount(cards) * 5;
		} else if (arg.type == DdzUtil.Lv8) {//飞机(AAABBB) =-(A~N)n*16+(-Ln*5)
			n = -(DdzUtil._counterArray[arg.max] + DdzUtil._counterArray[this.getBCD(cards, arg.max, 1)]) * 16;
			n -= this.lzCount(cards) * 5;
		} else if (arg.type == DdzUtil.Lv9) {//飞机带翅膀(AAABBBCC)= -(A~B)n*16+（5-Cn）*16+（15-C）+(-Ln*5)
			n = -(DdzUtil._counterArray[arg.max] + DdzUtil._counterArray[this.getBCD(cards, arg.max, 1)]) * 16 + (5 - DdzUtil._counterArray[this.getBCD(cards, arg.max, 2)]) * 16 + 15 - this.getBCD(cards, arg.max, 2) + (5 - DdzUtil._counterArray[this.getBCD(cards, arg.max, 3)]) * 16 + 15 - this.getBCD(cards, arg.max, 3);
			n -= this.lzCount(cards) * 5;
		} else if (arg.type == DdzUtil.Lv10) {//四带二(AAAABB) =（5-An)*16+（15-A）+（5-Bn）*16+（15-B）+(-Ln*5)
			n = (5 - DdzUtil._counterArray[arg.max]) * 16 + (15 - arg.max) + (5 - DdzUtil._counterArray[this.getBCD(cards, arg.max, 1)]) * 16 + 15 - this.getBCD(cards, arg.max, 1);
			n -= this.lzCount(cards) * 5;
		} else if (arg.type == DdzUtil.Lv11) {//炸弹(AAAA)= （5-An)*16+（15-A）+(-Ln*5)
			n = (5 - DdzUtil._counterArray[arg.max]) * 16 + (15 - arg.max);
			n -= this.lzCount(cards) * 5;
		}
		return n;
	}

	//赖子的总数
	private lzCount(vos: DdzCardVO[]): number {
		var c: number = 0;
		for (var i: number = 0; i < vos.length; i++) {
			if (DdzUtil._laizi.indexOf(vos[i].num) >= 0)
				c++;
		}
		return c;
	}

	//获取BCDEF
	private getBCD(vos: DdzCardVO[], not: number, index: number = 0): number {
		var find: number = 1;
		var has: number[] = [];
		has.push(not);
		for (var i: number = 0; i < vos.length; i++) {
			if (has.indexOf(vos[i].num) < 0)//如果没有
			{
				if (find == index)
					return vos[i].num;
				has.push(vos[i].num);
				find++;
			}
		}
		return 0;
	}

	private _handFindLen: number;
	private _tipNums: number[] = [];

	/**
	 * 随机组合
	 * @param  {number} len
	 * @returns any
	 */
	private getHandArgs(len: number): any[] {
		this._handFindLen = len;
		var results: any[] = [];
		if (len == 1) {
			for (var kk: number = 0; kk < this._handCards.length; kk++) {
				results.push([this._handCards[kk]]);
			}
			return results;
		}
		this._tipNums = [];
		if (this._handCards.length < len)
			return [];
		var i: number = 0;
		for (i; i < len; i++) {
			this._tipNums.push(this._handCards.length - 1 - i);
		}
		this._tipNums.reverse();
		var isEnd: boolean = false
		var index: number = 0;
		while (!isEnd) {
			var cards: DdzCardVO[] = [];
			for (var j: number = 0; j < this._tipNums.length; j++) {
				cards.push(this._handCards[this._tipNums[j]]);
			}
			results.push(cards);
			//移位并判断是否已结束
			isEnd = this.checkEnd()
			index++
		}
		return results;
	}

	private checkEnd(): boolean {
		var f: boolean = true
		var i: number = 0;
		while (i < this._handFindLen) {
			f = this.move(i)
			if (!f) {
				break
			}
			i++
		}
		return f
	}

	private move(index: number): boolean {
		if (this._handFindLen == index) {
			return true
		}
		var toIndex: number = this._tipNums[index] - 1
		if (index == 0) {
			if (toIndex >= 0) { //0位还未结束
				this._tipNums[index] = toIndex
				return false
			} else { //0位结束进一位
				var flag1: boolean = this.move(index + 1)
				this._tipNums[index] = this._tipNums[index + 1] - 1
				return flag1
			}
		} else {
			if (toIndex >= index) { //该位还没有结束
				this._tipNums[index] = toIndex
				return false
			} else {
				var flag1: boolean = this.move(index + 1)
				if (flag1) {
					return true
				}
				this._tipNums[index] = this._tipNums[index + 1] - 1
				return flag1
			}
		}
	}

	/**
	 * 打印牌的类型
	 * @param  {any[]} cards
	 * @returns void
	 */
	public test(cards: number[]): void {
		var selfCards: DdzCardVO[] = [];
		var carStr: string = "";
		while (cards.length > 0) {
			var num: number = cards.pop();
			carStr = carStr + "_" + num;
			var keyId: string = num + "_" + 1;
			selfCards.push(DdzUtil._poolMap.get(keyId));
		}
		LogTrace.log(carStr + "对应类型" + DdzUtil.getCardsType(selfCards));
	}

	public testHandler(type: number, cards: number[]): void {
		var selfCards: DdzCardVO[] = [];
		var carStr: string = "";
		while (cards.length > 0) {
			var num: number = cards.pop();
			carStr = carStr + "_" + num;
			var keyId: string = num + "_" + 1;
			selfCards.push(DdzUtil._poolMap.get(keyId));
		}
		var obj: any = this.getCompareArgs(type, selfCards);
		LogTrace.log(carStr + "对应类型" + obj);
	}

	public testHandler2(cards: number[]): void {
		var selfCards: DdzCardVO[] = [];
		var carStr: string = "";
		while (cards.length > 0) {
			var num: number = cards.pop();
			carStr = carStr + "_" + num;
			var keyId: string = num + "_" + 1;
			selfCards.push(DdzUtil._poolMap.get(keyId));
		}
		var obj: number = DdzUtil.getCardsType(selfCards)
		LogTrace.log(carStr + "对应类型" + obj);
	}

	private static getSortId(type: number, num: number): number {
		return num * 4 + (4 - type);
	}

	/**
	 * 转换变化对应
	 * @param  {any} obj
	 * @param  {number[]} matchs
	 * @param  {DdzCardVO[]} targets
	 * @returns void
	 */
	private static addChangeArgs(obj: any, matchs: number[], targets: DdzCardVO[]): void {
		var changes: any[] = [];
		var usedIds: number[] = [];
		var index: number = matchs.indexOf(0);
		if (index < 0)
			return;
		index++;
		for (index; index < matchs.length; index++) {
			var lzNum: number = matchs[index];
			var toNum: number = matchs[index + 1]
			index++;
			for (var j: number = 0; j < targets.length; j++) {
				if (targets[j].num == lzNum && usedIds.indexOf(targets[j].sortId) < 0) {
					usedIds.push(targets[j].sortId);
					changes.push(targets[j].sortId);
					changes.push(DdzUtil.getSortId(targets[j].type, toNum));
					break;
				}
			}
		}
		if (changes.length > 0)
			obj.change = changes;
	}
}

//纯粹用于计数
class DdzCardCounter {
	public type: number;
	public count: number;
	public reUse: number = 0;//变化定位
	public constructor(type: number, count: number) {
		this.type = type;
		this.count = count;
	}
}