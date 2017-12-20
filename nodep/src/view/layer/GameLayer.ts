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
    private _popShape: egret.Shape;

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
    }

    /**
     * 刷新阻挡层
     */
    private updateModel(): void {
        //添加
        if (this._popCount > 0 && (!this._popShape || !this._popShape.touchEnabled)) {
            if (!this._popShape) {
                this._popShape = new egret.Shape();
                this._popShape.alpha = 0;
            }
            this._popShape.graphics.clear();
            this._popShape.graphics.beginFill(0x000000, 0.7);
            this._popShape.graphics.drawRect(0, 0, WinsManager.stageWidth, WinsManager.stageHeight);
            this._popShape.graphics.endFill;
            this._popShape.touchEnabled = true;
            this.addChildAt(this._popShape, 0);
            TweenTs.removeTweens(this._popShape);
            TweenTs.get(this._popShape).to({ alpha: 1 }, 200);
        }//删除
        else if (this._popCount <= 0 && (this._popShape && this._popShape.touchEnabled)) {
            // this.removeChild(this._popShape);
            // this._popShape.graphics.clear();
            // this._popShape = null;
            this._popShape.touchEnabled = false;
            TweenTs.removeTweens(this._popShape);
            TweenTs.get(this._popShape).to({ alpha: 0 }, 200);
        }
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