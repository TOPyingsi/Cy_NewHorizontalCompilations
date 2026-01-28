import { _decorator, Component, EventTouch, Label, Node } from 'cc';
import { CDXX2_GameManager } from './CDXX2_GameManager';
import { CDXX2_EventManager, CDXX2_MyEvent } from './CDXX2_EventManager';
import { CDXX2_GameData } from './CDXX2_GameData';
import { CDXX2_BG, CDXX2_TJZL } from './CDXX2_Constant';
import { CDXX2_Tool } from './CDXX2_Tool';
const { ccclass, property } = _decorator;

//“传送确认面板”显示目标地图名、系统推荐战力和玩家当前战力，点“执意前往”先 Loading 3 秒再切图，点“取消”直接关掉。

@ccclass('CDXX2_CSPanel')
export class CDXX2_CSPanel extends Component {

    @property(Label)
    TargetLabel: Label = null;

    @property(Label)
    TJZLLabel: Label = null;

    @property(Label)
    CurZLLabel: Label = null;

    Map: CDXX2_BG = CDXX2_BG.凡界_上层;
    Show(map: CDXX2_BG) {
        this.node.active = true;
        this.Map = map;
        this.TargetLabel.string = CDXX2_Tool.GetEnumKeyByValue(CDXX2_BG, map);
        this.TJZLLabel.string = `推荐战力：${CDXX2_TJZL.get(map)}`;
        this.CurZLLabel.string = `当前战力：${CDXX2_GameData.Instance.ZL}`;
    }

    OnClickButton(event: EventTouch) {
        switch (event.target.name) {
            case "执意前往":
                this.node.active = false;
                // CDXX2_GameManager.Instance.ShowBattlePanel();
                CDXX2_GameManager.Instance.ShowLoadingPanel(3, () => {
                    CDXX2_EventManager.Scene.emit(CDXX2_MyEvent.CDXX2_BG_SHOW, this.Map);
                })
                break;
            case "取消":
                this.node.active = false;
                break;
        }
    }
}


