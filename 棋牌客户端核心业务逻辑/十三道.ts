/**
 * 十三道逻辑
 * @author nodep
 * @version 1.0
 */
class SsdUtil {
	public static Lv0: number = 0;//不能构成牌组
	public static Lv1: number = 1;//单牌
	public static Lv2: number = 2;//对牌
	public static Lv3: number = 3;//两对
	public static Lv4: number = 4;//三条
	public static Lv5: number = 5;//顺子
	public static Lv6: number = 6;//同花
	public static Lv7: number = 7;//葫芦
	public static Lv8: number = 8;//炸弹
	public static Lv9: number = 9;//同花顺
	//------------下面
	public static Lv10: number = 10;//三顺
	public static Lv11: number = 11;//三花
	public static Lv12: number = 12;//半小
	public static Lv13: number = 13;//半大
	public static Lv14: number = 14;//六对半
	public static Lv15: number = 15;//全小
	public static Lv16: number = 16;//全大
	public static Lv17: number = 17;//五对一刻
	public static Lv18: number = 18;//一条龙
	public static Lv19: number = 19;//全红一点黑
	public static Lv20: number = 20;//全黑一点红
	public static Lv21: number = 21;//全红
	public static Lv22: number = 22;//全黑
	public static Lv23: number = 23;//青龙

	public static typeNames: string[] = ["無", "單牌", "對牌", "兩對", "三條", "順子", "同花", "葫蘆", "炸彈", "同花順", "三順", "三花", "半小", "半大", "六對半",
		"全小", "全大", "五對一刻", "一條龍", "全紅一點黑", "全黑一點紅", "全紅", "全黑", "青龍"];

	//牌型一共23种,没有小丑,2开始,顺子也是2开始,没有赖子
	private static _pool: DdzCardVO[];
	//计数用的数组
	private static _counterArray: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
	//vo的key对应vo
	private static _poolMap: Map<string, DdzCardVO> = new Map();
	//vo的唯一sortId对应vo,算法详见vo构造函数
	public static _poolMapByID: Map<number, DdzCardVO> = new Map();
	//手牌
	private _handCards: DdzCardVO[] = [];

	public constructor() {
		if (SsdUtil._pool == null) {
			SsdUtil._pool = [];
			var vo: DdzCardVO;
			//创建2~A
			for (var i: number = 2; i <= 15; i++) {
				for (var j: number = 1; j <= 4; j++) {
					vo = new DdzCardVO(i, j);
					SsdUtil._pool.push(vo);
					SsdUtil._poolMap.set(vo.key, vo);
					SsdUtil._poolMapByID.set(vo.sortId, vo);
				}
			}
		}
	}

