import { _decorator, Component, Label, Node, Sprite, tween, v3, Vec3 } from 'cc';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { DH_GameEvents } from '../Common/DH_GameEvents';
import { DH_DataManager } from '../Manager/DH_DataManager';
import { DH_AudioManager } from '../Manager/DH_AudioManager';
import { ProjectEvent, ProjectEventManager } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
const { ccclass, property } = _decorator;

@ccclass('DH_RewardPanel')
export class DH_RewardPanel extends Component {

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

    init(){
        if(!this.isAddListener){
            this.addListener();
        }

      

        this.lblItemName.string = DH_DataManager.Instance.dynamicData.rewardName;

        if(!DH_DataManager.Instance.dynamicData.rewardSpriteFrame){
            this.isNeedCancelListener = true;
            EventManager.on(DH_GameEvents.UI_Set_Reward_SP, this.onSetReWard, this);
        } else{
            this.onSetReWard();
        }

        this.rewardNode.setScale(v3(0, 0, 0))
        tween(this.rewardNode)
            .to(0.3, { scale: v3(1, 1, 1)})
            .call(()=>{
                DH_AudioManager.getInstance().playSound("get");
            })
            .start()
        ProjectEventManager.emit(ProjectEvent.弹出窗口, "钓魂");
    }

    onSetReWard(){
        this.spReward.spriteFrame = DH_DataManager.Instance.dynamicData.rewardSpriteFrame;
    
        
       
        if(this.spReward.spriteFrame.width>1000){
            this.spReward.node.setScale(0.2,0.2,1)
        }
        else if(this.spReward.spriteFrame.width>600){
            this.spReward.node.setScale(0.3,0.3,1)
        }
        else if(this.spReward.spriteFrame.width>300){
            this.spReward.node.setScale(0.5,0.5,1)
        }
        else{
            this.spReward.node.setScale(1,1,1)
        }
        EventManager.off(DH_GameEvents.UI_Set_Reward_SP, this.onSetReWard, this);
        DH_DataManager.Instance.dynamicData.rewardSpriteFrame = null;
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


