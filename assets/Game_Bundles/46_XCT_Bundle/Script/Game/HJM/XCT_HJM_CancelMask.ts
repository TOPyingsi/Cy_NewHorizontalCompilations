import { _decorator, Component, Node } from 'cc';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { XCT_Events } from '../../Common/XCT_Events';
import { XCT_HJM_DataManager } from '../../Manager/XCT_HJM_DataManager';
const { ccclass, property } = _decorator;

@ccclass('XCT_HJM_CancelMask')
export class XCT_HJM_CancelMask extends Component {

    protected onLoad(): void {
        this.node.on("click", this.onClick, this);
    }

    onClick() {
        if (XCT_HJM_DataManager.Instance.playerData.currentDay == 1 && !XCT_HJM_DataManager.Instance.isTutorialEnd) return;
        EventManager.Scene.emit(XCT_Events.HJM_Cancel_All_Ingredients);
    }
}