	/**
	 * 比较大小,如果大返回正数,否则返回负数
	 * @param  {any} args
	 * @param  {DdzCardVO[]} selfCards
	 * @returns number
	 */
	public compareBigger(focus: any, target: any): number {
		if (focus == null)
			return -1;
		else if (target == null)
			return 1;
		//牌型>=則返回1
		if (focus.type > target.type)
			return 1;
		else if (focus.type == target.type) {
			var len: number = Math.min(focus.cards.length, target.cards.length);
			//比较大小
			for (var i: number = 0; i < len; i++) {
				if ((focus.cards[i] as DdzCardVO).num > (target.cards[i] as DdzCardVO).num)
					return 1;
				else if ((focus.cards[i] as DdzCardVO).num < (target.cards[i] as DdzCardVO).num)
					return -1;
			}
			//比较花色
			for (i = 0; i < len; i++) {
				if ((focus.cards[i] as DdzCardVO).type < (target.cards[i] as DdzCardVO).type)
					return 1;
				else if ((focus.cards[i] as DdzCardVO).type > (target.cards[i] as DdzCardVO).type)
					return -1;
			}
		}
		return -1;
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
	 * 获取牌组所属类型
	 * @param  {DdzCardVO[]} selfCards 获取一个牌组的类型,如果为0,则不成牌组
	 * @returns number
	 */
	public static getCardsArgs(selfCards: DdzCardVO[], dao3: DdzCardVO[], dao2: DdzCardVO[]): any {
		if (!selfCards || selfCards.length == 0) {
			var t: any = new Object();
			t.type = 0;
			return t;
		}
		var cardCount: number = selfCards.length;
		var obj: any = null;
		switch (cardCount) {
			case 3: obj = this.getCard_3(selfCards, dao3, dao2);
				break;
			case 5: obj = this.getCard_5(selfCards);
				break;
			case 13: obj = this.getCard_13(selfCards);
				break;
		}
		return obj;
	}

	//---------------------下面是十三道的主要判断函数-----------------
	/**
	 * 三张牌,散牌,一对,三条,顺子,同花,同花顺。后面三个，必须能够组成三花或三顺才可以。否则就是单牌
	 * @param  {DdzCardVO[]} targets
	 * @returns any [type,cards[]这里是按照各种牌的需要设置进去的]
	 */
	private static getCard_3(targets: DdzCardVO[], dao3: DdzCardVO[], dao2: DdzCardVO[]): any {
		if (!targets || targets.length != 3)
			return null;
		var args: any = this.isFlush(targets);//是否为顺子
		if (args) {//如果是顺子,可能是同花顺
			if (this.isSameColor(targets)) {
				args.type = SsdUtil.Lv9;
			}
			//判断是否是三顺
			if (this.isSs(dao3, dao2)) {
				args.type = SsdUtil.Lv5;
			} else if (this.isSh(dao3, dao2) && args.type == SsdUtil.Lv9) {
				args.type = SsdUtil.Lv6;
			} else {
				args.type = SsdUtil.Lv1;
			}
		} else {
			args = this.isSameColor(targets);//同花
			if (args) {
				if (this.isSh(dao3, dao2)) {
					args.type = SsdUtil.Lv6;
				} else {
					args.type = SsdUtil.Lv1;
				}
			}
			if (!args) {//三条
				args = this.getMatchCountFuzzy([3], targets);
				if (args != null)
					args.type = SsdUtil.Lv4;
			}
			if (!args) {//一对
				args = this.getMatchCountFuzzy([2], targets);
				if (args != null)
					args.type = SsdUtil.Lv2;
			}
			if (!args) {//高牌
				args = this.getGaoPai(targets);
			}
		}
		return args;
	}

	private static isSh(dao3: DdzCardVO[], dao2: DdzCardVO[]): boolean {
		if (!dao3 || !dao2 || (dao3.length != 5 && dao2.length != 5))
			return false;
		var type1: number = this.getCardsArgs(dao3, null, null).type;
		var type2: number = this.getCardsArgs(dao2, null, null).type;
		if ((type1 == SsdUtil.Lv6 || type1 == SsdUtil.Lv9) && (type2 == SsdUtil.Lv6 || type2 == SsdUtil.Lv9))
			return true;
		return false;
	}

	private static isSs(dao3: DdzCardVO[], dao2: DdzCardVO[]): boolean {
		if (!dao3 || !dao2 || (dao3.length != 5 && dao2.length != 5))
			return false;
		var type1: number = this.getCardsArgs(dao3, null, null).type;
		var type2: number = this.getCardsArgs(dao2, null, null).type;
		if ((type1 == SsdUtil.Lv5 || type1 == SsdUtil.Lv9) && (type2 == SsdUtil.Lv5 || type2 == SsdUtil.Lv9))
			return true;
		return false;
	}

	/**
	 * 五张牌,散牌,一对,二对,三条,顺子,同花,葫芦,炸弹,同花顺,
	 * @param  {DdzCardVO[]} targets
	 * @returns number
	 */
	private static getCard_5(targets: DdzCardVO[]): any {
		if (!targets || targets.length != 5)
			return null;
		var args: any = this.isFlush(targets);//是否为顺子
		if (args) {//如果是顺子,可能是同花顺
			if (this.isSameColor(targets)) {
				args.type = SsdUtil.Lv9;
			}
		} else {
			args = this.getMatchCountFuzzy([4], targets);//炸弹
			if (args != null) {
				args.type = SsdUtil.Lv8;
			} else {
				args = this.getMatchCount([3, 2], targets);//葫芦
				if (args != null)
					args.type = SsdUtil.Lv7;
			}
			if (!args) {
				args = this.isSameColor(targets);//同花
			}
			if (!args) {//三条
				args = this.getMatchCountFuzzy([3], targets);
				if (args != null)
					args.type = SsdUtil.Lv4;
			}
			if (!args) {//二对
				args = this.getMatchCountFuzzy([2, 2], targets);
				if (args != null)
					args.type = SsdUtil.Lv3;
			}
			if (!args) {//一对
				args = this.getMatchCountFuzzy([2], targets);
				if (args != null)
					args.type = SsdUtil.Lv2;
			}
			if (!args) {//高牌
				args = this.getGaoPai(targets);
			}
		}
		return args;
	}

	/**
	 * 特殊牌型判断
	 */
	private static getCard_13(targets: DdzCardVO[]): any {
		var args: any = this.isSameColor(targets);
		if (args != null) {
			if (this.isFlush(targets)) {//青龙
				args.type = SsdUtil.Lv23;
			}
		}
		if (args != null)
			return args;
		args = new Object();
		var blackCount: number = this.getBlackCount(targets);
		if (blackCount == 13) {//全黑
			args.type = SsdUtil.Lv22;
			return args;
		}
		if (blackCount == 0) {//全红
			args.type = SsdUtil.Lv21;
			return args;
		}
		if (blackCount == 12) {//全黑一点红
			args.type = SsdUtil.Lv20;
			return args;
		}
		if (blackCount == 1) {//全红一点黑
			args.type = SsdUtil.Lv19;
			return args;
		}
		if (this.isFlush(targets)) {//一条龙
			args.type = SsdUtil.Lv18;
			return args;
		}
		if (this.getMatchCountBs(2, targets) == 5 && this.getMatchCountBs(3, targets) == 1) {//五对一刻
			args.type = SsdUtil.Lv17;
			return args;
		}
		if (!this.hasContentOne([2, 3, 4, 5, 14], targets) && this.hasContent([6, 7, 8, 9, 10, 11, 12, 13], targets)) {//全大
			args.type = SsdUtil.Lv16;
			return args;
		}
		if (!this.hasContentOne([11, 12, 13, 14], targets) && this.hasContent([2, 3, 4, 5, 6, 7, 8, 9, 10], targets)) {//全小
			args.type = SsdUtil.Lv15;
			return args;
		}
		if (this.getMatchCountBs(2, targets) == 6) {//六对半
			args.type = SsdUtil.Lv14;
			return args;
		}
		if (this.hasContent([6, 7, 8, 9, 10, 11, 12, 13, 14], targets) && !this.hasContentOne([2, 3, 4, 5], targets)) {//半大
			args.type = SsdUtil.Lv13;
			return args;
		}
		if (this.hasContent([2, 3, 4, 5, 6, 7, 8, 9, 10, 14], targets) && !this.hasContentOne([11, 12, 13], targets)) {//半小
			args.type = SsdUtil.Lv12;
			return args;
		}
		//三花,三顺需要特殊判断
		return null;
	}
	//---------------------下面是牌组类型判断函数---------------------

	//是否包含所有
	private static hasContent(content: number[], targets: DdzCardVO[]): boolean {
		for (var i: number = 0; i < targets.length; i++) {
			var index: number = content.indexOf(targets[i].num);
			if (index >= 0)
				content.splice(index, 1);
		}
		return content.length == 0;
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
			var keyId: string = num + "_" + (parseInt(Math.random() * 3 + "") + 1);
			selfCards.push(SsdUtil._poolMap.get(keyId));
		}
		var args: any = SsdUtil.getCardsArgs(selfCards, null, null);
		LogTrace.log(args);
	}

