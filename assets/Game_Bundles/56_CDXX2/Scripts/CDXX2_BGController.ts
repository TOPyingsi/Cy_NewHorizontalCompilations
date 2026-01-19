import { _decorator, Component, Enum, Node } from 'cc';
import { CDXX2_BG, CDXX2_BG_TYPE } from './CDXX2_Constant';
import { CDXX2_EventManager, CDXX2_MyEvent } from './CDXX2_EventManager';
import CDXX2_PlayerController from './CDXX2_PlayerController';
import { CDXX2_GameData } from './CDXX2_GameData';
const { ccclass, property } = _decorator;

//背景控制基类，监听全局“换背景”事件，当收到的背景编号与自己相符时激活自身节点，并在“地图”类型下立即重设玩家位置、更新当前关卡号并存档。

@ccclass('CDXX2_BGController')
export class CDXX2_BGController extends Component {

    @property({ type: Enum(CDXX2_BG_TYPE) })
    Type: CDXX2_BG_TYPE = CDXX2_BG_TYPE.MAP;

    @property({ type: Enum(CDXX2_BG) })
    Bg: CDXX2_BG = CDXX2_BG.凡界_下层;


    Show(type: CDXX2_BG) {
        this.node.active = type == this.Bg;
        if (this.Type == CDXX2_BG_TYPE.MAP && type == this.Bg) {
            CDXX2_PlayerController.Instance.InitPos();
          if(type!=CDXX2_BG.挂机)  CDXX2_GameData.Instance.CurMap = type;
            CDXX2_GameData.DateSave();
        }
    }

    protected onEnable(): void {
        CDXX2_EventManager.on(CDXX2_MyEvent.CDXX2_BG_SHOW, this.Show, this);
    }
}


