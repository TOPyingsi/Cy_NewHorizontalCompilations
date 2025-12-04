import { _decorator, Component, Node,Event } from 'cc';
import { XGTS_GameManager } from '../XGTS_GameManager';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { XGTS_Constant } from '../XGTS_Constant';
const { ccclass, property } = _decorator;

@ccclass('XGTS_SelectMode')
export class XGTS_SelectMode extends Component {
    @property(Node)
    private SingleGamePanel: Node = null;

    @property(Node)
    private DoubleGamePanel: Node = null;

    private SingleModeButton: Node = null;
    private DoubleModeButton: Node = null;

    protected onLoad(): void {
        this.SingleGamePanel.active = !XGTS_GameManager.IsDoubleMode;
        this.DoubleGamePanel.active = XGTS_GameManager.IsDoubleMode;

        this.SingleModeButton = this.node.getChildByName("SingleModeButton");
        this.DoubleModeButton = this.node.getChildByName("DoubleModeButton");
        this.updateSwitchUI();
    }

    updateSwitchUI(){
        this.SingleModeButton.children.forEach(element => {
            if(element.name == "selected")
            element.active = !XGTS_GameManager.IsDoubleMode;
        });
        this.DoubleModeButton.children.forEach(element => {
            if(element.name == "selected")
            element.active = XGTS_GameManager.IsDoubleMode;
        });
    }

    public onBtnClick(event: Event){
        switch (event.target.name) {
            case "SingleModeButton":
                if(!XGTS_GameManager.IsDoubleMode) return;
                    XGTS_GameManager.IsDoubleMode = false;
                this.SingleGamePanel.active = true;
                this.DoubleGamePanel.active = false;

                this.updateSwitchUI();

                EventManager.Scene.emit(XGTS_Constant.Event.CHANGE_SINGLE_MODE);
                break;true
            case "DoubleModeButton":
                if(XGTS_GameManager.IsDoubleMode) return;
                XGTS_GameManager.IsDoubleMode = true; 
                this.SingleGamePanel.active = false;
                this.DoubleGamePanel.active = true;

                this.updateSwitchUI();

                EventManager.Scene.emit(XGTS_Constant.Event.CHANGE_DOUBLE_MODE);
                break;
            default:
                break;
        }
    }
}