	//是否包含
	private static hasContentOne(content: number[], targets: DdzCardVO[]): boolean {
		for (var i: number = 0; i < targets.length; i++) {
			var index: number = content.indexOf(targets[i].num);
			if (index >= 0) {
				return true;
			}
		}
		return false;
	}

	private static getBlackCount(targets: DdzCardVO[]): number {
		var count: number = 0;
		for (var i: number = 0; i < targets.length; i++) {
			if (targets[i].type % 2 == 1) {
				count++;
			}
		}
		return count;
	}

	//获取匹配数量,倍数方式
	private static getMatchCountBs(num: number, targets: DdzCardVO[]): number {
		var count: number = 0;
		SsdUtil.resetCounter();
		var i: number = 0;
		var cvo: DdzCardVO;
		//1.取计数器,包括所有的牌（另外存储赖子的数量）
		for (i = 0; i < targets.length; i++) {
			cvo = targets[i];
			SsdUtil._counterArray[cvo.num] = SsdUtil._counterArray[cvo.num] + 1;
		}
		for (i = 0; i < SsdUtil._counterArray.length; i++) {
			var c: number = SsdUtil._counterArray[i];
			if (c > 0 && c % num == 0)
				count += c / num;
		}
		return count;
	}

	/**
	 * 同花,大的胜,存第一个
	 */
	private static isSameColor(targets: DdzCardVO[]): any {
		var color: number = targets[0].type;
		var maxVO: DdzCardVO = targets[0];
		for (var i: number = 0; i < targets.length; i++) {
			if (targets[i].type != color)
				return null;
			if (targets[i].num > maxVO.num) {
				maxVO = targets[i];
			}
		}
		var arr: DdzCardVO[] = [];
		for (i = 0; i < targets.length; i++) {
			arr.push(targets[i]);
		}
		//从大到小排序
		arr.sort(function (a, b) {
			return b.sortId - a.sortId;
		});
		var args: any = new Object();
		args.type = SsdUtil.Lv6;
		args.cards = arr;
		return args;
	}

	/**
	 * 是否为顺子,获取顺子的最大牌
	 * 特殊说明:A可以做A也可以做1
	 * @param  {DdzCardVO[]} targets
	 * @returns number[] 0是顺子最大牌,1是顺子长度
	 */
	private static isFlush(targets: DdzCardVO[]): any {
		//从1开始算顺子,最多13张
		if (targets.length < 3)
			return null;
		var has2: boolean = false;
		var i: number = 0;
		for (i = 0; i < targets.length; i++) {
			if (targets[i].num == 2) {
				has2 = true;
				break;
			}
		}
		var cgs: number[] = [0];
		SsdUtil.resetCounter();
		//进行计数
		for (i = 0; i < targets.length; i++) {
			var findex: number = targets[i].num;
			if (findex == 14 && has2)
				findex = 1;
			var c: number = SsdUtil._counterArray[findex] + 1;
			if (c > 1)
				return null;
			SsdUtil._counterArray[findex] = c;
		}
		var maxNum: number = 0;
		var startFlush: boolean = false;
		var lxCount: number = 0;
		for (i = 1; i <= 14; i++) {
			if (startFlush) {
				if (SsdUtil._counterArray[i] == 0)
					break;
				else {
					maxNum = i;
					lxCount++;
				}
			} else {
				if (SsdUtil._counterArray[i] != 0 && !startFlush) {
					startFlush = true;
					lxCount++;
				}
			}
		}
		if (lxCount >= targets.length) {
			var targetVo: DdzCardVO;
			for (i = 0; i < targets.length; i++) {
				if (targets[i].num == maxNum) {
					targetVo = targets[i];
					break;
				}
			}
			var fh: any = new Object();
			fh.type = SsdUtil.Lv5;
			fh.cards = [targetVo];
			if (maxNum == 5) {
				var vo: DdzCardVO = new DdzCardVO(13.5, 1);
				fh.cards = [vo];
			}
			return fh;
		}
		return null;
	}

	/**
	 * 获取高牌
	 */
	private static getGaoPai(targets: DdzCardVO[]): any {
		targets.sort(function (a, b) {
			return b.sortId - a.sortId;
		});
		var args: any = new Object();
		args.cards = targets;
		args.type = SsdUtil.Lv1;
		return args;
	}

