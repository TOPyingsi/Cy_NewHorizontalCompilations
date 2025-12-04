import { _decorator, Component, instantiate, Label, Node, Prefab, Sprite, SpriteFrame } from 'cc';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { Panel, UIManager } from 'db://assets/Scripts/Framework/Managers/UIManager';
import { ProjectEvent, ProjectEventManager } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
import { GameManager } from 'db://assets/Scripts/GameManager';
import { HXTJB_GameEvents } from '../Common/HXTJB_GameEvents';
import { HXTJB_DataManager } from '../Manager/HXTJB_DataManager';
const { ccclass, property } = _decorator;

@ccclass('HXTJB_ShopPanel')
export class HXTJB_ShopPanel extends Component {
  @property(Node)
    btnBack: Node = null;

    @property(Label)
    lblMoneyMix: Label = null; // 金币混合标签

    @property(Label)
    lblCoinMix: Label = null; // 金币混合标签

    @property(Label)
    lblContanerPrice: Label = null; // 容器价格标签

    @property(Label)
    lblItemPrice: Label = null; // 物品价格标签

    @property(Node)
    btnBuyItem: Node = null; // 购买物品按钮

    @property(Node)
    btnBuyContainer: Node = null; // 购买容器按钮

    @property(Node)
    btnNextRound: Node = null; // 下一轮按钮

    @property(Node)
    specialCoinsContain_1: Node = null; // 特殊金币层

    @property(Node)
    specialCoinsContain_2: Node = null; // 特殊金币层

    @property(Prefab)
    specialItem: Prefab = null; // 特殊金币

    @property(SpriteFrame)
    specialIcons:SpriteFrame[]=[]

    @property(Label)
    lblMoney: Label = null; // 容器价格标签

    isAddedEvent: boolean = false;

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

