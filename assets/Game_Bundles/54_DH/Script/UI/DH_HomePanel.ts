import { _decorator, Component, Node } from 'cc';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { DH_GameEvents } from '../Common/DH_GameEvents';
const { ccclass, property } = _decorator;

@ccclass('DH_HomePanel')
export class DH_HomePanel extends Component {
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
       EventManager.Scene.emit(DH_GameEvents.UI_SHOW_MAP_PANEL);
    }
}


