import { _decorator, Component, Node, Sprite, tween, Tween } from 'cc';
const { ccclass, property } = _decorator;

//“加载条”用 fillRange 做进度，指定时间内从 0→1，同时把 LoadingNode 吸附在进度条前端，走完触发回调并自动隐藏。

@ccclass('CDXX2_Loading')
export class CDXX2_Loading extends Component {

    @property(Sprite)
    LoadingSprite: Sprite = null;

    @property(Node)
    LoadingNode: Node = null;

    @property
    Width: number = 0;

    protected update(dt: number): void {
        this.LoadingNode.setWorldPosition(this.LoadingSprite.node.worldPosition.x + this.LoadingSprite.fillRange * this.Width, this.LoadingSprite.node.worldPosition.y, this.LoadingSprite.node.worldPosition.z);
    }

    Show(duration: number, cb: Function = null) {
        this.node.active = true;
        Tween.stopAllByTarget(this.LoadingSprite);
        this.LoadingSprite.fillRange = 0;
        tween(this.LoadingSprite)
            .to(duration, { fillRange: 1 }, { easing: `circInOut` })
            .call(() => {
                this.node.active = false;
                cb && cb();
            })
            .start();
    }
}


