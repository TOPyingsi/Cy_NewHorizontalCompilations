import { _decorator, Animation, Component, EventKeyboard, EventTouch, instantiate, KeyCode, Label, Node, Sprite, SpriteFrame, tween, UIOpacity, UITransform, v3, Vec3 } from 'cc';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { DH_AnglerJsonData, DH_DataManager, DH_FishingRodJsonData, DH_SkillJsonData } from '../Manager/DH_DataManager';
import { DH_GameEvents } from '../Common/DH_GameEvents';
import { DH_SkillDamageParams, DH_SkillId } from '../Common/DH_ISkillParams';
import { DH_SkillManager } from '../Manager/DH_SkillManager';
import { DH_GameManager } from '../Manager/DH_GameManager';
import { DH_LoadManager } from '../Manager/DH_LoadManager';
const { ccclass, property } = _decorator;

@ccclass('DH_TipPanel')
export class DH_TipPanel extends Component {



    @property(Node)
    private tipContainer: Node;

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


    addListener(){
        this.isAddLinstener = true;
        EventManager.on(DH_GameEvents.Show_Tip,this.showTip,this);
   

    }
    removeListener(){
        EventManager.off(DH_GameEvents.Show_Tip,this.showTip,this);
    }

    

    protected onDestroy(): void {
        this.removeListener();
    }

}