	/**
	 * 模糊匹配,只要从大可匹配最小倍数即可
	 * @param  {number[]} match 需要匹配的组合数量
	 * @param  {DdzCardVO[]} targets
	 * @returns number[] 匹配结果牌,从大到小,如果匹配不上则返回null
	 */
	private static getMatchCountFuzzy(match: number[], targets: DdzCardVO[]): number[] {
		var i: number = 0;
		var maxNeedCount: number = match[0];//连续中最大需求数
		var needCount: number = match.length;//最大数匹配数量
		var cvo: DdzCardVO;
		//1.将targets进行从大到小排序
		targets.sort(function (a, b) {
			return b.sortId - a.sortId;
		});
		//2.循环找相同num的数量,如果满足match,则添加到cards中。不满足,则添加到others中
		var cards: DdzCardVO[] = [];
		var others: DdzCardVO[] = [];
		var focusCards: DdzCardVO[] = [];
		var targetNum: number = 0;
		for (i; i < targets.length; i++) {
			if (targets[i].num == targetNum) {//延续
				focusCards.push(targets[i]);
			} else {//非延续
				if (focusCards.length % maxNeedCount == 0 && focusCards.length > 0) {
					needCount -= focusCards.length / maxNeedCount;
					while (focusCards.length > 0) {
						cards.push(focusCards.shift());
					}
				} else if (focusCards.length > 0) {
					while (focusCards.length > 0) {
						others.push(focusCards.shift());
					}
				}
				focusCards = [];
				focusCards.push(targets[i]);
				targetNum = targets[i].num;
			}
		}
		if (focusCards.length % maxNeedCount == 0 && focusCards.length > 0) {
			needCount -= focusCards.length / maxNeedCount;
			while (focusCards.length > 0) {
				cards.push(focusCards.shift());
			}
		}
		//3.拼接cards和others并,返回
		if (needCount > 0)
			return null;
		var args: any = new Object();
		while (others.length > 0)
			cards.push(others.shift());
		args.cards = cards;
		return args;
	}

	/**
	 * 通过数量进行匹配[3,2]匹配三带一对(这里必须从大到小)
	 * @param  {number[]} match 需要匹配的组合数量
	 * @param  {DdzCardVO[]} targets
	 * @returns number[] 匹配,从大到小num排序,如果是炸弹,则需要在头加上subType
	 */
	private static getMatchCount(match: number[], targets: DdzCardVO[]): number[] {
		var rese: number[] = [];
		var args: any = null;
		SsdUtil.resetCounter();
		//0.首先从match中获取匹配的最大数的连续数量(比如3,3,1,1;连续3,3长度为2)，记录牌号需求的最大数
		var i: number = 0;
		for (i = 0; i < match.length; i++) {
			rese[i] = match[i];
		}
		var cvo: DdzCardVO;
		//1.取计数器,包括所有的牌（另外存储赖子的数量）
		for (i = 0; i < targets.length; i++) {
			cvo = targets[i];
			SsdUtil._counterArray[cvo.num] = SsdUtil._counterArray[cvo.num] + 1;
		}
		//2.反向循环计数器
		var pp: number[] = [];
		for (i = 0; i < match.length; i++) {
			pp.push(0);
		}
		for (i = SsdUtil._counterArray.length - 1; i >= 0; i--) {
			var hasCount: number = SsdUtil._counterArray[i];
			if (hasCount > 0 && match.indexOf(hasCount) >= 0) {
				var index: number = match.indexOf(hasCount);
				match[index] = 0;
				pp[index] = i;
			}
		}
		if (pp.indexOf(0) >= 0)
			return;
		targets.sort(function (a, b) {
			return b.sortId - a.sortId;
		});
		var cards: DdzCardVO[] = [];
		for (i = 0; i < pp.length; i++) {
			var num: number = pp[i];
			var count: number = rese[i];
			for (var j: number = targets.length - 1; j >= 0; j--) {
				cvo = targets[j];
				if (cvo.num == num) {
					cards.push(cvo);
				}
			}
		}
		args = new Object();
		args.cards = cards;
		return args;
	}


