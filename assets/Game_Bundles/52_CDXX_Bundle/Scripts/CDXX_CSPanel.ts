import { _decorator, Component, EventTouch, Label, Node } from 'cc';
import { CDXX_GameManager } from './CDXX_GameManager';
import { CDXX_EventManager, CDXX_MyEvent } from './CDXX_EventManager';
import { CDXX_GameData } from './CDXX_GameData';
import { CDXX_BG, CDXX_TJZL } from './CDXX_Constant';
import { CDXX_Tool } from './CDXX_Tool';
const { ccclass, property } = _decorator;

@ccclass('CDXX_CSPanel')
export class CDXX_CSPanel extends Component {

    @property(Label)
    TargetLabel: Label = null;

    @property(Label)
    TJZLLabel: Label = null;

    @property(Label)
    CurZLLabel: Label = null;

    Map: CDXX_BG = CDXX_BG.凡界_上层;
    Show(map: CDXX_BG) {
        this.node.active = true;
        this.Map = map;
        this.TargetLabel.string = CDXX_Tool.GetEnumKeyByValue(CDXX_BG, map);
        this.TJZLLabel.string = `推荐战力：${CDXX_TJZL.get(map)}`;
        this.CurZLLabel.string = `当前战力：${CDXX_GameData.Instance.ZL}`;
    }

    OnClickButton(event: EventTouch) {
        switch (event.target.name) {
            case "执意前往":
                this.node.active = false;
                // CDXX_GameManager.Instance.ShowBattlePanel();
                CDXX_GameManager.Instance.ShowLoadingPanel(3, () => {
                    CDXX_EventManager.Scene.emit(CDXX_MyEvent.CDXX_BG_SHOW, this.Map);
                })
                break;
            case "取消":
                this.node.active = false;
                break;
        }
    }
}


