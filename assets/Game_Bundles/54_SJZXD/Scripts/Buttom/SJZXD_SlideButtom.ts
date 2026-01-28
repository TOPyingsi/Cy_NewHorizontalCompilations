import { _decorator, Component, director, Node, Sprite } from 'cc';
import { SJZXD_EventManager } from '../SJZXD_EventManager';
import { SJZXD_AudioManager } from '../SJZXD_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('SJZXD_SlideButtom')
export class SJZXD_SlideButtom extends Component {
    @property()
    public CD: number = 5;//滑铲CD
    private _cd: number = 0;//剩余CD
    private _cdsprite: Sprite = null;
    start() {
        this._cdsprite = this.node.getChildByName("Mask").getComponent(Sprite);
        director.getScene().on(SJZXD_EventManager.重置滑铲CD, (num: number) => {
            this.CD += num;
        });
    }

    protected update(dt: number): void {
        if (this._cd > 0) {
            this._cd -= dt;
            if (this._cd < 0) {
                this._cd = 0;
            }
        }
        this._cdsprite.fillRange = this._cd / this.CD;
    }


    OnClick() {
        if (this._cd <= 0) {
            this._cd = this.CD;
            SJZXD_AudioManager.globalAudioPlay("滑铲音效");
            director.getScene().emit(SJZXD_EventManager.主角滑铲);
        }
    }

}


