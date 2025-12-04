import { _decorator, Component, Node, Sprite, tween } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('HJMWK_Panel')
export class HJMWK_Panel extends Component {
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
            .by(this.Duration, { x: -this.Width, y: -this.Height }, { easing: 'sineIn' })
            .call(() => {
                this.Mask.enabled = true;
            })
            .start();
        if (!this.Target2) return;
        tween(this.Target2)
            .by(this.Duration, { x: -this.TargetWidth }, { easing: 'sineIn' })
            .start();

    }

    close() {
        if (!this._isShow) return;
        this._isShow = false;
        tween(this.Panel)
            .by(this.Duration, { x: this.Width, y: this.Height }, { easing: 'sineIn' })
            .call(() => {
                this.Mask.enabled = false;
                this.node.active = false;
            })
            .start();

        if (!this.Target2) return;
        tween(this.Target2)
            .by(this.Duration, { x: this.TargetWidth }, { easing: 'sineIn' })
            .start();
    }

    protected onEnable(): void {
        this.show();
    }
}


