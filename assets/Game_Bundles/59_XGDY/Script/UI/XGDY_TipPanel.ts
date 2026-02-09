import { _decorator, Animation, Component, EventKeyboard, EventTouch, instantiate, KeyCode, Label, Node, Sprite, SpriteFrame, tween, UIOpacity, UITransform, v3, Vec3 } from 'cc';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { XGDY_AnglerJsonData, XGDY_DataManager, XGDY_FishingRodJsonData, XGDY_SkillJsonData } from '../Manager/XGDY_DataManager';
import { XGDY_GameEvents } from '../Common/XGDY_GameEvents';
import { XGDY_SkillDamageParams, XGDY_SkillId } from '../Common/XGDY_ISkillParams';
import { XGDY_SkillManager } from '../Manager/XGDY_SkillManager';
import { XGDY_GameManager } from '../Manager/XGDY_GameManager';
import { XGDY_LoadManager } from '../Manager/XGDY_LoadManager';
const { ccclass, property } = _decorator;

@ccclass('XGDY_TipPanel')
export class XGDY_TipPanel extends Component {



    @property(Node)
    private tipContainer: Node;

    
    @property(Node)
    private fishSkillTipContainer: Node;

    private isAddLinstener = false;


    onLoad(){
        this.addListener();
    }

    init(){
        if(!this.isAddLinstener){
            this.addListener();
        }
        this.tipContainer.children[0].active = false;

    }

 


    showTip(tip: string) {
        // 显示提示文本
       let tipItem = this.tipContainer.children[0];
       this.tipContainer.children[0].active = false;
       let newTipItem = instantiate(tipItem);
       newTipItem.getComponentInChildren(Label).string = tip;
       newTipItem.parent = this.tipContainer;
       newTipItem.setPosition(0,0);
       newTipItem.active = true;
       tween(newTipItem)
       .delay(2)
       .to(1,{position:new Vec3(0,100,0)})
       .call(()=>{
        newTipItem.destroy();
       })
       .start();

       tween(newTipItem.getComponent(UIOpacity))
      .delay(2)
      .to(1,{opacity:0})
      .start();

    }


    
    showFishSkillTip(tip: string) {
        // 显示提示文本
       let tipItem = this.fishSkillTipContainer.children[0];
       this.fishSkillTipContainer.children[0].active = false;
       let newTipItem = instantiate(tipItem);
       newTipItem.getComponentInChildren(Label).string = tip;
       newTipItem.parent = this.fishSkillTipContainer;

       newTipItem.active = true;

       newTipItem.setPosition(0,-100,0);
       tween(newTipItem)
        .to(0.2,{position:v3(0,0,0)})
        .delay(1)
        .to(0.3,{position:new Vec3(0,100,0)})
        .call(()=>{
            newTipItem.destroy();
        })
        .start();

        newTipItem.setScale(v3(0,0,0));
        tween(newTipItem)
        .to(0.2,{scale:v3(1,1,1)})
        .start();

       tween(newTipItem.getComponent(UIOpacity))
        .delay(1.2)
        .to(0.3,{opacity:0})
        .start();

    }


    addListener(){
        this.isAddLinstener = true;
        EventManager.on(XGDY_GameEvents.Show_Tip,this.showTip,this);
        EventManager.on(XGDY_GameEvents.Show_FishSkill_Tip,this.showFishSkillTip,this);
   

    }
    removeListener(){
        EventManager.off(XGDY_GameEvents.Show_Tip,this.showTip,this);
        EventManager.off(XGDY_GameEvents.Show_FishSkill_Tip,this.showFishSkillTip,this);
    }

    

    protected onDestroy(): void {
        this.removeListener();
    }

}


