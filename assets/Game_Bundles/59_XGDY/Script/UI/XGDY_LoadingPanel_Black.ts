import { _decorator, Component, Label, Node, tween, UIOpacity } from 'cc';
import { XGDY_DataManager, XGDY_MapJsonData, XGDY_SpecialMapId } from '../Manager/XGDY_DataManager';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { XGDY_GameEvents } from '../Common/XGDY_GameEvents';
const { ccclass, property } = _decorator;

@ccclass('XGDY_LoadingPanel_Black')
export class XGDY_LoadingPanel_Black extends Component {
    // @property(Node)
    // lblMapName: Node = null;

    isNeedCancelListener = false;
    
    init(){
        this.node.getComponent(UIOpacity).opacity = 0;
        tween(this.node.getComponent(UIOpacity))
            .to(0.15, { opacity: 255 })
            .call(()=>{
                EventManager.Scene.emit(XGDY_GameEvents.Loading_Show_Completed);
            })
            .delay(0.15)
            .call(()=>{
                EventManager.Scene.emit(XGDY_GameEvents.UI_HIDE_DEFAULT_BLACK_PANEL);
                if(!XGDY_DataManager.Instance.dynamicData.isEnterHomeEnd){
                    this.isNeedCancelListener = true;
                    EventManager.on(XGDY_GameEvents.Enter_Home_End, this.onHideLoadingPanel, this);
                }
                else{
                    this.onHideLoadingPanel();
                }
               
            })
            .start();
    }

    addListener(){
        
    }

    onHideLoadingPanel(){
        XGDY_DataManager.Instance.dynamicData.isEnterHomeEnd = false;
       tween(this.node.getComponent(UIOpacity))
            .to(0.15, { opacity: 0 })
            .call(()=>{
                this.node.active = false;
                // EventManager.Scene.emit(XGDY_GameEvents.UI_SHOW_GAME_SETTING_PANEL);
                // EventManager.Scene.emit(XGDY_GameEvents.Show_NPC_Default_Dialouge);
            })
            .start();
            if(this.isNeedCancelListener){
                EventManager.off(XGDY_GameEvents.Enter_Home_End, this.onHideLoadingPanel, this);
            }
    }

}


