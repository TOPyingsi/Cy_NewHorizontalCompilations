import { _decorator, Animation, Component, EventKeyboard, EventTouch, instantiate, KeyCode, Label, Node, Sprite, SpriteFrame, tween, UIOpacity, UITransform, v3, Vec3 } from 'cc';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { DH_AnglerJsonData, DH_DataManager, DH_FishingRodJsonData, DH_ItemType, DH_SkillJsonData } from '../Manager/DH_DataManager';
import { DH_GameEvents } from '../Common/DH_GameEvents';
import { DH_SkillDamageParams, DH_SkillId } from '../Common/DH_ISkillParams';
import { DH_SkillManager } from '../Manager/DH_SkillManager';
import { DH_GameManager } from '../Manager/DH_GameManager';
import { DH_LoadManager } from '../Manager/DH_LoadManager';
import Banner from 'db://assets/Scripts/Banner';
const { ccclass, property } = _decorator;

@ccclass('DH_GetMoreMoneyPanel')
export class DH_GetMoreMoneyPanel extends Component {

    @property(Node)
    private btnClose: Node;

    @property(Node)
    private btnGetMoreMoney: Node;

    private isAddLinstener = false;


    onLoad(){
        this.addListener();
    }

    init(){
        if(!this.isAddLinstener){
            this.addListener();
        }

        // this.node.setScale(v3(0,0,0));
        // tween(this.node)
        //     .to(0.2, { scale:v3(1,1,1) })
        //     .start();
    }

    onBtnCloseClick(){
        this.node.active = false;
    }

    
    onBtnGetMoreMoneyClick(){
        Banner.Instance.ShowVideoAd(()=>{
            //成功
            DH_DataManager.Instance.saveData.itemData[DH_ItemType.Coin] += 200000;
            EventManager.Scene.emit(DH_GameEvents.UI_Update_Money);
            EventManager.Scene.emit(DH_GameEvents.Show_Tip,"获得20万金币");
            DH_DataManager.Instance.saveToStorage();
            this.node.active = false;
        })
    }


    addListener(){
        this.isAddLinstener = true;
        this.btnClose.on("click",this.onBtnCloseClick,this)
        this.btnGetMoreMoney.on("click",this.onBtnGetMoreMoneyClick,this)
    }
    
    removeListener(){

    }


    protected onDestroy(): void {
        this.removeListener();
    }

}


