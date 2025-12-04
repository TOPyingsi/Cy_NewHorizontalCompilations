import { _decorator, Component, Node } from 'cc';
import { SJZ_DataManager } from './SJZ_DataManager';
import { Panel, UIManager } from 'db://assets/Scripts/Framework/Managers/UIManager';
const { ccclass, property } = _decorator;

@ccclass('SJZ_GameInit')
export class SJZ_GameInit extends Component {
    start() {
        SJZ_DataManager.LoadData().then(() => {
            UIManager.ShowPanel(Panel.LoadingPanel, "SJZ_Start");
        });
    }
}


