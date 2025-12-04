import { _decorator, Component, Node } from 'cc';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { XCT_Events } from '../../Common/XCT_Events';
import { XCT_JBT_DataManager } from '../../Manager/XCT_JBT_DataManager';
const { ccclass, property } = _decorator;

@ccclass('XCT_JBT_CancelMask')
export class XCT_JBT_CancelMask extends Component {

    protected onLoad(): void {
        this.node.on("click", this.onClick, this);
        this.addListener();
    }



    onClick() {
        if (XCT_JBT_DataManager.Instance.playerData.currentDay == 1 && !XCT_JBT_DataManager.Instance.isTutorialEnd) return;
        EventManager.Scene.emit(XCT_Events.JBT_Cancel_All_Ingredients);
    }

    onClickEnable() {
        this.node.active = true;
    }

    onClickDisable() {
        this.node.active = false;
    }

    addListener() {
        EventManager.on(XCT_Events.JBT_Cancel_All_Ingredients, this.onClickEnable, this);
        EventManager.on(XCT_Events.JBT_Disable_CancelMask, this.onClickDisable, this);
    }

    removeListener() {
        EventManager.off(XCT_Events.JBT_Cancel_All_Ingredients, this.onClickEnable, this);
        EventManager.off(XCT_Events.JBT_Disable_CancelMask, this.onClickDisable, this);
    }

    protected onDestroy(): void {
        this.removeListener();
    }
}


