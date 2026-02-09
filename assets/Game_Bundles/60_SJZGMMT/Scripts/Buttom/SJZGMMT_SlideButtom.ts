import { _decorator, Component, director, Node, Sprite } from 'cc';
import { SJZGMMT_EventManager } from '../SJZGMMT_EventManager';
import { SJZGMMT_AudioManager } from '../SJZGMMT_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('SJZGMMT_SlideButtom')
export class SJZGMMT_SlideButtom extends Component {
    @property()
    public CD: number = 5;//滑铲CD
    private _cd: number = 0;//剩余CD
    private _cdsprite: Sprite = null;
    start() {
        this._cdsprite = this.node.getChildByName("Mask").getComponent(Sprite);
        director.getScene().on(SJZGMMT_EventManager.重置滑铲CD, (num: number) => {
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
            SJZGMMT_AudioManager.globalAudioPlay("滑铲音效");
            director.getScene().emit(SJZGMMT_EventManager.主角滑铲);
        }
    }

}


