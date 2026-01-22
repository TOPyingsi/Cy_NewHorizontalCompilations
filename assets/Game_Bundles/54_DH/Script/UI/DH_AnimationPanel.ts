import { _decorator, Animation, Component, Node, v3 } from 'cc';
import { DH_DataManager } from '../Manager/DH_DataManager';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { DH_GameEvents } from '../Common/DH_GameEvents';
const { ccclass, property } = _decorator;

@ccclass('DH_AnimationPanel')
export class DH_AnimationPanel extends Component {

    @property(Node)
    animationNode: Node = null;
    
    init(){
        this.animationNode.setPosition(v3(0,0,0))
        if(!DH_DataManager.Instance.dynamicData.isEnterGame) return;
        let animation = this.animationNode.getComponent(Animation);
        animation.play();
        this.scheduleOnce(()=>{
            EventManager.Scene.emit(DH_GameEvents.UI_SHOW_LOADING_PANEL);
            this.node.active = false;
        },1);
    }


}