	//重置计数器
	private static resetCounter(): void {
		for (var i: number = 0; i < 18; i++) {
			SsdUtil._counterArray[i] = 0;
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

	/**
	 * 撲克牌
	 */
	public getCardvos(ids: number[]): DdzCardVO[] {
		var arr: DdzCardVO[] = [];
		for (var i: number = 0; i < ids.length; i++) {
			arr.push(SsdUtil._poolMapByID.get(ids[i]));
		}
		return arr;
	}

	//----------------提示部分-------------

	public specTypes: number[] = [];//13张牌的特殊牌型
	public specCardsIds: DdzCardVO[] = [];//特殊牌的
	public handTypes: number[] = [];//可以手动填入的types

	public puTypes: number[] = [];//里面存放的是number的数组
	public puCards: any[] = [];//里面存放的是cardvo的数组

	public clearAll(): void {
		this.puTypes = [];
		this.puCards = [];
	}
	/**
	 * 創建自动摆牌的提示
	 * this._handCards
	 */
	public createTips(): void {
		this.clearAll();
		if (this._handCards.length <= 0)
			return;
		var findLens: number[] = [5, 5, 3];
		var lastCards: DdzCardVO[] = [];
		for (var i: number = 0; i < this._handCards.length; i++) {
			var cvs: DdzCardVO = this._handCards[i];
			lastCards.push(cvs);
		}
		this.createAutoTip(lastCards, findLens);
		this.checkSec();
	}

	/**
	 * 获取符合条件的组合最大权值的最近一个提示组
	 * @param  {DdzCardVO[]} lastCards
	 * @param  {number[]} findLens
	 * @param  {any} targetArgs
	 * @param  {number} type
	 * @returns DdzCardVO
	 */
	private createAutoTip(lastCards: DdzCardVO[], findLens: number[]): void {
		var randomCards: any[] = RandomUtil.getHandArgs(findLens[0], lastCards);
		var i: number = 0;
		var cars: DdzCardVO[];
		var args: any;
		var fhCards: any[] = [];
		for (i; i < randomCards.length; i++) {
			cars = randomCards[i];
			args = SsdUtil.getCardsArgs(cars, null, null);
			fhCards.push(cars);
		}
		var resultList: any[] = [];
		//依次遍历fhCards中的卡组，并将剩余的所有组合进行拼接符合条件的组合。
		for (i = 0; i < fhCards.length; i++) {
			cars = fhCards[i];
			var lstCards: DdzCardVO[] = [];
			for (var j: number = 0; j < lastCards.length; j++) {
				if (cars.indexOf(lastCards[j]) < 0)//如果还没有被选中
					lstCards.push(lastCards[j]);
			}
			var beforeArgs: any = SsdUtil.getCardsArgs(cars, null, null);
			var qzA: number = this.getAz(cars, beforeArgs.type, 3);
			//剩下的卡组,随机取
			var needCount: number = findLens[1];
			var rList: any[] = RandomUtil.getHandArgs(needCount, lstCards);
			for (j = 0; j < rList.length; j++) {
				var rCards: DdzCardVO[] = rList[j];
				var rArgs: any = SsdUtil.getCardsArgs(rCards, null, null);
				if (this.compareBigger(beforeArgs, rArgs) >= 1) {//如果这个随机满足条件,则将他们添加到组合中
					var qzB: number = this.getAz(rCards, rArgs.type, 2);
					resultList.push([qzA + qzB, cars, rCards]);
				}
			}
		}
		if (findLens.length == 3) {//如果长度是5,5,3。则取所有resultList中剩余的卡牌增加权重进行计算
			//将所有resultList
			var hasKeys: string[] = [];
			for (i = resultList.length - 1; i >= 0; i--) {
				var r2: any[] = resultList[i];
				var lstC2: DdzCardVO[] = [];
				for (var k: number = 0; k < lastCards.length; k++) {
					if (r2[1].indexOf(lastCards[k]) < 0 && r2[2].indexOf(lastCards[k]) < 0)
						lstC2.push(lastCards[k]);
				}
				var lstArg3: any = SsdUtil.getCardsArgs(r2[2], null, null);
				var arg3: any = SsdUtil.getCardsArgs(lstC2, r2[1], r2[2]);
				if (this.compareBigger(lstArg3, arg3) >= 1 || (arg3.type == SsdUtil.Lv5 || arg3.type == SsdUtil.Lv6 || arg3.type == SsdUtil.Lv9)) {//如果符合条件
					if (arg3 != null) {
						var qzC: number = this.getAz(lstC2, arg3.type, 1);
						r2[0] = r2[0] + qzC;
						r2.push(lstC2);
					} else {
						resultList.splice(i, 1);
					}
				} else {
				}
			}
		}
		//-----------相同类型只保留一个
		resultList.sort(function (a, b) {
			return a[0] - b[0];
		});
		for (i = resultList.length - 1; i >= 0; i--) {
			r2 = resultList[i];
			var arg1: any = SsdUtil.getCardsArgs(r2[1], null, null);
			var lstArg3: any = SsdUtil.getCardsArgs(r2[2], null, null);
			var arg3: any = SsdUtil.getCardsArgs(r2[3], r2[1], r2[2]);
			var key: string = arg1.type + "_" + lstArg3.type + "_" + arg3.type;
			if (hasKeys.indexOf(key) >= 0 || arg1.type == 0 || lstArg3.type == 0 || arg3.type == 0) {
				resultList.splice(i, 1);
			} else {
				hasKeys.push(key);
			}
		}
		//-----------相同类型保留一个
		//权重从大到小进行排序
		resultList.sort(function (a, b) {
			return b[0] - a[0];
		});
		//选出权重最大的一个
		var lastDel: any;
		var max: any[] = resultList[0];
		var type1: number = SsdUtil.getCardsArgs(max[1], max[2], max[3]).type;
		var type2: number = SsdUtil.getCardsArgs(max[2], max[1], max[3]).type;
		var type3: number = SsdUtil.getCardsArgs(max[3], max[2], max[1]).type;
		for (i = resultList.length - 1; i >= 0; i--) {
			max = resultList[i];
			var t1: number = SsdUtil.getCardsArgs(max[1], max[2], max[3]).type;
			var t2: number = SsdUtil.getCardsArgs(max[2], max[1], max[3]).type;
			var t3: number = SsdUtil.getCardsArgs(max[3], max[2], max[1]).type;
			if (t1 == type1 && t2 == type2 && t3 == type3) {
			} else if (t1 > type1 || t2 > type2 || t3 > type3) {
			} else {
				lastDel = resultList.splice(i, 1)[0];
			}
		}
		// if (resultList.length == 1 && lastDel != null)
		// 	resultList.push(lastDel);
		for (var j: number = 1; j <= 3; j++) {
			for (i = 0; i < 3; i++) {
				if (resultList.length > i) {
					var ccs: any[] = resultList[i];
					var ta: any;
					if (j == 1)
						ta = SsdUtil.getCardsArgs(ccs[j], ccs[2], ccs[3]);
					else if (j == 2)
						ta = SsdUtil.getCardsArgs(ccs[j], ccs[1], ccs[3]);
					else
						ta = SsdUtil.getCardsArgs(ccs[j], ccs[1], ccs[2]);
					this.puTypes.push(ta.type);
					this.puCards.push(ccs[j]);
				}
			}
		}
	}



	private checkSec(): void {
		var checkPoses: any[] = [];
		if (this.puTypes.length == 9) {
			checkPoses = [[0, 3, 6], [1, 4, 7], [2, 5, 8]];
		} else if (this.puTypes.length == 6) {
			checkPoses = [[0, 2, 4], [1, 3, 5]];
		} else if (this.puTypes.length == 3) {
			checkPoses = [[0, 1, 2]];
		}
		//三顺判断Lv10
		var args: number[] = [];
		var i: number = 0;
		var j: number = 0;
		this.specCardsIds = [];
		if (this.specTypes.length == 0 && checkPoses.length > 0) {
			for (i = 0; i < checkPoses.length; i++) {
				args = checkPoses[i];
				var isss: boolean = true;
				this.specCardsIds = [];
				for (j = 0; j < args.length; j++) {
					if (this.puTypes[args[j]] != SsdUtil.Lv5 && this.puTypes[args[j]] != SsdUtil.Lv9) {
						isss = false;
						break;
					} else {
						var cvs: DdzCardVO[] = this.puCards[args[j]];
						for (var k: number = 0; k < cvs.length; k++) {
							this.specCardsIds.push(cvs[k]);
						}
					}
				}
				if (isss) {
					this.specTypes.push(SsdUtil.Lv10);
					break;
				} else {
					this.specCardsIds = [];
				}
			}
		}
		//三花判断Lv11
		if (this.specTypes.length == 0 && checkPoses.length > 0) {
			this.specCardsIds = [];
			for (i = 0; i < checkPoses.length; i++) {
				args = checkPoses[i];
				var isth: boolean = true;
				this.specCardsIds = [];
				for (j = 0; j < args.length; j++) {
					if (this.puTypes[args[j]] != SsdUtil.Lv6 && this.puTypes[args[j]] != SsdUtil.Lv9) {
						isth = false;
						break;
					} else {
						var cvs: DdzCardVO[] = this.puCards[args[j]];
						for (var k: number = 0; k < cvs.length; k++) {
							this.specCardsIds.push(cvs[k]);
						}
					}
				}
				if (isth) {
					this.specTypes.push(SsdUtil.Lv11);
					break;
				} else {
					this.specCardsIds = [];
				}
			}
		}
	}

	/**
	 * 手动组牌,需要特殊处理
	 * 葫芦：带最小的对（判定这个一对，不是三条，也不是炸弹。如果实在没有，则取三条、炸弹里最小的一对）
	   同花：遵守下道>中道>下道的规则内，因为对比，都是用最大的一张牌去比别人的同花大小。
	   例子：A23467kjq，那么同花肯定获取A2346作为同花了，尽量把大牌给其他道
	   一对（上道）-两对（中道）-两对（下道）这样的自动摆牌：
       AA337-下道（AA为最大，33最小，把大的牌，给中道，上道去）
       JJ6610-中道）（JJ为剩余的一对最大，66为最小，10为单牌的最小，尽量把大牌往上道去）
       99Q - 上道
	 */
	public createHandTips(dao0: number[], dao1: number[], dao2: number[]): void {
		this.specTypes = [];
		this.handTypes = [];
		if (this._handCards.length <= 0)
			return;
		//特殊牌型
		var spcArgs: any = SsdUtil.getCardsArgs(this._handCards, null, null);
		if (spcArgs != null)
			this.specTypes.push(spcArgs.type);
		//判断是否有三顺
		this.checkSec();
		//根據當前下，中，上，確定當前可以填入的當前道
		var nowDaos: number[] = [];
		if (dao2.length != 0)
			return;
		else if (dao1.length != 0) {
			nowDaos = dao1;
		} else if (dao0.length != 0) {
			nowDaos = dao0;
		}
		//对比用的牌组参数
		var args: any;
		var randomList: any[] = [];
		var lastCards: DdzCardVO[] = [];
		if (nowDaos.length > 0) {//剩餘牌,如果>5取5，否則取3
			args = SsdUtil.getCardsArgs(this.getCardvos(nowDaos), null, null);
			for (var i: number = 0; i < this._handCards.length; i++) {
				var cvs: DdzCardVO = this._handCards[i];
				if (dao0.indexOf(cvs.sortId) < 0 && dao1.indexOf(cvs.sortId) < 0 && dao2.indexOf(cvs.sortId) < 0) {
					lastCards.push(cvs);
				}
			}
			if (lastCards.length > 5) {
				randomList = RandomUtil.getHandArgs(5, lastCards);
			} else {
				randomList = RandomUtil.getHandArgs(3, lastCards);
			}
		} else {//隨即取5
			randomList = RandomUtil.getHandArgs(5, this._handCards);
		}
		var argsList: any[] = [];
		var sortList: any[] = [];
		for (var i: number = 0; i < randomList.length; i++) {
			var clist: DdzCardVO[] = randomList[i];
			var bjArgs: any;
			if (lastCards.length > 5)
				bjArgs = SsdUtil.getCardsArgs(clist, null, null);
			else
				bjArgs = SsdUtil.getCardsArgs(clist, this.getCardvos(dao1), this.getCardvos(dao2));
			argsList.push(bjArgs);
			sortList.push(bjArgs);
		}
		sortList.sort(function (a, b) {
			return b.type - a.type;
		});
		var hasTypes: number[] = [];
		for (i = 0; i < sortList.length; i++) {
			var aa: any = sortList[i];
			if ((!args || this.compareBigger(args, aa) >= 1 || (lastCards.length < 5 && (aa.type == SsdUtil.Lv5 || aa.type == SsdUtil.Lv6 || aa.type == SsdUtil.Lv9))) && hasTypes.indexOf(aa.type) < 0) {
				hasTypes.push(aa.type);
				this.handTypes.push(aa.type);
				if (hasTypes.length > 5)
					return;
			}
		}
	}

	//获取手牌提示对应的类型
	public getHandTip(dao0: number[], dao1: number[], dao2: number[], type: number): DdzCardVO[] {
		if (this._handCards.length <= 0)
			return [];
		//根據當前下，中，上，確定當前可以填入的當前道
		var nowDaos: number[] = [];
		if (dao2.length != 0)
			return [];
		else if (dao1.length != 0) {
			nowDaos = dao1;
		} else if (dao0.length != 0) {
			nowDaos = dao0;
		}
		var lastCards: DdzCardVO[] = [];
		for (var i: number = 0; i < this._handCards.length; i++) {
			var cvs: DdzCardVO = this._handCards[i];
			if (dao0.indexOf(cvs.sortId) < 0 && dao1.indexOf(cvs.sortId) < 0 && dao2.indexOf(cvs.sortId) < 0) {
				lastCards.push(cvs);
			}
		}
		var args: any;
		var findLens: number[] = [5, 5, 3];
		if (nowDaos.length > 0) {//剩餘牌,如果>5取5，否則取3
			args = SsdUtil.getCardsArgs(this.getCardvos(nowDaos), null, null);
			if (lastCards.length <= 3) {
				return lastCards;
			} else if (lastCards.length <= 8) {
				findLens = [5, 3];
			}
		}
		//利用lastCards与findLens,args,以及type获取一个最优先的选择
		return this.getFocusHandTip(lastCards, findLens, args, type);
	}

	/**
	 * 获取符合条件的组合最大权值的最近一个提示组
	 * @param  {DdzCardVO[]} lastCards
	 * @param  {number[]} findLens
	 * @param  {any} targetArgs
	 * @param  {number} type
	 * @returns DdzCardVO
	 */
	private getFocusHandTip(lastCards: DdzCardVO[], findLens: number[], targetArgs: any, type: number): DdzCardVO[] {
		var randomCards: any[] = RandomUtil.getHandArgs(findLens[0], lastCards);
		var i: number = 0;
		var cars: DdzCardVO[];
		var args: any;
		var fhCards: any[] = [];
		for (i; i < randomCards.length; i++) {
			cars = randomCards[i];
			args = SsdUtil.getCardsArgs(cars, null, null);
			if (type == args.type && (!targetArgs || this.compareBigger(targetArgs, args) >= 1)) {//大小符合条件并且type符合条件
				fhCards.push(cars);
			}
		}
		var resultList: any[] = [];
		//依次遍历fhCards中的卡组，并将剩余的所有组合进行拼接符合条件的组合。
		for (i = 0; i < fhCards.length; i++) {
			cars = fhCards[i];
			var lstCards: DdzCardVO[] = [];
			for (var j: number = 0; j < lastCards.length; j++) {
				if (cars.indexOf(lastCards[j]) < 0)//如果还没有被选中
					lstCards.push(lastCards[j]);
			}
			var beforeArgs: any = SsdUtil.getCardsArgs(cars, null, null);
			var qzA: number = this.getAz(cars, beforeArgs.type, 3);
			//剩下的卡组,随机取
			var needCount: number = findLens[1];
			var rList: any[] = RandomUtil.getHandArgs(needCount, lstCards);
			for (j = 0; j < rList.length; j++) {
				var rCards: DdzCardVO[] = rList[j];
				var rArgs: any = SsdUtil.getCardsArgs(rCards, null, null);
				if (this.compareBigger(beforeArgs, rArgs) >= 1) {//如果这个随机满足条件,则将他们添加到组合中
					var qzB: number = this.getAz(rCards, rArgs.type, 2);
					resultList.push([qzA + qzB, cars, rCards]);
				}
			}
		}
		// if (findLens.length == 3) {//如果长度是5,5,3。则取所有resultList中剩余的卡牌增加权重进行计算
		// 	//将所有resultList
		// 	for (i = resultList.length - 1; i >= 0; i--) {
		// 		var r2: any[] = resultList[i];
		// 		var lstC2: DdzCardVO[] = [];
		// 		for (var k: number = 0; k < lastCards.length; k++) {
		// 			if (r2[1].indexOf(lastCards[k]) < 0 && r2[2].indexOf(lastCards[k]) < 0)
		// 				lstC2.push(lastCards[k]);
		// 		}
		// 		var lstArg3: any = SsdUtil.getCardsArgs(r2[2]);
		// 		var arg3: any = SsdUtil.getCardsArgs(lstC2);
		// 		if (this.compareBigger(lstArg3, arg3) >= 1) {//如果符合条件
		// 			var qzC: number = this.getAz(lstC2, arg3.type, 1);
		// 			r2[0] = r2[0] + qzC;
		// 		}
		// 	}
		// }
		//返回权重最大的一组中的第一个卡组
		var maxIndex: number = 0;
		var qzNow: number = 0;
		var returnList: DdzCardVO[] = [];
		for (i = 0; i < resultList.length; i++) {
			if (resultList[i][0] > qzNow) {
				qzNow = resultList[i][0];
				returnList = resultList[i][1];
			}
		}
		return returnList;
	}

	//获取权重
	private getAz(cards: DdzCardVO[], type: number = 0, dao: number = 1): number {
		var targetType: number = type;
		if (targetType == 0) {
			var args: any = SsdUtil.getCardsArgs(cards, null, null);
			targetType = args.type;
		}
		var jc: number = 0;
		var fj: number = 0;
		var fj2: number = 0;
		var fj3: number = 0;
		switch (targetType) {
			case SsdUtil.Lv1://单牌
				jc = 0;
				if (dao == 1) {
					fj = this.getMaxFj(cards, 1, 1) * 6 + this.getMaxFj(cards, 1, 2) * 3 + this.getMaxFj(cards, 1, 3) * 3;
				} else if (dao == 2) {
					fj = this.getMaxFj(cards, 1, 1) * 7 + this.getMaxFj(cards, 1, 2) * 2 + this.getMaxFj(cards, 1, 3) * 2 + this.getMaxFj(cards, 1, 4) * 2 + this.getMaxFj(cards, 1, 5) * 2;
				} else {
					fj = this.getMaxFj(cards, 1, 1) * 8 + this.getMaxFj(cards, 1, 2) + this.getMaxFj(cards, 1, 3) + this.getMaxFj(cards, 1, 4) + this.getMaxFj(cards, 1, 5);
				}
				break;
			case SsdUtil.Lv2://对牌
				jc = 300;
				if (dao == 1) {
					fj = this.getMaxFj(cards, 2) * 6 + this.getMaxFj(cards, 1) * 3;
				} else if (dao == 2) {
					fj = this.getMaxFj(cards, 2) * 7 + this.getMaxFj(cards, 1, 1) * 2 + this.getMaxFj(cards, 1, 2) * 2 + this.getMaxFj(cards, 1, 3) * 2;
				} else {
					fj = this.getMaxFj(cards, 2) * 8 + this.getMaxFj(cards, 1, 1) + this.getMaxFj(cards, 1, 2) + this.getMaxFj(cards, 1, 3);
				}
				break;
			case SsdUtil.Lv3://两对
				jc = 600;
				if (dao == 1) {
				} else if (dao == 2) {
					fj = this.getMaxFj(cards, 2, 1) * 2 + this.getMaxFj(cards, 2, 2) * 2 + this.getMaxFj(cards, 1, 1) * 2;
				} else {
					fj = this.getMaxFj(cards, 2, 1) * 3 + this.getMaxFj(cards, 2, 2) + this.getMaxFj(cards, 1, 1);
				}
				break;
			case SsdUtil.Lv4://三条
				jc = 900;
				if (dao == 1) {
					fj = this.getMaxFj(cards, 3, 1);
				} else if (dao == 2) {
					fj = this.getMaxFj(cards, 3, 1) * 2 + this.getMaxFj(cards, 1, 1) * 2 + this.getMaxFj(cards, 1, 2) * 2;
				} else {
					fj = this.getMaxFj(cards, 3, 1) * 3 + this.getMaxFj(cards, 1, 1) + this.getMaxFj(cards, 1, 2);
				}
				break;
			case SsdUtil.Lv5://顺子
				jc = 1200;
				if (dao == 1) {
					fj = this.getMaxFj(cards, 1, 1) + this.getMaxFj(cards, 1, 2) * 4 + this.getMaxFj(cards, 1, 3) * 4;
				} else if (dao == 2) {
					fj = this.getMaxFj(cards, 1, 1) * 7 + this.getMaxFj(cards, 1, 2) * 2 + this.getMaxFj(cards, 1, 3) * 2 + this.getMaxFj(cards, 1, 4) * 2 + this.getMaxFj(cards, 1, 5) * 2;
				} else {
					fj = this.getMaxFj(cards, 1, 1) * 8 + this.getMaxFj(cards, 1, 2) + this.getMaxFj(cards, 1, 3) + this.getMaxFj(cards, 1, 4) + this.getMaxFj(cards, 1, 5);
				}
				break;
			case SsdUtil.Lv6://同花
				jc = 1500;
				if (dao == 1) {
					fj = this.getMaxFj(cards, 1, 1) + this.getMaxFj(cards, 1, 2) * 4 + this.getMaxFj(cards, 1, 3) * 4;
				} else if (dao == 2) {
					fj = this.getMaxFj(cards, 1, 1) * 7 + this.getMaxFj(cards, 1, 2) * 2 + this.getMaxFj(cards, 1, 3) * 2 + this.getMaxFj(cards, 1, 4) * 2 + this.getMaxFj(cards, 1, 5) * 2;
				} else {
					fj = this.getMaxFj(cards, 1, 1) * 8 + this.getMaxFj(cards, 1, 2) + this.getMaxFj(cards, 1, 3) + this.getMaxFj(cards, 1, 4) + this.getMaxFj(cards, 1, 5);
				}
				break;
			case SsdUtil.Lv7://葫芦
				jc = 1800;
				if (dao == 1) {
				} else if (dao == 2) {
					fj = this.getMaxFj(cards, 3, 1) * 2 + this.getMaxFj(cards, 2, 1) * 2;
				} else {
					fj = this.getMaxFj(cards, 3, 1) * 3 + this.getMaxFj(cards, 2, 1);
				}
				break;
			case SsdUtil.Lv8://炸弹
				jc = 2100;
				if (dao == 1) {
				} else if (dao == 2) {
					fj = this.getMaxFj(cards, 4, 1) * 2 + this.getMaxFj(cards, 1, 1) * 2;
				} else {
					fj = this.getMaxFj(cards, 4, 1) * 3 + this.getMaxFj(cards, 1, 1);
				}
				break;
			case SsdUtil.Lv9://同花顺
				jc = 2500;
				if (dao == 1) {
					fj = this.getMaxFj(cards, 1, 1) + this.getMaxFj(cards, 1, 2) * 4 + this.getMaxFj(cards, 1, 3) * 4;
				} else if (dao == 2) {
					fj = this.getMaxFj(cards, 1, 1) * 7 + this.getMaxFj(cards, 1, 2) * 2 + this.getMaxFj(cards, 1, 3) * 2 + this.getMaxFj(cards, 1, 4) * 2 + this.getMaxFj(cards, 1, 5) * 2;
				} else {
					fj = this.getMaxFj(cards, 1, 1) * 8 + this.getMaxFj(cards, 1, 2) + this.getMaxFj(cards, 1, 3) + this.getMaxFj(cards, 1, 4) + this.getMaxFj(cards, 1, 5);
				}
				break;
		}
		return jc + fj + fj2 + fj3;
	}

	//获取全值
	private getMaxFj(cards: DdzCardVO[], count: number, times: number = 1): number {
		var counter: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
		for (var i: number = 0; i < cards.length; i++) {
			if (cards[i].num == 15) {
				counter[2] = counter[2] + 1;
			} else if (cards[i].num == 1) {
				counter[14] = counter[14] + 1;
			} else
				counter[cards[i].num] = counter[cards[i].num] + 1;
		}
		for (var i = 14; i >= 0; i--) {
			if (counter[i] == count) {
				times--;
				if (times == 0)
					return i;
			}
		}
		return 0;
	}
}