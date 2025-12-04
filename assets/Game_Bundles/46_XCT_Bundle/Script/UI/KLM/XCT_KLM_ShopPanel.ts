import { _decorator, Button, Color, Component, director, Graphics, instantiate, Label, Mask, Node, Sprite, SpriteFrame, tween, v3 } from 'cc';

import { EventManager, MyEvent } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { ProjectEvent, ProjectEventManager } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
import { XCT_BasePanel, XCT_PanelAnimation } from '../../Common/XCT_BasePanel';
import { XCT_UILayer } from '../../Common/XCT_UILayer';
import { XCT_UIManager } from '../../Manager/XCT_UIManager';
import { XCT_UIPanel } from '../../Common/XCT_UIPanel';
import { XCT_Events } from '../../Common/XCT_Events';
import { XCT_KLM_DataManager } from '../../Manager/XCT_KLM_DataManager';
import { XCT_AudioManager } from '../../Manager/XCT_AudioManager';

const { ccclass, property } = _decorator;

@ccclass('XCT_KLM_ShopPanel')
export class XCT_KLM_ShopPanel extends XCT_BasePanel {
    protected defaultShowAnimation: XCT_PanelAnimation = XCT_PanelAnimation.NONE;
    protected defaultHideAnimation: XCT_PanelAnimation = XCT_PanelAnimation.NONE;
    public defaultLayer: XCT_UILayer = XCT_UILayer.Pop2;
    protected animationDuration: number = 0.6;



    @property(Node)
    shopItemContainer: Node = null;

    @property(SpriteFrame)
    ingredientSpes: SpriteFrame[] = [];

    @property(Node)
    btnCheckoutPanel: Node = null;

    @property(Node)
    btnNextDay: Node = null;


    @property(Node)
    btnReturn: Node = null;

    private currentData: Map<string, number> = new Map;


    isAddedEvent: boolean = false;

    protected start(): void {
        if (!this.isAddedEvent) {
            this.addListener();
            this.isAddedEvent = true;
        }
    }


    init(isCooking: boolean = false) {
         ProjectEventManager.emit(ProjectEvent.弹出窗口, "小吃摊");
                XCT_KLM_DataManager.Instance.isShowingShopPanel = true;
        EventManager.Scene.emit(XCT_Events.Game_Pause);
        this.initShopItem();
        if (isCooking) {
            this.btnCheckoutPanel.active = false;
            this.btnNextDay.active = false;
            this.btnReturn.active = true;
        } else {
            this.btnCheckoutPanel.active = true;
            this.btnNextDay.active = true;
            this.btnReturn.active = false;
        }
    }


    initShopItem() {
        this.shopItemContainer.children.forEach((item, index) => {
            if (index !== 0) {
                item.destroy();
            } else {
                item.active = false;
            }
        })
        XCT_KLM_DataManager.Instance.ingredientsConfig.forEach((shopConfig, index) => {
            let ingredientName = shopConfig.name;
            const hasIngredient = XCT_KLM_DataManager.Instance.playerData.stock[ingredientName] !== undefined && XCT_KLM_DataManager.Instance.playerData.stock[ingredientName] > 0; // 假设库存检查结果
            if (!hasIngredient) {
                let shopPrefab = this.shopItemContainer.children[0];
                let shopItem = instantiate(shopPrefab);
                shopItem.parent = this.shopItemContainer;
                shopItem.name = ingredientName;
                shopItem.getChildByName('icon').getComponent(Sprite).spriteFrame = this.ingredientSpes[index];
                if (ingredientName === "土豆面" || ingredientName === "白面团") {
                    shopItem.getChildByName('icon').setScale(v3(0.65, 0.65, 0.65));
                }
                if (ingredientName === "油条") {
                    shopItem.getChildByName('icon').setScale(v3(0.9, 0.9, 0.9));
                }
                shopItem.getChildByName('lblName').getComponent(Label).string = ingredientName;
                shopItem.getChildByName('btnBuy').getChildByName('lblPrice').getComponent(Label).string = shopConfig.price.toString();
                let color = XCT_KLM_DataManager.Instance.playerData.money >= shopConfig.price ? Color.WHITE : Color.RED;
                shopItem.getChildByName('btnBuy').getChildByName('lblPrice').getComponent(Label).color = color;
                this.currentData.set(ingredientName, shopConfig.price);
                shopItem.active = true;
                shopItem.getChildByName('btnBuy').on(Button.EventType.CLICK, () => {
                    this.onClickBuy(ingredientName);
                }, this);
            }

        })
    }


