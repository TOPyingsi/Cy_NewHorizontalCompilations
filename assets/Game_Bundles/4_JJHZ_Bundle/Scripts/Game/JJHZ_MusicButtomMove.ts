import { _decorator, AudioSource, Component, debug, EventTouch, Node } from 'cc';
import { JJHZ_MoveTouch } from './JJHZ_MoveTouch';
import { JJHZ_MusicButtom } from './JJHZ_MusicButtom';
import { JJHZ_Player } from './JJHZ_Player';
import GameManager from '../../../0_XGTW/Scripts/GameManager';
import { JJHZ_GameManager } from './JJHZ_GameManager';
const { ccclass, property } = _decorator;

@ccclass('JJHZ_MusicButtomMove')
export class JJHZ_MusicButtomMove extends JJHZ_MoveTouch {
    private _musicbuttom: JJHZ_MusicButtom = null;
    start() {
        super.start();
        this._musicbuttom = this.node.parent.getComponent(JJHZ_MusicButtom);
    }
    //抬起事件
    TouchEndEvent() {
        if (this.Target && this.Target.name == "角色" && this.Target.getComponent(JJHZ_Player).ID < 0) {
            this._musicbuttom.SetState(this.Target);
        }
    }
    OnTouchStar(TouchData: EventTouch) {
        super.OnTouchStar(TouchData);
        JJHZ_GameManager.Instance.node.getComponent(AudioSource).play();
    }
}


