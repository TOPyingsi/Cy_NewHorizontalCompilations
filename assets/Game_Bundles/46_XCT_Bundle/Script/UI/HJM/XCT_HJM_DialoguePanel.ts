import { _decorator, Animation, Button, Component, director, instantiate, Label, Node, Tween, tween, UIOpacity, v3, Vec3 } from 'cc';

import { EventManager, MyEvent } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { ProjectEventManager } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
import { XCT_BasePanel, XCT_PanelAnimation } from '../../Common/XCT_BasePanel';
import { XCT_UILayer } from '../../Common/XCT_UILayer';
import { XCT_UIManager } from '../../Manager/XCT_UIManager';
import { XCT_UIPanel } from '../../Common/XCT_UIPanel';
import { XCT_Events } from '../../Common/XCT_Events';
import { XCT_HJM_DataManager, } from '../../Manager/XCT_HJM_DataManager';
import { XCT_AudioManager } from '../../Manager/XCT_AudioManager';

const { ccclass, property } = _decorator;

@ccclass('XCT_HJM_DialoguePanel')
export class XCT_HJM_DialoguePanel extends XCT_BasePanel {
    protected defaultShowAnimation: XCT_PanelAnimation = XCT_PanelAnimation.SLIDE_FROM_TOP;
    protected defaultHideAnimation: XCT_PanelAnimation = XCT_PanelAnimation.SLIDE_TO_TOP;
    public defaultLayer: XCT_UILayer = XCT_UILayer.Dialog;
    protected animationDuration: number = 0.6;

    @property(Node)
    tableItems: Node[] = [];

    @property(Node)
    moneyItem: Node = null;

    @property(Node)
    moneyContainer: Node = null;

    @property(Node)
    btnTakeout: Node = null;

    @property(Node)
    dishNode: Node = null;

    @property(Node)
    dishPos1: Node = null;

    @property(Node)
    dishPos2: Node = null;

    @property(Node)
    btnCat: Node = null;
    
    @property(Node)
    dargTurtrialAnim: Node = null;

    isCatClicked: boolean = false;

    
    needShowDish: boolean = false;
    // @property(Node)
    // btnHJM: Node = null;

    // @property(Node)
    // btnHJM: Node = null;

    // @property(Node)
    // btnJP: Node = null;

    isAddedEvent: boolean = false;

    takeoutTween: Tween<Node> = null;

    cb:Function = null;

    protected onLoad(): void {
        if (!this.isAddedEvent) {
            this.addListener();
            this.isAddedEvent = true;
        }
    }


    onShowComplete(){
        this.cb && this.cb();
        this.cb = null;
    }


    init(isNeedShowTable: boolean = true) {
        this.dishNode.active = this.needShowDish;
        this.needShowDish = false;

        this.dargTurtrialAnim.active = false;

        if (isNeedShowTable) {
            this.onShowTableItem();
            // this.showDish();
        } else {
            this.hideTableItem();
        }

        this.btnTakeout.getChildByName("nodeOrderCome").active = false;
        this.btnTakeout.getChildByName("nodeVideo").active = false;
        if (XCT_HJM_DataManager.Instance.needShowTakeoutCome) {
            this.showTakeoutCom();
        }


        this.isCatClicked = false;

        XCT_HJM_DataManager.Instance.isCatDriveAway = false;
        if (XCT_HJM_DataManager.Instance.playerData.currentDay == 1 || XCT_HJM_DataManager.Instance.playerData.isAdoptedCat) {
            this.btnCat.active = false;
        }
        else {
            this.btnCat.active = true;
        }
        this.btnCat.getChildByName("dialogue2").active = false;
    }

    hideTableItem() {
        this.tableItems.forEach((item) => {
            item.active = false;
        });
    }


    onShowTableItem() {
        this.tableItems.forEach((item) => {
            item.active = true;
        });
        this.btnTakeout.active = XCT_HJM_DataManager.Instance.playerData.isTakeOutProjectSet;
        this.btnTakeout.getChildByName("nodeVideo").active = !XCT_HJM_DataManager.Instance.playerData.isTakeOutProjectOpen
    }


