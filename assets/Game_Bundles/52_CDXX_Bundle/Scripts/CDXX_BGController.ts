import { _decorator, Component, Enum, Node } from 'cc';
import { CDXX_BG, CDXX_BG_TYPE } from './CDXX_Constant';
import { CDXX_EventManager, CDXX_MyEvent } from './CDXX_EventManager';
import CDXX_PlayerController from './CDXX_PlayerController';
import { CDXX_GameData } from './CDXX_GameData';
const { ccclass, property } = _decorator;

@ccclass('CDXX_BGController')
export class CDXX_BGController extends Component {

    @property({ type: Enum(CDXX_BG_TYPE) })
    Type: CDXX_BG_TYPE = CDXX_BG_TYPE.MAP;

    @property({ type: Enum(CDXX_BG) })
    Bg: CDXX_BG = CDXX_BG.凡界_下层;


    Show(type: CDXX_BG) {
        this.node.active = type == this.Bg;
        if (this.Type == CDXX_BG_TYPE.MAP && type == this.Bg) {
            CDXX_PlayerController.Instance.InitPos();
            CDXX_GameData.Instance.CurMap = type;
            CDXX_GameData.DateSave();
        }
    }

    protected onEnable(): void {
        CDXX_EventManager.on(CDXX_MyEvent.CDXX_BG_SHOW, this.Show, this);
    }
}


