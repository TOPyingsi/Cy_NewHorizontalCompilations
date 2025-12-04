import { _decorator, Component, Enum, find, Label, math, Node, Sprite } from 'cc';
import { CDXX_STATE } from './CDXX_Constant';
import { CDXX_GameData } from './CDXX_GameData';
import { CDXX_EventManager, CDXX_MyEvent } from './CDXX_EventManager';
import CDXX_PlayerController from './CDXX_PlayerController';
const { ccclass, property } = _decorator;

@ccclass('CDXX_State')
export class CDXX_State extends Component {

    @property({ type: Enum(CDXX_STATE) })
    State: CDXX_STATE = CDXX_STATE.血量;

    HPSprite: Sprite = null;
    Num: Label = null;

    protected onLoad(): void {
        if (this.State == CDXX_STATE.血量) this.HPSprite = find("HP", this.node).getComponent(Sprite);
        this.Num = find("Num", this.node).getComponent(Label);
    }

    protected onEnable(): void {
        CDXX_EventManager.on(CDXX_MyEvent.CDXX_STATE_SHOW, this.Show, this);
    }

    protected onDisable(): void {
        CDXX_EventManager.off(CDXX_MyEvent.CDXX_STATE_SHOW, this.Show, this);
    }

    Show() {
        switch (this.State) {
            case CDXX_STATE.血量:
                const curHp: number = math.clamp(CDXX_GameData.Instance.HP - CDXX_PlayerController.Instance.Injured, 0, CDXX_GameData.Instance.HP);
                this.HPSprite.fillRange = curHp / CDXX_GameData.Instance.HP;
                this.Num.string = `${curHp}/${CDXX_GameData.Instance.HP}`
                break;
            case CDXX_STATE.攻击:
                this.Num.string = `${CDXX_GameData.Instance.Harm}`
                break;
            case CDXX_STATE.战力:
                this.Num.string = `${CDXX_GameData.Instance.ZL}`
                break;
        }
    }
}