    onShowAddTip() {
        this.moneyContainer.removeAllChildren();

        const item = instantiate(this.moneyItem);
        item.parent = this.moneyContainer;
        item.setPosition(v3(0, 0, 0));
        item.getComponentInChildren(Label).string = "小费+" + XCT_HJM_DataManager.Instance.currentSellingAddTip;
        // 设置初始位置和透明度
        item.setPosition(0, -200);
        item.getComponent(UIOpacity).opacity = 255;
        item.active = true;

        // 动画序列：淡入、停留、淡出
        tween(item)
            .to(1.5, { position: new Vec3(0, 200, 0) }, { easing: 'sineIn' })
            .parallel(
                tween(item.getComponent(UIOpacity))
                    .to(1.5, { opacity: 0 })
            )
            .call(() => {
                item.destroy();
            })
            .start();
    }




    onClickTakeout() {
        XCT_AudioManager.getInstance().playSound("点击");
        if (XCT_HJM_DataManager.Instance.playerData.isTakeOutProjectOpen) {
            if (XCT_HJM_DataManager.Instance.isEndingDialog) {
                EventManager.Scene.emit(XCT_Events.showTip, "请先完成当前订单");
                return;
            }
            if (this.takeoutTween) this.takeoutTween.stop();
            this.btnTakeout.getChildByName("nodeOrderCome").active = false;
            XCT_UIManager.Instance.showPanel(XCT_UIPanel.HJM_TakeoutPanel);
        }
        else {
            XCT_UIManager.Instance.showPanel(XCT_UIPanel.HJM_TipPanel, null, () => {
                EventManager.Scene.emit(XCT_Events.HJM_ShowTip_OpenTakeout);
            })
        }

    }

    showTakeoutCom() {
        if (XCT_HJM_DataManager.Instance.playerData.isTakeOutProjectOpen) {
            if (XCT_HJM_DataManager.Instance.isShowingTakeoutPanel) return;
            this.btnTakeout.getChildByName("nodeOrderCome").active = true;
            this.takeoutTween = tween(this.btnTakeout.getChildByName("nodeOrderCome"))
                .to(0.3, { scale: new Vec3(1.2, 1.2, 1.2) })
                .to(0.3, { scale: new Vec3(0.9, 0.9, 0.9) })
                .union()
                .repeatForever()
                .start();
        }
        else {
            this.btnTakeout.getChildByName("nodeVideo").active = true;
        }
    }

    
    hideTakeoutCom() {
        this.btnTakeout.getChildByName("nodeOrderCome").active = false;
    }

    takeoutOpen() {
        this.btnTakeout.getChildByName("nodeVideo").active = false;
    }

    // showDish() {
    //     this.dishNode.active = true;
    //     this.dishNode.setWorldPosition(v3(this.dishPos1.worldPosition.x, this.dishPos1.worldPosition.y - 300, this.dishPos1.worldPosition.z));
    //     tween(this.dishNode)
    //         .to(0.3, { worldPosition: this.dishPos1.worldPosition })
    //         .call(() => {
    //             if (!XCT_HJM_DataManager.Instance.isTakeout) {
    //                 this.dishNode.active = false;
    //             }
    //         })
    //         .start();
    // }

    // takeDish() {
    //     this.dishNode.active = true;
    //     this.dishNode.setWorldPosition(v3(this.dishPos1.worldPosition.x, this.dishPos1.worldPosition.y, this.dishPos1.worldPosition.z));
    //     tween(this.dishNode)
    //         .to(0.3, { worldPosition: this.dishPos2.worldPosition })
    //         .call(() => {
    //             this.dishNode.active = false;
    //         })
    //         .start();
    // }



    onCatClick() {
        XCT_AudioManager.getInstance().playSound("猫");
        this.isCatClicked = !this.isCatClicked;
        let dialogue2 = this.btnCat.getChildByName("dialogue2")
        let btnDriveAway = dialogue2.getChildByName("btnDriveAway")
        let btnAdopt = dialogue2.getChildByName("btnAdopt")
        btnDriveAway.active = true;
        btnAdopt.active = true;
        if (this.isCatClicked) {
            dialogue2.active = true;
            btnDriveAway.off("click");
            btnDriveAway.on("click", this.onBtnDriveAwayClick, this)
            btnAdopt.off("click");
            btnAdopt.on("click", this.onBtnAdoptClick, this)
        }
        else {
            dialogue2.active = false;
            btnDriveAway.off("click");
            btnAdopt.off("click");
        }
    }

    onBtnDriveAwayClick() {
        XCT_HJM_DataManager.Instance.isCatDriveAway = true;
        let dialogue2 = this.btnCat.getChildByName("dialogue2")
        dialogue2.getChildByName("heart").getChildByName("heart_1").active = false;
        dialogue2.getChildByName("heart").getChildByName("heart_2").active = true;
        dialogue2.getChildByName("btnDriveAway").active = false;
        dialogue2.getChildByName("btnAdopt").active = false;

        this.scheduleOnce(() => {
            this.btnCat.active = false;
        }, 1)
    }

