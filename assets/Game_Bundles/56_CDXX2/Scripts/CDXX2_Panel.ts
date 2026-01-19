import { _decorator, Component, Node, Sprite, tween, v3 } from 'cc';
const { ccclass, property } = _decorator;

//“滑出面板”通过缓动把主面板和副节点同时平移指定距离并开关遮罩，完成展开/收起动画，并在收起后自动隐藏节点。

@ccclass('CDXX2_Panel')
export class CDXX2_Panel extends Component {
    @property(Node)
    Panel: Node = null;

    @property(Sprite)
    Mask: Sprite = null;

    @property
    Duration: number = 0.3;

    @property
    Width: number = 0;

    @property
    Height: number = 0;

    @property(Node)
    Target2: Node = null;

    @property
    TargetWidth: number = 0;

    private _isShow: boolean = false;

    show() {
        if (this._isShow) return;
        this._isShow = true;
        this.node.active = true;
        tween(this.Panel)
            // .by(this.Duration, { x: -this.Width, y: -this.Height }, { easing: 'sineIn' })
            .by(this.Duration, { position: v3(-this.Width, -this.Height, 0) }, { easing: 'sineIn' })
            .call(() => {
                this.Mask.enabled = true;
            })
            .start();
        if (!this.Target2) return;
        tween(this.Target2)
            // .by(this.Duration, { x: -this.TargetWidth }, { easing: 'sineIn' })
            .by(this.Duration, { position: v3(-this.TargetWidth, 0, 0) }, { easing: 'sineIn' })
            .start();

    }

    close() {
        if (!this._isShow) return;
        this._isShow = false;
        tween(this.Panel)
            // .by(this.Duration, { x: this.Width, y: this.Height }, { easing: 'sineIn' })
            .by(this.Duration, { position: v3(this.Width, this.Height, 0) }, { easing: 'sineIn' })
            .call(() => {
                this.Mask.enabled = false;
                this.node.active = false;
            })
            .start();

        if (!this.Target2) return;
        tween(this.Target2)
            // .by(this.Duration, { x: this.TargetWidth }, { easing: 'sineIn' })
            .by(this.Duration, { position: v3(this.TargetWidth, 0, 0) }, { easing: 'sineIn' })
            .start();
    }

    protected onEnable(): void {
        this.show();
    }
}


