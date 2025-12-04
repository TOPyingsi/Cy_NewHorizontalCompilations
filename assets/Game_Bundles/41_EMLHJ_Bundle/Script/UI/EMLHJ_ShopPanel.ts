import { _decorator, Component, Label, Node } from 'cc';
import { EMLHJ_DataManager } from '../Manager/EMLHJ_DataManager';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { EMLHJ_GameEvents } from '../Common/EMLHJ_GameEvents';
const { ccclass, property } = _decorator;

@ccclass('EMLHJ_ShopPanel')
export class EMLHJ_ShopPanel extends Component {
  @property(Node)
    btnBack: Node = null;

    isAddedEvent: boolean = false;

    @property(Node)
    item_1: Node = null;

    @property(Node)
    item_2: Node = null;

    @property(Node)
    infoUI: Node = null;

    @property(Label)
    lblMoney: Label = null;

    @property(Node)
    btnBuy_1: Node = null;

    
    @property(Node)
    btnBuy_2: Node = null;

    @property(Node)
    tipNode: Node = null;

    selectedItemId: number = 1; // 选中的道具ID，默认为null

    protected start(): void {
        if(!this.isAddedEvent){
            this.registerEvents();
            this.isAddedEvent = true;
        }
    }


    // 初始化UI
    initUI() {
        if(!this.isAddedEvent){
            this.registerEvents();
            this.isAddedEvent = true;
        }

        this.selectedItemId = 1; // 设置为nul
        this.updateitems();
        this.updateMoney();
        this.tipNode.active = false; 
    }

    // 更新钞票方法
    updateMoney() {
        const dataMgr = EMLHJ_DataManager.Instance;
        this.lblMoney.string = dataMgr.money.toString();
    }
    

    updateInfoUI(){
        let itemId = this.selectedItemId;
        if(itemId == 1){
            this.infoUI.getChildByName("icon_1").active = true;
            this.infoUI.getChildByName("icon_2").active = false;
        }else{
            this.infoUI.getChildByName("icon_1").active = false;
            this.infoUI.getChildByName("icon_2").active = true;
        }
        let data = EMLHJ_DataManager.Instance.ItemData[itemId];
        this.infoUI.getChildByName("lblTitle").getComponent(Label).string = data.name;
        let a=""
        if(EMLHJ_DataManager.Instance.isItemGot(itemId)){
            a= "，当前剩余加持次数："+EMLHJ_DataManager.Instance.getGotItemRemainCount(itemId);
        }
        this.infoUI.getChildByName("lblDes").getComponent(Label).string = data.desc +a;
        this.infoUI.getChildByName("lblPrice").getComponent(Label).string = data.price.toString();
    }


    onBtnBackClick(){
        this.node.active = false;
    }

    showTip(str:string){
        this.tipNode.getChildByName("lblTip").getComponent(Label).string = str;
        this.tipNode.active = true;
        this.scheduleOnce(()=>{
            this.tipNode.active = false; 
        },2)
    }

    updateitems(){
        this.onBtnItem_2Click();
        this.onBtnItem_1Click();
    }

    onBtnItem_1Click(){
        this.selectedItemId = 1; // 设置为nul
        this.item_1.getChildByName("selected").active = true;
        this.item_2.getChildByName("selected").active = false;

        if(EMLHJ_DataManager.Instance.isItemGot(1)){
            this.btnBuy_1.active = false;
            this.item_1.getChildByName("got").active = true;
        }
        else{
            this.btnBuy_1.active = true;
            this.item_1.getChildByName("got").active = false;
        }

        this.updateInfoUI();
    }

    onBtnItem_2Click(){
        this.selectedItemId = 2; // 设置为nul
        this.item_1.getChildByName("selected").active = false;
        this.item_2.getChildByName("selected").active = true;

        if(EMLHJ_DataManager.Instance.isItemGot(2)){
            this.btnBuy_2.active = false;
            this.item_2.getChildByName("got").active = true;
        }
        else{
            this.btnBuy_2.active = true;
            this.item_2.getChildByName("got").active = false;
        }

        this.updateInfoUI();
    }

    onBtnBuy_1Click(){
        if(EMLHJ_DataManager.Instance.money < EMLHJ_DataManager.Instance.ItemData[1].price){
            this.showTip("金币不足");
        }
        else{
            EMLHJ_DataManager.Instance.getNewItem(1);
        }
       
    }

    onBtnBuy_2Click(){
        if(EMLHJ_DataManager.Instance.money < EMLHJ_DataManager.Instance.ItemData[2].price){
            this.showTip("金币不足");
        }
        else{
            EMLHJ_DataManager.Instance.getNewItem(2);
        }
    }

    // 注册事件监听
    registerEvents() {
        EventManager.on(EMLHJ_GameEvents.UPDATE_MONEY, this.updateMoney, this);
        EventManager.on(EMLHJ_GameEvents.UPDATE_ITEMS, this.updateitems, this);

        this.btnBack.on(Node.EventType.TOUCH_END, this.onBtnBackClick, this);
        this.item_1.on(Node.EventType.TOUCH_END,this.onBtnItem_1Click , this);
        this.item_2.on(Node.EventType.TOUCH_END,this.onBtnItem_2Click, this);
        this.btnBuy_1.on(Node.EventType.TOUCH_END,this.onBtnBuy_1Click, this);
        this.btnBuy_2.on(Node.EventType.TOUCH_END,this.onBtnBuy_2Click, this);
    }

    // 注销事件监听
    unregisterEvents() {
        EventManager.off(EMLHJ_GameEvents.UPDATE_MONEY, this.updateMoney, this);
        EventManager.off(EMLHJ_GameEvents.UPDATE_ITEMS, this.updateitems, this);

        // this.btnBack.off(Node.EventType.TOUCH_END, this.onBtnBackClick, this);
        // this.item_1.off(Node.EventType.TOUCH_END,this.onBtnItem_1Click, this);
        // this.item_2.off(Node.EventType.TOUCH_END,this.onBtnItem_2Click, this);
        // this.btnBuy_1.off(Node.EventType.TOUCH_END,this.onBtnBuy_1Click, this);
        // this.btnBuy_2.off(Node.EventType.TOUCH_END,this.onBtnBuy_2Click, this);
    }

    // 注销事件监听
    onDestroy() {
        this.unregisterEvents();
        this.isAddedEvent = false;
    }

}


