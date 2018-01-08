/**
 * 基础层级容器的实现
 * @author nodep
 * @version 1.0
 */
class GameLayer extends egret.DisplayObjectContainer implements GameLayerInterface {
    /**
     * 层级的唯一名称
     */
    public layerType: string;
    private _wins: Array<GameWindow> = [];
    private _popCount: number = 0;
    private _popShape: eui.Rect;

    /**
     * 添加一个界面到舞台
     */
    public addWindow(win: GameWindow, toIndex: number): void {
        win.visible = false;
        var target: egret.DisplayObject = win;
        if (NodepConfig.auto == 1) {
            if (win.parent == null) {
                var autoBox: eui.Component = new eui.Component();
                autoBox.addChild(win);
                target = autoBox;
            }
        }
        if (toIndex >= 0)
            this.addChild(target);
        else
            this.addChildAt(target, 0);
        this._wins.push(win);
        if (win.pop)
            this._popCount++;
        this.updateModel();
        if (win.__inited)
            win.reOpen();
        win.__inited = true;
    }

    public clearLayer(): void {
        while (this._wins.length > 0) {
            var win: GameWindow = this._wins[0];
            this.removeWindow(win);
        }
    }

    /**
     * 移除一个界面
     */
    public removeWindow(win: GameWindow): void {
        if (win.pop)
            this._popCount--;
        this.updateModel();
        if (NodepConfig.auto == 1) {
            this.removeChild(win.parent);
            win.parent.removeChild(win);
        } else {
            this.removeChild(win);
        }
        this._wins.splice(this._wins.indexOf(win), 1);
        WinsManager.getIns().checkLayerVisible();
    }

    //检查可见度
    public checkVisible(): boolean {
        var i: number = this.numChildren;
        var has: boolean = false;
        while (i-- > 0) {
            var trg: any = this.getChildAt(i);
            if (trg == this._popShape)
                break;
            var win: GameWindow;
            if (trg instanceof GameWindow) {
                win = trg;
            } else if (trg.getChildAt(0) instanceof GameWindow) {
                win = trg.getChildAt(0);
            }
            win.visible = !has;
            if (win.isFull) {
                has = true;
            }
        }
        return has;
    }

    /**
     * 刷新阻挡层
     */
    private updateModel(): void {
        //添加
        if (this._popCount > 0 && (!this._popShape || !this._popShape.touchEnabled)) {
            if (!this._popShape) {
                this._popShape = new eui.Rect(100, 100, 0);
                this._popShape.alpha = 0;
            }
            this._popShape.width = WinsManager.stageWidth;
            this._popShape.height = WinsManager.stageHeight;
            this._popShape.touchEnabled = true;
            this.addChildAt(this._popShape, 0);
            TweenTs.get(this._popShape).to({ alpha: 0.7 }, 200);
        }//删除
        else if (this._popCount <= 0 && (this._popShape && this._popShape.touchEnabled)) {
            this._popShape.touchEnabled = false;
            TweenTs.get(this._popShape, true, 1, this.removePopShape, this).to({ alpha: 0 }, 200);
        }
    }

    public removePopShape(): void {
        if (this._popShape.parent)
            this._popShape.parent.removeChild(this._popShape);
    }

    /**
     * 界面大小变化
     */
    public resize(): void {
        var key: any;
        for (key in this._wins) {
            this._wins[key].resize();
        }
    }

    public autoScale(): void {
        var key: any;
        for (key in this._wins) {
            this._wins[key].autoScale();
        }
    }
}