import { _decorator, Component, instantiate, Label,Node,  Sprite, tween, v3, Vec3 } from 'cc';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { XGDY_GameEvents } from '../Common/XGDY_GameEvents';
import { XGDY_DataManager, XGDY_ItemType } from '../Manager/XGDY_DataManager';
import { XGDY_AudioManager } from '../Manager/XGDY_AudioManager';
import { XGDY_Constant } from '../Common/XGDY_Constant';
import { ProjectEvent, ProjectEventManager } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
import Banner from 'db://assets/Scripts/Banner';
const { ccclass, property } = _decorator;

@ccclass('XGDY_AddMoneyPanel')
export class XGDY_AddMoneyPanel extends Component {

    @property(Label)
    lblMoney:Label = null;

    @property(Node)
    btnGetMoney:Node = null;
    
    @property(Node)
    btnNo:Node = null;

    isAddListener:boolean = false;

    isNeedCancelListener = false;

    rewardItems:Node[] = [];

    currentMoney:number = 0;

    init(){
        if(!this.isAddListener){
            this.addListener();
        }

      let maxMapLevel = 0;
        
      let mapData = XGDY_DataManager.Instance.saveData.mapData;
      let specialMapLevels = [101,102,103]
        mapData.forEach(mapId=>{
            let mapLevel = parseInt(mapId.split("_")[1]);
            if(!specialMapLevels.includes(mapLevel)){
                maxMapLevel = Math.max(maxMapLevel,mapLevel);
            } 
        })

        let a = XGDY_Constant.addMoney;

        this.lblMoney.string = a[maxMapLevel].string + "金币";
        this.currentMoney = a[maxMapLevel].money;
          ProjectEventManager.emit(ProjectEvent.弹出窗口, "修勾钓鱼");
    }

    onGetMoneyClick(){
        Banner.Instance.ShowVideoAd(()=>{
            XGDY_DataManager.Instance.saveData.itemData[XGDY_ItemType.Coin] += this.currentMoney;
            EventManager.Scene.emit(XGDY_GameEvents.UI_Update_Money);
            EventManager.Scene.emit(XGDY_GameEvents.Show_Tip, "获得金币"+this.lblMoney.string);
            XGDY_DataManager.Instance.saveToStorage();
            this.node.active = false;
        })
    }
    
   
    onClickClose(){
        this.node.active = false;
    }

    addListener(){
        this.isAddListener = true;
      this.btnGetMoney.on("click",this.onGetMoneyClick,this);
      this.btnNo.on("click",this.onClickClose,this);
    }

  
    removeListener(){
    }

    protected onDestroy(): void {
        this.removeListener();
    }
}


