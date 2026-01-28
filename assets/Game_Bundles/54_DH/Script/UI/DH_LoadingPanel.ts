import { _decorator, Component, Label, Node, tween, UIOpacity } from 'cc';
import { DH_DataManager, DH_MapJsonData } from '../Manager/DH_DataManager';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { DH_GameEvents } from '../Common/DH_GameEvents';
const { ccclass, property } = _decorator;

@ccclass('DH_LoadingPanel')
export class DH_LoadingPanel extends Component {
    @property(Node)
    lblMapName: Node = null;

    isNeedCancelListener = false;
    
    init(){
        this.lblMapName.getComponent(UIOpacity).opacity = 0;
        let mapData : DH_MapJsonData = DH_DataManager.Instance.getItemDataById(DH_DataManager.Instance.dynamicData.currentMapId);
        this.lblMapName.getComponent(Label).string = mapData.名称;
        tween(this.lblMapName.getComponent(UIOpacity))
            .to(1, { opacity: 255 })
            .delay(1)
            .call(()=>{
                if(!DH_DataManager.Instance.dynamicData.isEnterGameEnd){
                    this.isNeedCancelListener = true;
                    EventManager.on(DH_GameEvents.Enter_Map_End, this.onHideLoadingPanel, this);
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
                EventManager.Scene.emit(DH_GameEvents.UI_SHOW_GAME_SETTING_PANEL);
                 EventManager.Scene.emit(DH_GameEvents.Show_NPC_Default_Dialouge);
            })
            .start();
            if(this.isNeedCancelListener){
                EventManager.off(DH_GameEvents.Enter_Map_End, this.onHideLoadingPanel, this);
            }
    }

}