    updateShopItem() {
        this.shopItemContainer.children.forEach((shopItem) => {
            let color = XCT_KLM_DataManager.Instance.playerData.money >= this.currentData.get(shopItem.name) ? Color.WHITE : Color.RED;
            shopItem.getChildByName('btnBuy').getChildByName('lblPrice').getComponent(Label).color = color;
        })
    }




    onClickBuy(ingredientName: string) {

        if (XCT_KLM_DataManager.Instance.playerData.money < XCT_KLM_DataManager.Instance.ingredientsConfigObject[ingredientName].price) {
            XCT_UIManager.Instance.showPanel(XCT_UIPanel.KLM_TipPanel, null, () => {
                EventManager.Scene.emit(XCT_Events.KLM_ShowTip_NoMoney);
            })

            return;
        }
        // 进货
        if (XCT_KLM_DataManager.Instance.playerData.stock[ingredientName]) {
            XCT_KLM_DataManager.Instance.playerData.stock[ingredientName]++;
        } else {
            XCT_KLM_DataManager.Instance.playerData.stock[ingredientName] = 1;
        }
        XCT_KLM_DataManager.Instance.playerData.money -= XCT_KLM_DataManager.Instance.ingredientsConfigObject[ingredientName].price;
        EventManager.Scene.emit(XCT_Events.KLM_Update_Money);
        EventManager.Scene.emit(XCT_Events.KLM_Update_Ingredient);
        this.shopItemContainer.getChildByName(ingredientName).destroy();
        this.currentData.delete(ingredientName);

    }


    onClickCheckout() {
        XCT_AudioManager.getInstance().playSound("点击");
        XCT_UIManager.Instance.showPanel(XCT_UIPanel.KLM_CheckoutPanel);
        // XCT_UIManager.Instance.hidePanel(XCT_UIPanel.KLM_ShopPanel);
    }

    onClickNextDay() {
        XCT_AudioManager.getInstance().playSound("点击");
        XCT_UIManager.Instance.showPanel(XCT_UIPanel.PassPanel, {
            tipConfig: XCT_KLM_DataManager.Instance.tipConfig,
            currentDay: XCT_KLM_DataManager.Instance.playerData.currentDay
            , passDayCb: () => {
                XCT_KLM_DataManager.Instance.passDay();
            }
        }, () => {
            XCT_UIManager.Instance.hidePanel(XCT_UIPanel.KLM_ShopPanel);
            XCT_UIManager.Instance.hidePanel(XCT_UIPanel.KLM_GameUI);
        });

        XCT_KLM_DataManager.Instance.isHadShowShop = false;
    }

    onClickReturn() {
        XCT_AudioManager.getInstance().playSound("点击");
        EventManager.Scene.emit(XCT_Events.Show_TutorialPanel);
        XCT_UIManager.Instance.hidePanel(XCT_UIPanel.KLM_ShopPanel);
                EventManager.Scene.emit(XCT_Events.Game_Resume);
        XCT_KLM_DataManager.Instance.isShowingShopPanel = false;
    }



    // 注册事件监听
    addListener() {
        EventManager.on(XCT_Events.KLM_Update_Money, this.updateShopItem, this)

        this.btnCheckoutPanel.on(Button.EventType.CLICK, this.onClickCheckout, this);
        this.btnNextDay.on(Button.EventType.CLICK, this.onClickNextDay, this);
        this.btnReturn.on(Button.EventType.CLICK, this.onClickReturn, this);

    }

    // 注销事件监听
    removeListener() {
        EventManager.off(XCT_Events.KLM_Update_Money, this.updateShopItem, this)

    }

    // 注销事件监听
    onDestroy() {
        this.removeListener();
        this.isAddedEvent = false;
    }
}