        this.updateMoneyMixDisplay();
        this.updateCoinMixDisplay();
        this.updateContainerPriceDisplay();
        this.updateItemPriceDisplay();
        this.updateSpecialConter();
        this.updateSpecialCoins();
        this.updateMoneyDisplay();
    }

    
    // 更新当前金币混合显示
    updateMoneyMixDisplay() {
        if (this.lblMoneyMix) {
            this.lblMoneyMix.string =  HXTJB_DataManager.Instance.roundData[HXTJB_DataManager.Instance.currentRound].MoneyMix.toString();
        }
    }

    // 更新当前金币混合显示
    updateCoinMixDisplay() {
        if (this.lblCoinMix) {
            this.lblCoinMix.string = HXTJB_DataManager.Instance.roundData[HXTJB_DataManager.Instance.currentRound].CoinMix.toString();
        }
    }

    // 更新当前容器价格显示
    updateContainerPriceDisplay() {
        if (this.lblContanerPrice) {
            this.lblContanerPrice.string = HXTJB_DataManager.Instance.currentContainerPrice.toString();
        }
    }


    // 更新当前物品价格显示
    updateItemPriceDisplay() {
        if (this.lblItemPrice) {
            this.lblItemPrice.string = HXTJB_DataManager.Instance.itemData[1].price.toString();
        }
    }


    updateMoneyDisplay(){
        if(this.lblMoney){
            this.lblMoney.string = HXTJB_DataManager.Instance.currentMoney.toString();
        }
    }


    // 更新当前特殊金币显示
    updateSpecialCoins(){
        if(this.specialCoinsContain_1){
            // 获取所有特殊币种数据
            const specialCoins = HXTJB_DataManager.Instance.specialCoins;
            
            // 获取所有币位节点
            const coinSlots: Node[] = [];
            this.specialCoinsContain_1.children.forEach(child => {
                const coin1 = child.getChildByName('coin_1');
                const coin2 = child.getChildByName('coin_2');
                if(coin1 && coin2) {
                    coinSlots.push(coin1, coin2);
                }
            });
            
            // 重置所有币位显示
            coinSlots.forEach(slot => {
                const sprite = slot.getComponent(Sprite);
                if(sprite) sprite.spriteFrame = null;
            });
            
            // 按币种类型和数量设置对应币位
            let slotIndex = 0;
            for(const [coinType, count] of Object.entries(specialCoins)) {
                const typeNum = parseInt(coinType);
                const spriteFrame = this.specialIcons[typeNum - 1];
                
                for(let i = 0; i < count && slotIndex < coinSlots.length; i++, slotIndex++) {
                    const sprite = coinSlots[slotIndex].getComponent(Sprite);
                    if(sprite && spriteFrame) {
                        sprite.spriteFrame = spriteFrame;
                    }
                }
            }
        }
    }

    updateSpecialConter(){
        if(this.specialCoinsContain_1){
            let count = HXTJB_DataManager.Instance.currentItemCotanerCount;
            // while(this.specialCoinsContain_1.children.length ){
            while(this.specialCoinsContain_1.children.length ){
                this.specialCoinsContain_1.children.forEach((item)=>{
                    item.active =false;
                    item.setParent(this.node)
                    // item.setParent(null)
                    item.destroy();
                })
            }
                // this.specialCoinsContain_1.children.forEach((item)=>{
                //     item.active =false;
                //     item.setParent(this.node)
                //     // item.setParent(null)
                //     item.destroy();
                // })
            // }
            for(let i = 0; i < count; i++){
                let item = instantiate(this.specialItem);
                item.parent = this.specialCoinsContain_1;
            }
        }

        if(this.specialCoinsContain_2){
            let count = HXTJB_DataManager.Instance.currentItemCotanerCount;
            while(this.specialCoinsContain_2.children.length ){
                this.specialCoinsContain_2.children.forEach((item)=>{
                    item.active =false;
                    item.setParent(this.node)
                    item.destroy();
                })
            }
            
            this.specialCoinsContain_2.children.forEach((item)=>{
                item.setParent(null)
                item.destroy();
            })
            for(let i = 0; i < count; i++){
                let item = instantiate(this.specialItem);
                item.parent = this.specialCoinsContain_2;
            }
        }
    }



    
    onBtnBuyItemClick(){
        HXTJB_DataManager.Instance.buySpecialCoin(1);
    }

    onBtnBuyContainerClick(){
        HXTJB_DataManager.Instance.buyContainer();
    }

    onBtnNextRoundClick(){
        HXTJB_DataManager.Instance.setNewRound();
    }


    onBtnBackClick(){
        this.node.active = false;
        HXTJB_DataManager.Instance.isGameStart = true;
        // HXTJB_DataManager.Instance.isFail = false;
        // // this.node.active = false;
        // HXTJB_DataManager.Instance.init();
        // HXTJB_DataManager.Instance.setNewRound();
        //         ProjectEventManager.emit(ProjectEvent.返回主页按钮事件, () => {
        //             UIManager.ShowPanel(Panel.LoadingPanel, GameManager.StartScene, () => {
        //                 // LBL_DataManager.Instance.destroyInstance();
        //                 ProjectEventManager.emit(ProjectEvent.返回主页, "狼伴侣");
        //             })
        //         });
    }

    // 注册事件监听
    registerEvents() {

        EventManager.on(HXTJB_GameEvents.UPDATE_MONEY_MIX, this.updateMoneyMixDisplay, this);
        EventManager.on(HXTJB_GameEvents.UPDATE_COIN_MIX, this.updateCoinMixDisplay, this);
        EventManager.on(HXTJB_GameEvents.UPDATE_CONTAINER_PRICE, this.updateContainerPriceDisplay, this);
        EventManager.on(HXTJB_GameEvents.UPDATE_ITEM_PRICE, this.updateItemPriceDisplay, this);
        EventManager.on(HXTJB_GameEvents.UPDATE_SPECIAL_COINS, this.updateSpecialCoins, this);
        EventManager.on(HXTJB_GameEvents.UPDATE_CURRENT_ITEM_CONTAINER_COUNT, this.updateSpecialConter, this);
        EventManager.on(HXTJB_GameEvents.UPDATE_MONEY, this.updateMoneyDisplay, this);

        this.btnBack.on(Node.EventType.TOUCH_END, this.onBtnBackClick, this);
        this.btnBuyItem.on(Node.EventType.TOUCH_END, this.onBtnBuyItemClick, this);
        this.btnBuyContainer.on(Node.EventType.TOUCH_END, this.onBtnBuyContainerClick, this);
        this.btnNextRound.on(Node.EventType.TOUCH_END, this.onBtnNextRoundClick, this);
    }

    // 注销事件监听
    unregisterEvents() {
        EventManager.off(HXTJB_GameEvents.UPDATE_MONEY_MIX, this.updateMoneyMixDisplay, this);
        EventManager.off(HXTJB_GameEvents.UPDATE_COIN_MIX, this.updateCoinMixDisplay, this);
        EventManager.off(HXTJB_GameEvents.UPDATE_CONTAINER_PRICE, this.updateContainerPriceDisplay, this);
        EventManager.off(HXTJB_GameEvents.UPDATE_ITEM_PRICE, this.updateItemPriceDisplay, this);
        EventManager.off(HXTJB_GameEvents.UPDATE_SPECIAL_COINS, this.updateSpecialCoins, this);
        EventManager.off(HXTJB_GameEvents.UPDATE_CURRENT_ITEM_CONTAINER_COUNT, this.updateSpecialConter, this);
        EventManager.off(HXTJB_GameEvents.UPDATE_MONEY, this.updateMoneyDisplay, this);

        // this.btnBack.off(Node.EventType.TOUCH_END, this.onBtnBackClick, this);
        // this.btnBuyItem.off(Node.EventType.TOUCH_END, this.onBtnBuyItemClick, this);
        // this.btnBuyContainer.off(Node.EventType.TOUCH_END, this.onBtnBuyContainerClick, this);
        // this.btnBackToMain.off(Node.EventType.TOUCH_END, this.onBtnBackToMainClick, this);
        // this.btnRestart.off(Node.EventType.TOUCH_END, this.onBtnRestartClick, this);
    }

    // 注销事件监听
    onDestroy() {
        this.unregisterEvents();
        this.isAddedEvent = false;
    }

}


