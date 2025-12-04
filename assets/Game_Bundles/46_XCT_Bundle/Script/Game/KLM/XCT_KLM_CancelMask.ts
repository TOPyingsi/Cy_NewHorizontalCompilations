import { _decorator, Component, Node } from 'cc';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { XCT_Events } from '../../Common/XCT_Events';
import { XCT_KLM_DataManager } from '../../Manager/XCT_KLM_DataManager';
const { ccclass, property } = _decorator;

@ccclass('XCT_KLM_CancelMask')
export class XCT_KLM_CancelMask extends Component {

    protected onLoad(): void {
        this.node.on("click", this.onClick, this);
    }

    onClick() {
        if (XCT_KLM_DataManager.Instance.playerData.currentDay == 1 && !XCT_KLM_DataManager.Instance.isTutorialEnd) return;
        EventManager.Scene.emit(XCT_Events.KLM_Cancel_All_Ingredients);
    }
}


