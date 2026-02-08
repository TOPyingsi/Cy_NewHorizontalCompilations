import { _decorator, Button, Component, instantiate, Label, Node, Sprite } from 'cc';
import { XGDY_DataManager, XGDY_FishingCompetitionLevel, XGDY_ItemType, XGDY_MapJsonData } from '../Manager/XGDY_DataManager';
import { XGDY_LoadManager } from '../Manager/XGDY_LoadManager';
import { XGDY_GameManager } from '../Manager/XGDY_GameManager';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { XGDY_GameEvents } from '../Common/XGDY_GameEvents';
import { XGDY_Constant } from '../Common/XGDY_Constant';
import { ProjectEvent, ProjectEventManager } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
const { ccclass, property } = _decorator;

@ccclass('XGDY_FishingCompetitionPanel')
export class XGDY_FishingCompetitionPanel extends Component {



    @property(Node)
    competitionItemContainer:Node = null;

    @property(Button)
    btnClose:Button = null;

    @property(Button)
    btnStart:Button = null;

    @property(Button)
    btnRestart:Button = null;

    isAddListener:boolean = false;
    
    init(){
        if(!this.isAddListener){
            this.addListener();
        }
        this.initCompetitionList();
        //   ProjectEventManager.emit(ProjectEvent.弹出窗口, "修勾钓鱼");
    }


    initCompetitionList(){
        let currentCompetitionLevel = XGDY_DataManager.Instance.saveData.currentCompetitionLevel;
         this.competitionItemContainer.children.forEach((node,idx)=>{
            const itemLevel = idx+1;

            let nodeIsPassed = node.getChildByName("isPassed");
            if(itemLevel < currentCompetitionLevel){
                nodeIsPassed.active = true;
            }
            else{
                nodeIsPassed.active = false;
            }

            let nodeIsCurreentProgress = node.getChildByName("isCurrentProgress");
            
            nodeIsCurreentProgress.active = itemLevel == currentCompetitionLevel;
         })

         this.btnStart.node.active = currentCompetitionLevel <= 3 ;
    }


    onBtnStartClick(){

        //更新对话Id
        let dialogId = XGDY_DataManager.Instance.saveData.currentCompetitionLevel-1;
        XGDY_DataManager.Instance.dynamicData.currentDialogId = dialogId.toString();

        //更新当前等级的地图对话字符串
        switch(XGDY_DataManager.Instance.saveData.currentCompetitionLevel){
            case XGDY_FishingCompetitionLevel.预赛:
                EventManager.Scene.emit(XGDY_GameEvents.SpecialNpc_MAP103_Challenge_1_Init_String);
                break;
            case XGDY_FishingCompetitionLevel.十强赛:
                EventManager.Scene.emit(XGDY_GameEvents.SpecialNpc_MAP103_Challenge_2_Init_String);
                break;
            case XGDY_FishingCompetitionLevel.决赛:
                EventManager.Scene.emit(XGDY_GameEvents.SpecialNpc_MAP103_Challenge_3_Init_String);
                break;
        }

        //开始游戏
        EventManager.Scene.emit(XGDY_GameEvents.UI_SHOW_GAME_SETTING_PANEL);
        EventManager.Scene.emit(XGDY_GameEvents.Show_NPC_Default_Dialouge);
        this.node.active = false;
    }

    onBtnRestartClick(){
        XGDY_DataManager.Instance.saveData.currentCompetitionLevel = 1;

        //更新对话Id
        let dialogId = XGDY_DataManager.Instance.saveData.currentCompetitionLevel-1;
        XGDY_DataManager.Instance.saveToStorage();
        XGDY_DataManager.Instance.dynamicData.currentDialogId = dialogId.toString();

        //更新当前等级的地图对话字符串
        EventManager.Scene.emit(XGDY_GameEvents.SpecialNpc_MAP103_Challenge_1_Init_String);
       //开始游戏
        EventManager.Scene.emit(XGDY_GameEvents.UI_SHOW_GAME_SETTING_PANEL);
        EventManager.Scene.emit(XGDY_GameEvents.Show_NPC_Default_Dialouge);
        this.node.active = false;
    }



 
    addListener(){
        this.isAddListener = true;
        this.btnClose.node.on("click", this.onBtnCloseClick, this);
        this.btnStart.node.on("click", this.onBtnStartClick, this);
        this.btnRestart.node.on("click", this.onBtnRestartClick, this);
    }

    onBtnCloseClick(){
         XGDY_GameManager.Instance.exitGame();
    }

    removeListener(){
      
    }

    protected onDestroy(): void {
        this.removeListener();
    }

    
}


