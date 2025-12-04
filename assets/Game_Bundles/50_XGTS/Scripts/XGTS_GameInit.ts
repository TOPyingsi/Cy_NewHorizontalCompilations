import { _decorator, Component, Node } from 'cc';
import { XGTS_DataManager } from './XGTS_DataManager';
import { Panel, UIManager } from 'db://assets/Scripts/Framework/Managers/UIManager';
const { ccclass, property } = _decorator;

@ccclass('XGTS_GameInit')
export class XGTS_GameInit extends Component {
    start() {
        XGTS_DataManager.LoadData().then(() => {
            UIManager.ShowPanel(Panel.LoadingPanel, "XGTS_Start");
        });
    }
}


