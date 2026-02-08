import { _decorator, Component, Node } from 'cc';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { XGDY_GameEvents } from '../Common/XGDY_GameEvents';
const { ccclass, property } = _decorator;

@ccclass('XGDY_HomePanel')
export class XGDY_HomePanel extends Component {
    @property(Node)
    btnMap: Node = null;

    isAddListener:boolean = false;

    init(){
        if(!this.isAddListener){
            this.addListener();
        }
    }

    addListener(){
        this.isAddListener = true;
        this.btnMap.on("click", this.onBtnMapClick, this);
    }

    onBtnMapClick(){
       EventManager.Scene.emit(XGDY_GameEvents.UI_SHOW_MAP_PANEL);
    }
}