    onBtnAdoptClick() {
        XCT_HJM_DataManager.Instance.playerData.isAdoptedCat = true;
        this.btnCat.active = false;
    }


    
        showDishNode() {
            this.cb = ()=>{
                this.needShowDish = true;
                this.dishNode.active = true;
                this.dishNode.setWorldPosition(v3(this.dishPos1.worldPosition.x, this.dishPos1.worldPosition.y - 300, this.dishPos1.worldPosition.z));
                tween(this.dishNode)
                    .to(0.5, { worldPosition: this.dishPos1.worldPosition })
                    .call(() => {
                        if(XCT_HJM_DataManager.Instance.isNeedShowDragTutorial){
                            this.dargTurtrialAnim.active = true;
                            this.dargTurtrialAnim.getComponent(Animation).play();
                        }
                    })
                    .start();
            }
        }
    
        hideDishNode() {
            this.dishNode.active = false;
        }
    
    
        dishDragEnd() {
            if(XCT_HJM_DataManager.Instance.isNeedShowDragTutorial){
                this.dargTurtrialAnim.getComponent(Animation).stop();
                this.dargTurtrialAnim.active = false;
                XCT_HJM_DataManager.Instance.isNeedShowDragTutorial = false;
            }
            if (XCT_HJM_DataManager.Instance.isTakeout) {
    
            }
            else {
                EventManager.Scene.emit(XCT_Events.HJM_Continue_Customer_EndDialog);
            }
    
        }

        showBowl(bowlNode:Node) {
            bowlNode.setParent(this.dishNode);
            bowlNode.setPosition(v3(0, 0, 0));
            bowlNode.setScale(v3(0.7,0.7,1));
            bowlNode.active = true;
        }
    

    // 注册事件监听
    addListener() {
        EventManager.on(XCT_Events.showTableItem, this.onShowTableItem, this);
        EventManager.on(XCT_Events.hideTableItem, this.hideTableItem, this);

        EventManager.on(XCT_Events.HJM_Show_Add_Tip, this.onShowAddTip, this);

        // EventManager.on(XCT_Events.HJM_Show_Dish, this.showDish, this);
        // EventManager.on(XCT_Events.HJM_Take_Dish, this.takeDish, this);

        EventManager.on(XCT_Events.HJM_Takeout_Open, this.takeoutOpen, this);


        EventManager.on(XCT_Events.HJM_New_Takeout_Order, this.showTakeoutCom, this);
        EventManager.on(XCT_Events.HJM_Hide_New_Takeout_Order, this.hideTakeoutCom, this);

        
        EventManager.on(XCT_Events.HJM_Show_Dish_Node, this.showDishNode, this);
        EventManager.on(XCT_Events.Dish_Drag_End, this.dishDragEnd, this);

        EventManager.on(XCT_Events.HJM_Show_Bowl, this.showBowl, this);


        this.btnTakeout.on(Button.EventType.CLICK, this.onClickTakeout, this);
        this.btnCat.on(Button.EventType.CLICK, this.onCatClick, this);

    }

    // 注销事件监听
    removeListener() {
        EventManager.off(XCT_Events.showTableItem, this.onShowTableItem, this);
        EventManager.off(XCT_Events.hideTableItem, this.hideTableItem, this);
        EventManager.off(XCT_Events.HJM_Show_Add_Tip, this.onShowAddTip, this);
        // EventManager.off(XCT_Events.HJM_Show_Dish, this.showDish, this);
        // EventManager.off(XCT_Events.HJM_Take_Dish, this.takeDish, this);
        EventManager.off(XCT_Events.HJM_New_Takeout_Order, this.showTakeoutCom, this);
        EventManager.off(XCT_Events.HJM_Hide_New_Takeout_Order, this.hideTakeoutCom, this);
        EventManager.off(XCT_Events.HJM_Takeout_Open, this.takeoutOpen, this);

        EventManager.off(XCT_Events.HJM_Show_Dish_Node, this.showDishNode, this);
        EventManager.off(XCT_Events.Dish_Drag_End, this.dishDragEnd, this);
        EventManager.off(XCT_Events.HJM_Show_Bowl, this.showBowl, this);


    }

    // 注销事件监听
    onDestroy() {
        this.removeListener();
        this.isAddedEvent = false;
    }
}








