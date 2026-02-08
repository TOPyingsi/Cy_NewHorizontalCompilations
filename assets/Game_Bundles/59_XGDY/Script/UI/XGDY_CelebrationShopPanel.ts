import { _decorator, Button, Component, instantiate, Label, Node, Sprite } from 'cc';
import { XGDY_DataManager, XGDY_ItemType, XGDY_MapJsonData } from '../Manager/XGDY_DataManager';
import { XGDY_LoadManager } from '../Manager/XGDY_LoadManager';
import { XGDY_GameManager } from '../Manager/XGDY_GameManager';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { XGDY_GameEvents } from '../Common/XGDY_GameEvents';
import { XGDY_Constant } from '../Common/XGDY_Constant';
import { ProjectEvent, ProjectEventManager } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
const { ccclass, property } = _decorator;

@ccclass('XGDY_CelebrationShopPanel')
export class XGDY_CelebrationShopPanel extends Component {

    
    @property(Label)
    celebrationCoin:Label = null;

    @property(Node)
    specialItemContainer:Node = null;

    @property(Button)
    btnClose:Button = null;

    isAddListener:boolean = false;
    
    init(){
        if(!this.isAddListener){
            this.addListener();
        }
        this.updateCelebrationCoin();
        this.initFishLevelList();
          ProjectEventManager.emit(ProjectEvent.弹出窗口, "修勾钓鱼");
    }

    updateCelebrationCoin(){
        let money = XGDY_DataManager.Instance.saveData.itemData[XGDY_ItemType.CelebrationCoin];
        let displayMoney: string;
        
        if (money >= 100000000) {
            // 超过亿时转换为亿单位并保留1位小数
            displayMoney = (money / 100000000).toFixed(1) + "亿";
        } else if (money >= 10000) {
            // 超过万时转换为万单位并保留1位小数
            displayMoney = (money / 10000).toFixed(1) + "万";
        } else {
            // 保留1位小数
            displayMoney = money.toFixed(0);
        }
        
        this.celebrationCoin.string =  displayMoney;
    }

    initFishLevelList(){
         this.specialItemContainer.children.forEach((node,idx)=>{
            const specialItemName = node.name;
            let specialItemData = XGDY_Constant.SpecialItemData[specialItemName];
            
            node.getChildByName("lblName").getComponent(Label).string = specialItemData.name;
            node.getChildByName("lblCount").getComponent(Label).string ="x"+ specialItemData.count.toString();
            node.getChildByName("lblLimit").getComponent(Label).string = specialItemData.limit == 999? "限购：不限":"限购："+ specialItemData.limit.toString();
            node.getChildByName("btnBuy").getChildByName("layout").getChildByName("lblPrice").getComponent(Label).string = "价格：" + specialItemData.price;
            node.getChildByName("nodeSellOut").active = false;
            if(specialItemData.limit != 999){
                if(!XGDY_DataManager.Instance.saveData.buiedSpecialItemData[specialItemName]){
                    XGDY_DataManager.Instance.saveData.buiedSpecialItemData[specialItemName] = 0;
                }
                node.getChildByName("nodeSellOut").active = XGDY_DataManager.Instance.saveData.buiedSpecialItemData[specialItemName] >= specialItemData.limit;
            }

            const btnBuy = node.getChildByName("btnBuy");
            btnBuy.active = ! node.getChildByName("nodeSellOut").active ;
            // btn.interactable = isUnlock;
            btnBuy.off("click");
            btnBuy.on("click", () => this.onBuyClick(node,specialItemData));
         })
    }

    onBuyClick(node:Node,data: {
        name: string;
        limit: number;
        price: number;
        count: number;
    }){
        let specialItemName = node.name;
        if(XGDY_DataManager.Instance.saveData.itemData[XGDY_ItemType.CelebrationCoin] >= data.price){
            XGDY_DataManager.Instance.saveData.itemData[XGDY_ItemType.CelebrationCoin] -= data.price;
            EventManager.Scene.emit(XGDY_GameEvents.UI_Update_CelebrationCoin_Money);
            XGDY_DataManager.Instance.saveToStorage();
        }
        else{
            EventManager.Scene.emit(XGDY_GameEvents.Show_Tip,"庆典币不足");
            return;
        }

        if(!XGDY_DataManager.Instance.saveData.itemData[specialItemName]){
            XGDY_DataManager.Instance.saveData.itemData[specialItemName] = 0;
        }
        XGDY_DataManager.Instance.saveData.itemData[specialItemName] += data.count;

        EventManager.Scene.emit(XGDY_GameEvents.Show_Tip,"购买成功");

        if(data.limit != 999){
            if(!XGDY_DataManager.Instance.saveData.buiedSpecialItemData[specialItemName]){
                XGDY_DataManager.Instance.saveData.buiedSpecialItemData[specialItemName] = 0;
            }
            XGDY_DataManager.Instance.saveData.buiedSpecialItemData[specialItemName] += data.count;
        }
        EventManager.Scene.emit(XGDY_GameEvents.UI_Update_SpecialItemPanel);
        XGDY_DataManager.Instance.saveToStorage();
        
        this.initFishLevelList();
    }

    addListener(){
        this.isAddListener = true;
        this.btnClose.node.on("click", this.onBtnCloseClick, this);

        EventManager.on(XGDY_GameEvents.UI_Update_CelebrationCoin_Money,this.updateCelebrationCoin,this);
    }

    onBtnCloseClick(){
        this.node.active = false;
    }

    removeListener(){
        EventManager.off(XGDY_GameEvents.UI_Update_CelebrationCoin_Money,this.updateCelebrationCoin,this);
    }

    protected onDestroy(): void {
        this.removeListener();
    }

    
}


