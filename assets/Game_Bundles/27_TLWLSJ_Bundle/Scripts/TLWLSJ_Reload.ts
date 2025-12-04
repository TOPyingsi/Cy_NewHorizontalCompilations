import { _decorator, Component, Animation, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('TLWLSJ_Reload')
export class TLWLSJ_Reload extends Component {
    Animation: Animation = null;
    private _aniName: string = "rotation";
    private _cb: Function = null;

    protected onLoad(): void {
        this.Animation = this.node.getChildByName("装弹中").getComponent(Animation);
        this.Animation.on(Animation.EventType.FINISHED, () => {
            this._cb && this._cb();
            this.node.destroy();
        }, this);
    }

    reload(cb: Function = null) {
        this.node.active = true;
        this.Animation.play(this._aniName);
        this._cb = cb;
    }

}


