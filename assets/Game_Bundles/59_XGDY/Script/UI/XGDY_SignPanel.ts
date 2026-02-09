import { _decorator, Button, Component, instantiate, Label, Node, Sprite, tween, v3, Vec3 } from 'cc';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { XGDY_GameEvents } from '../Common/XGDY_GameEvents';
import { XGDY_DataManager, XGDY_SpecialItem } from '../Manager/XGDY_DataManager';
import { XGDY_AudioManager } from '../Manager/XGDY_AudioManager';
import { XGDY_Constant } from '../Common/XGDY_Constant';
import { ProjectEvent, ProjectEventManager } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
const { ccclass, property } = _decorator;

@ccclass('XGDY_SignPanel')
export class XGDY_SignPanel extends Component {

    @property(Node)
    btnClose:Node = null;

    @property(Node)
    dayContainer:Node = null;

    rewardItems:Node[] = [];

    isAddListener = false;

    init(){
        if(!this.isAddListener){
            this.addListener();
        }
        if(!XGDY_DataManager.Instance.saveData.lastSignInTime){
            //等于当前时间减去一天的时间戳
            XGDY_DataManager.Instance.saveData.lastSignInTime = Date.now() - 24 * 60 * 60 * 1000;
        }
        XGDY_DataManager.Instance.saveToStorage();


        this.dayContainer.children.forEach((dayNode)=>{
            let day = dayNode.name.split("_")[1];
            dayNode.getChildByName("signIned").active = XGDY_DataManager.Instance.saveData.signInDay > parseInt(day);

            //获取今日日期
            let currentDay  = new Date().getDate();
            let saveDate = new Date(XGDY_DataManager.Instance.saveData.lastSignInTime);
            
              
            if(parseInt(day) == XGDY_DataManager.Instance.saveData.signInDay){
                if(currentDay > saveDate.getDate()){//如果当前日期大于上次登录日期，则重置今日奖励
                    dayNode.getComponent(Button).interactable = true;
                    dayNode.off("click")
                    dayNode.on("click",()=>{
                        let reward = XGDY_Constant.dayReward[day]
                        XGDY_DataManager.Instance.saveData.itemData[reward.itemName] +=  reward.count;
                        XGDY_DataManager.Instance.saveData.signInDay++;
                        XGDY_DataManager.Instance.saveData.lastSignInTime = Date.now();
                        EventManager.Scene.emit(XGDY_GameEvents.UI_Update_Money);
                        EventManager.Scene.emit(XGDY_GameEvents.UI_Update_SpecialItemPanel);
                        XGDY_DataManager.Instance.saveToStorage();
                        this.init();
                    })
                }
                else{
                    dayNode.getComponent(Button).interactable = false;
                    dayNode.off("click")
                }
            }
            else{
                dayNode.getComponent(Button).interactable = false;
                dayNode.off("click")
            }
           
        })
                  ProjectEventManager.emit(ProjectEvent.弹出窗口, "修勾钓鱼");
    }

  

    onClickClose(){
        this.node.active = false;
    }

    addListener(){
        this.isAddListener = true;
       this.btnClose.on("click", this.onClickClose, this);
    }

  
    removeListener(){
    }

    protected onDestroy(): void {
        this.removeListener();
    }
}


