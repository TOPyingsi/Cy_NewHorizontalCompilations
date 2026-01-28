import { _decorator, Component, Enum, find, Label, math, Sprite } from 'cc';
import { CDXX2_STATE } from './CDXX2_Constant';
import { CDXX2_GameData } from './CDXX2_GameData';
import { CDXX2_EventManager, CDXX2_MyEvent } from './CDXX2_EventManager';
import CDXX2_PlayerController from './CDXX2_PlayerController';
import { CDXX2_Tool } from './CDXX2_Tool';
const { ccclass, property } = _decorator;

//“状态栏”监听统一刷新事件，根据类型实时显示玩家当前血量/攻击/战力，其中血量条用 fillRange 做血条比例并显示具体数值。

@ccclass('CDXX2_State')
export class CDXX2_State extends Component {

    @property({ type: Enum(CDXX2_STATE) })
    State: CDXX2_STATE = CDXX2_STATE.血量;

    HPSprite: Sprite = null;
    Num: Label = null;

    protected onLoad(): void {
        if (this.State == CDXX2_STATE.血量) this.HPSprite = find("HP", this.node).getComponent(Sprite);
        this.Num = find("Num", this.node).getComponent(Label);
    }

    protected onEnable(): void {
        CDXX2_EventManager.on(CDXX2_MyEvent.CDXX2_STATE_SHOW, this.Show, this);
    }

    protected onDisable(): void {
        CDXX2_EventManager.off(CDXX2_MyEvent.CDXX2_STATE_SHOW, this.Show, this);
    }

    Show() {
        switch (this.State) {
            case CDXX2_STATE.血量:
                const curHp: number = math.clamp(CDXX2_GameData.Instance.HP - CDXX2_PlayerController.Instance.Injured, 0, CDXX2_GameData.Instance.HP);
                this.HPSprite.fillRange = curHp / CDXX2_GameData.Instance.HP;
                this.Num.string = `${CDXX2_Tool.formatNumber(curHp, 3)}/${CDXX2_Tool.formatNumber(CDXX2_GameData.Instance.HP, 3)}`
                break;
            case CDXX2_STATE.攻击:
                this.Num.string = `${CDXX2_Tool.formatNumber(CDXX2_GameData.Instance.Harm, 3)}`
                break;
            case CDXX2_STATE.战力:
                this.Num.string = `${CDXX2_Tool.formatNumber(CDXX2_GameData.Instance.ZL, 3)}`
                break;
        }
    }
}


