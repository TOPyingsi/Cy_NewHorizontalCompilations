import { _decorator, Component, instantiate, Label, Node, Sprite, tween, v3, Vec3 } from 'cc';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { XGDY_GameEvents } from '../Common/XGDY_GameEvents';
import { XGDY_DataManager } from '../Manager/XGDY_DataManager';
import { XGDY_AudioManager } from '../Manager/XGDY_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('XGDY_RewardPanel')
export class XGDY_RewardPanel extends Component {

    @property(Node)
    rewardNode: Node = null;

    @property(Sprite)
    spReward: Sprite = null;

    
    @property(Label)
    lblItemName:Label = null;

    @property(Node)
    btnClose:Node = null;

    isAddListener:boolean = false;

    isNeedCancelListener = false;

    rewardItems:Node[] = [];

    init(){
        if(!this.isAddListener){
            this.addListener();
        }
        this.rewardNode.active = false;

      

        this.lblItemName.string = XGDY_DataManager.Instance.dynamicData.rewardName;

        // if(!XGDY_DataManager.Instance.dynamicData.rewardSpriteFrame){
        //     this.isNeedCancelListener = true;
        //     EventManager.on(XGDY_GameEvents.UI_Set_Reward_SP, this.onSetReWard, this);
        // } else{
         
        // }

        let newReward = instantiate(this.rewardNode);
        newReward.setParent(this.rewardNode.parent);
        newReward.setWorldPosition(this.rewardNode.worldPosition.clone());
        this.rewardItems.push(newReward);

        this.onSetReWard(newReward.getChildByName("sp").getComponent(Sprite));

        newReward.active = true;
        newReward.setScale(v3(0, 0, 0))
        newReward.getChildByName("btnClose").on("click",()=>{
            this.rewardItems.splice(this.rewardItems.indexOf(newReward),1);
            newReward.destroy();
            if( this.rewardItems.length == 0){
                this.node.active = false;
            }
        },this)
        
        tween(newReward)
            .delay(this.rewardItems.length*0.15)
            .to(0.3, { scale: v3(1, 1, 1)})
            .call(()=>{
                XGDY_AudioManager.getInstance().playSound("get");
            })
            .start()
    }

    onSetReWard(spReward:Sprite){
        spReward.spriteFrame = XGDY_DataManager.Instance.dynamicData.rewardSpriteFrame;
    
        
       
        if(spReward.spriteFrame.width>1000){
            spReward.node.setScale(0.2,0.2,1)
        }
        else if(spReward.spriteFrame.width>600){
           spReward.node.setScale(0.3,0.3,1)
        }
        else if(spReward.spriteFrame.width>300){
            spReward.node.setScale(0.5,0.5,1)
        }
        else{
            spReward.node.setScale(1,1,1)
        }
        EventManager.off(XGDY_GameEvents.UI_Set_Reward_SP, this.onSetReWard, this);
        XGDY_DataManager.Instance.dynamicData.rewardSpriteFrame = null;
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


