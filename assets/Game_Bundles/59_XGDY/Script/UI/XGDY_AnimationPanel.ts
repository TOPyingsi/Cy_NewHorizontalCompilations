import { _decorator, Animation, Component, Node, v3 } from 'cc';
import { XGDY_DataManager } from '../Manager/XGDY_DataManager';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { XGDY_GameEvents } from '../Common/XGDY_GameEvents';
const { ccclass, property } = _decorator;

@ccclass('XGDY_AnimationPanel')
export class XGDY_AnimationPanel extends Component {

    @property(Node)
    animationNode: Node = null;
    
    init(){
        this.animationNode.setPosition(v3(0,0,0))
        if(!XGDY_DataManager.Instance.dynamicData.isEnterGame) return;
        let animation = this.animationNode.getComponent(Animation);
        animation.play();
        this.scheduleOnce(()=>{
            EventManager.Scene.emit(XGDY_GameEvents.UI_SHOW_LOADING_PANEL);
            this.node.active = false;
        },1);
    }


}


