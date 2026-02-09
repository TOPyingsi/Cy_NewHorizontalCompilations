import { _decorator, Component, Label, Node, tween, UIOpacity } from 'cc';
import { XGDY_DataManager, XGDY_MapJsonData, XGDY_SpecialMapId } from '../Manager/XGDY_DataManager';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { XGDY_GameEvents } from '../Common/XGDY_GameEvents';
const { ccclass, property } = _decorator;

@ccclass('XGDY_LoadingPanel')
export class XGDY_LoadingPanel extends Component {
    @property(Node)
    lblMapName: Node = null;

    isNeedCancelListener = false;
    
    init(){
        this.lblMapName.getComponent(UIOpacity).opacity = 0;
        let mapData : XGDY_MapJsonData = XGDY_DataManager.Instance.getItemDataById(XGDY_DataManager.Instance.dynamicData.currentMapId);
        this.lblMapName.getComponent(Label).string = mapData.名称;
        tween(this.lblMapName.getComponent(UIOpacity))
            .to(1, { opacity: 255 })
            .delay(1)
            .call(()=>{
                if(!XGDY_DataManager.Instance.dynamicData.isEnterGameEnd){
                    this.isNeedCancelListener = true;
                    EventManager.on(XGDY_GameEvents.Enter_Map_End, this.onHideLoadingPanel, this);
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
       tween(this.lblMapName.getComponent(UIOpacity))
            .to(1, { opacity: 0 })
            .call(()=>{
                this.node.active = false;

                 if(XGDY_DataManager.Instance.dynamicData.currentMapId == XGDY_SpecialMapId.钓鱼大赛){
                    EventManager.Scene.emit(XGDY_GameEvents.UI_SHOW_FISHING_COMPTITION_PANEL);
                 }
                 else{
                    EventManager.Scene.emit(XGDY_GameEvents.UI_Show_UIItem_Fishing);
                    EventManager.Scene.emit(XGDY_GameEvents.UI_SHOW_GAME_SETTING_PANEL);
                    EventManager.Scene.emit(XGDY_GameEvents.Show_NPC_Default_Dialouge);
                 }
            })
            .start();
            if(this.isNeedCancelListener){
                EventManager.off(XGDY_GameEvents.Enter_Map_End, this.onHideLoadingPanel, this);
            }
    }

}


