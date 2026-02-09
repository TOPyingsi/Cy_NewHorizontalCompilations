import { _decorator, Component, Label, Node } from 'cc';
import { XGDY_GameEvents } from '../Common/XGDY_GameEvents';
import { XGDY_DataManager, XGDY_SpecialMapId } from '../Manager/XGDY_DataManager';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { XGDY_Constant } from '../Common/XGDY_Constant';
const { ccclass, property } = _decorator;

@ccclass('XGDY_SpecialNPC')
export class XGDY_SpecialNPC extends Component {

    @property(String)
    defaultString = "要付包场费才可以钓噢"

    @property(Label)
    label = null;

    onLoad(){
      this.initString();
      this.addListener();
    }


    addListener(){
        if(XGDY_DataManager.Instance.dynamicData.currentMapId == XGDY_SpecialMapId.黑坑){
            EventManager.on(XGDY_GameEvents.SpecialNPC_Update_Label, this.onUpdateLabel, this);
            EventManager.on(XGDY_GameEvents.SpecialNPC_Init, this.initString, this);
        }
        if(XGDY_DataManager.Instance.dynamicData.currentMapId == XGDY_SpecialMapId.庆典){
            EventManager.on(XGDY_GameEvents.SpecialNPC_Update_Label, this.onUpdateLabel, this);
            EventManager.on(XGDY_GameEvents.SpecialNPC_Init, this.initString, this);
        }
        if(XGDY_DataManager.Instance.dynamicData.currentMapId == XGDY_SpecialMapId.钓鱼大赛){
            EventManager.on(XGDY_GameEvents.SpecialNPC_Update_Label, this.onUpdateLabel, this);
            EventManager.on(XGDY_GameEvents.SpecialNpc_MAP103_Challenge_1_Init_String, this.onShow_Map103_Challenge_1_InitString, this);
            EventManager.on(XGDY_GameEvents.SpecialNPC_Show_Challenge2_String, this.showChallenge2String, this);
            EventManager.on(XGDY_GameEvents.SpecialNpc_MAP103_Challenge_2_Init_String, this.onShow_Map103_Challenge_2_InitString, this);
            EventManager.on(XGDY_GameEvents.SpecialNpc_MAP103_Challenge_3_Init_String, this.onShow_Map103_Challenge_3_InitString, this);
            EventManager.on(XGDY_GameEvents.SpecialNPC_Show_Challenge3_String, this.showChallenge3String, this);
        }
    }

    onUpdateLabel(){
        let min = Math.floor(XGDY_DataManager.Instance.dynamicData.remainingTime / 60);
        let sec = Math.floor(XGDY_DataManager.Instance.dynamicData.remainingTime % 60);
        let timeString = min + "分" + sec + "秒";
        if(min == 0){
          timeString = sec + "秒";
        }
        if(XGDY_DataManager.Instance.dynamicData.currentMapId == XGDY_SpecialMapId.黑坑){
            this.label.string ="包场剩余时间：" + timeString;
        }
        else if(XGDY_DataManager.Instance.dynamicData.currentMapId == XGDY_SpecialMapId.庆典){
        
            let weight = XGDY_DataManager.Instance.dynamicData.challengeWeightCount;
            let displayWeight: string;
            
            if (weight >= 10000) {
                // 超过万斤时转换为万斤单位并保留1位小数
                displayWeight = (weight / 10000).toFixed(1) + "万斤";
            } else {
                // 保留1位小数
                displayWeight = weight.toFixed(0) + "斤";
            }
            
            this.label.string ="挑战剩余时间：" + timeString + "\n" + "已上鱼重量：" +  displayWeight;
        }
        else if(XGDY_DataManager.Instance.dynamicData.currentMapId == XGDY_SpecialMapId.钓鱼大赛){
            let fishName = XGDY_Constant.MAP_103_Challenge1_Data.targetFishName;
            let count = XGDY_DataManager.Instance.dynamicData.Map103_challenge_1_Count;
            let target = XGDY_DataManager.Instance.dynamicData.Map103_Challenge_1_TargetFishCount;
            this.label.string = "你需要在1分钟内钓上" + target + "条"  +fishName+ "！剩余："+timeString+"\n"+"已钓上"+count+"条";
        }
    }

    initString(){
        this.label.string = this.defaultString;
    }

    
    onShow_Map103_Challenge_1_InitString(){
        this.label.string = "开 启 百 强 赛";
    }

    onShow_Map103_Challenge_2_InitString(){
        this.label.string = "开 启 十 强 赛";
    }

    onShow_Map103_Challenge_3_InitString(){
        this.label.string = "开 启 决 赛";
    }

    showChallenge2String(){
        this.label.string = "本轮目标：钓起流云仙鱼！";
    }

    showChallenge3String(){
        this.label.string = "你的对手是：钓王勾!";
    }



    removeListener(){
        if(XGDY_DataManager.Instance.dynamicData.currentMapId == XGDY_SpecialMapId.黑坑){
            EventManager.off(XGDY_GameEvents.SpecialNPC_Update_Label, this.onUpdateLabel, this);
            EventManager.off(XGDY_GameEvents.SpecialNPC_Init, this.initString, this);
        }
        if(XGDY_DataManager.Instance.dynamicData.currentMapId == XGDY_SpecialMapId.庆典){
            EventManager.off(XGDY_GameEvents.SpecialNPC_Update_Label, this.onUpdateLabel, this);
            EventManager.off(XGDY_GameEvents.SpecialNPC_Init, this.initString, this);
        }
        if(XGDY_DataManager.Instance.dynamicData.currentMapId == XGDY_SpecialMapId.钓鱼大赛){
            EventManager.off(XGDY_GameEvents.SpecialNPC_Update_Label, this.onUpdateLabel, this);
            EventManager.off(XGDY_GameEvents.SpecialNpc_MAP103_Challenge_1_Init_String, this.onShow_Map103_Challenge_1_InitString, this);
            EventManager.off(XGDY_GameEvents.SpecialNPC_Show_Challenge2_String, this.showChallenge2String, this);
            EventManager.off(XGDY_GameEvents.SpecialNpc_MAP103_Challenge_2_Init_String, this.onShow_Map103_Challenge_2_InitString, this);
            EventManager.off(XGDY_GameEvents.SpecialNpc_MAP103_Challenge_3_Init_String, this.onShow_Map103_Challenge_3_InitString, this);
            EventManager.off(XGDY_GameEvents.SpecialNPC_Show_Challenge3_String, this.showChallenge3String, this);
        }
    }

    onDestroy(){
        this.removeListener();
    }
}


