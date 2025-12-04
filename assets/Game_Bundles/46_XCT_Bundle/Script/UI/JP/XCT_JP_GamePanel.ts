import { _decorator, Animation, Button, Component, director, instantiate, Label, Node, tween, v3 } from 'cc';

import { EventManager, MyEvent } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { ProjectEvent, ProjectEventManager } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
import { XCT_BasePanel, XCT_PanelAnimation } from '../../Common/XCT_BasePanel';
import { XCT_UILayer } from '../../Common/XCT_UILayer';
import { XCT_UIManager } from '../../Manager/XCT_UIManager';
import { XCT_UIPanel } from '../../Common/XCT_UIPanel';
import { XCT_Events } from '../../Common/XCT_Events';
import { XCT_JP_DialogManager } from '../../Game/JP/XCT_JP_DialogManager';
import { XCT_JP_DataManager } from '../../Manager/XCT_JP_DataManager';
import { XCT_JP_OrderManager } from '../../Game/JP/XCT_JP_OrderManager';
import { XCT_JP_CustomerManager } from '../../Game/JP/XCT_JP_CustomerManager';
import { XCT_AudioManager } from '../../Manager/XCT_AudioManager';
import { XCT_GameManager } from '../../Manager/XCT_GameManager';
import { Panel, UIManager } from 'db://assets/Scripts/Framework/Managers/UIManager';
import { GameManager } from 'db://assets/Scripts/GameManager';

const { ccclass, property } = _decorator;

@ccclass('XCT_JP_GamePanel')
export class XCT_JP_GamePanel extends XCT_BasePanel {
    protected defaultShowAnimation: XCT_PanelAnimation = XCT_PanelAnimation.SLIDE_FROM_BOTTOM;
    protected defaultHideAnimation: XCT_PanelAnimation = XCT_PanelAnimation.SLIDE_TO_TOP;
    public defaultLayer: XCT_UILayer = XCT_UILayer.Game;
    protected animationDuration: number = 0.6;


    isAddedEvent: boolean = false;

    protected start(): void {
        if (!this.isAddedEvent) {
            this.addListener();
            this.isAddedEvent = true;
        }
    }
    @property({ type: XCT_JP_CustomerManager })
    customerManager: XCT_JP_CustomerManager = null!;

    @property({ type: XCT_JP_DialogManager })
    dialogManager: XCT_JP_DialogManager = null!;

    @property({ type: XCT_JP_OrderManager })
    orderManager: XCT_JP_OrderManager = null!;

    @property({ type: Button })
    packageBtn: Button = null!; // 打包按钮

    @property(Node)
    itemBtns: Node[] = []; // 打包按钮

    @property(Node)
    packContainer: Node = null; // 打包按钮

    @property(Node)
    packBag: Node = null; // 打包按钮

    @property(Node)
    EndPanel: Node = null; // 打包按钮

    @property(Node)
    btnNext: Node = null; // 打包按钮

    @property(Node)
    btnRestart: Node = null; // 打包按钮

    @property(Node)
    btnBack: Node = null; // 打包按钮

    @property(Node)
    btnReturn: Node = null; // 打包按钮

    @property(Node)
    tableItems: Node[] = []; // 打包按钮

    @property(Node)
    monayNode: Node = null; // 打包按钮

    @property(Node)
    tutorialPanel: Node = null; // 打包按钮

    init() {
        this.customerManager.init();
        this.dialogManager.init();
        this.orderManager.init();

        this.hideTableItem();

        // this.addListener();
        this.showOpeningDialog();

        this.itemBtns.forEach((btn, index) => {
            btn.getChildByName("item").active = false;
        });

        this.packBag.active = false;

        this.EndPanel.active = false;
        this.monayNode.active = false;
        this.hideTutorial();
    }

    // private addListener() {

    // }

    // 显示开场对话
    private showOpeningDialog() {
        this.dialogManager.showOpeningDialog(() => {
            this.orderManager.startProcessing();
        });
    }

    onBtnPackClick() {
        if (XCT_JP_DataManager.Instance.isTutorial) {
            if(XCT_JP_DataManager.Instance.tutorialIndexs.includes(3) || XCT_JP_DataManager.Instance.tutorialIndexs.includes(4)) return;
            if(!XCT_JP_DataManager.Instance.tutorialIndexs.includes(1) && !XCT_JP_DataManager.Instance.tutorialIndexs.includes(2)) return;
            XCT_JP_DataManager.Instance.tutorialIndexs.push(3);
            this.hideTutorial();
        }
        XCT_JP_DataManager.Instance.isCanGetItem = false;
             XCT_AudioManager.getInstance().playSound("点击");
        this.orderManager.packageOrder();
        this.packContainer.removeAllChildren();
        this.packBag.active = true;
    }

    onItemClick(index: number) {
        if (!XCT_JP_DataManager.Instance.isCanGetItem) return;
        if (XCT_JP_DataManager.Instance.isTutorial) {
            if(XCT_JP_DataManager.Instance.tutorialIndexs.includes(3) || XCT_JP_DataManager.Instance.tutorialIndexs.includes(4)) return;
            if (this.itemBtns[index].name !== "鸡排" && this.itemBtns[index].name !== "可乐") {
                return;
            }
            if (this.itemBtns[index].name == "鸡排" && XCT_JP_DataManager.Instance.tutorialIndexs.includes(1)) {
                return;
            }
            if (this.itemBtns[index].name == "可乐" && XCT_JP_DataManager.Instance.tutorialIndexs.includes(2)) {
                return;
            }
        }

        if (XCT_JP_DataManager.Instance.currentDishes[this.itemBtns[index].name]) {
            XCT_JP_DataManager.Instance.currentDishes[this.itemBtns[index].name]++;
        }
        else {
            XCT_JP_DataManager.Instance.currentDishes[this.itemBtns[index].name] = 1;
        }

     XCT_AudioManager.getInstance().playSound("点击");
        let itemPrefab = this.itemBtns[index].getChildByName("item");
        let itemNode = instantiate(itemPrefab);
        itemNode.parent = this.packContainer;
        itemNode.active = true;
        if (XCT_JP_DataManager.Instance.isTutorial) {

            if (this.itemBtns[index].name == "鸡排") {
                let Conut_2 = 0;
                XCT_JP_DataManager.Instance.tutorialIndexs.forEach((index) => {
                    if (index == 2) Conut_2++;
                })
                if (Conut_2 < 1) {
                    this.hideTutorial();
                    this.showTutorial("2");
                    XCT_JP_DataManager.Instance.tutorialIndexs.push(1);
                }
                else {
                    XCT_JP_DataManager.Instance.tutorialIndexs.push(1);
                    this.hideTutorial();
                    this.showTutorial("3");
                }
            }
            else if (this.itemBtns[index].name == "可乐") {
                if (!XCT_JP_DataManager.Instance.tutorialIndexs.includes(1)) {
                    this.hideTutorial();
                    this.showTutorial("1");
                    XCT_JP_DataManager.Instance.tutorialIndexs.push(2);
                }
                else {
                    XCT_JP_DataManager.Instance.tutorialIndexs.push(2);
                    this.hideTutorial();
                    this.showTutorial("3");
                }
            }
        }
    }

    showPackBag() {
        this.packBag.active = true;
    }

    hidePackBag() {
        this.packBag.active = false;
    }

    showEndPanel() {
        ProjectEventManager.emit(ProjectEvent.游戏结束, "小吃摊");
        if (XCT_JP_DataManager.Instance.isFail) {
            this.EndPanel.getChildByName("Node").getChildByName("fail").active = true;
            this.EndPanel.getChildByName("Node").getChildByName("success").active = false;
        }
        else {
            this.EndPanel.getChildByName("Node").getChildByName("success").active = true;
            this.EndPanel.getChildByName("Node").getChildByName("fail").active = false;
        }

        this.EndPanel.getChildByName("Node").setScale(v3(0, 0, 0))
        tween(this.EndPanel.getChildByName("Node"))
            .to(0.2, { scale: v3(1, 1, 1) })
            .start();

        this.EndPanel.active = true;
    }
    hideEndPanel() {
        this.EndPanel.active = false;
    }

    btnNextClick() {
        XCT_AudioManager.getInstance().playSound("点击");
        XCT_JP_DataManager.Instance.currentLevel++;
        XCT_JP_DataManager.Instance.resetLevelData();
        this.hideEndPanel();
        this.dialogManager.showOpeningDialog(() => {
            this.orderManager.startProcessing();
        });
    }

    btnRestartClick() {
        ProjectEventManager.emit(ProjectEvent.游戏开始, "小吃摊");
        XCT_AudioManager.getInstance().playSound("点击");
        this.customerManager.removeAllCustomers();
        XCT_JP_DataManager.Instance.resetLevelData();
        this.hideEndPanel();
        this.dialogManager.showOpeningDialog(() => {
            this.orderManager.startProcessing();
        });
    }

    btnBackClick() {
        XCT_AudioManager.getInstance().playSound("点击");
        if(XCT_GameManager.Instance.hasStartPanel){
            XCT_JP_DataManager.Instance.resetLevelData();
            EventManager.Scene.emit(XCT_Events.hideTableItem);
            XCT_UIManager.Instance.showPanel(XCT_UIPanel.TablePanel, null, () => {
                XCT_UIManager.Instance.showPanel(XCT_UIPanel.LoadingPanel, () => {
                    XCT_UIManager.Instance.showPanel(XCT_UIPanel.StartPanel, null, () => {
                        XCT_UIManager.Instance.hidePanel(XCT_UIPanel.JP_GamePanel);
                        XCT_UIManager.Instance.hidePanel(XCT_UIPanel.TipPanel);
                        this.scheduleOnce(() => {
                            XCT_UIManager.Instance.hidePanel(XCT_UIPanel.LoadingPanel, () => {
                            ProjectEventManager.emit(ProjectEvent.游戏结束, "小吃摊");
                            });
                        }, 0.5);

                    });
                });
            });
        }
        else{
            ProjectEventManager.emit(ProjectEvent.返回主页按钮事件, () => {
                UIManager.ShowPanel(Panel.LoadingPanel, GameManager.StartScene, () => {
                    ProjectEventManager.emit(ProjectEvent.返回主页, "小吃摊");
                })
            });
        }

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
    }

    showMoney() {
        this.monayNode.active = true;
    }
    hideMoney() {
        this.monayNode.active = false;
    }

    showTutorial(idx: string) {
        this.tutorialPanel.children.forEach((node) => {
            node.active = false;
            this.tutorialPanel.getChildByName(idx).getComponent(Animation).stop();
        })
        this.tutorialPanel.getChildByName(idx).active = true;
        this.tutorialPanel.getChildByName(idx).getComponent(Animation).play();
    }
    hideTutorial() {
        this.tutorialPanel.children.forEach((node) => {
            node.getComponent(Animation).stop();
            node.active = false;
        })
    }

    // 注册事件监听
    addListener() {
        EventManager.on(XCT_Events.showTableItem, this.onShowTableItem, this);
        EventManager.on(XCT_Events.hideTableItem, this.hideTableItem, this);

        EventManager.on(XCT_Events.JP_Show_PackBag, this.showPackBag, this);
        EventManager.on(XCT_Events.JP_Hide_PackBag, this.hidePackBag, this);

        EventManager.on(XCT_Events.JP_Show_EndPanel, this.showEndPanel, this);
        EventManager.on(XCT_Events.JP_Hide_EndPanel, this.hideEndPanel, this);

        EventManager.on(XCT_Events.JP_Show_Money, this.showMoney, this);
        EventManager.on(XCT_Events.JP_Hide_Money, this.hideMoney, this);

        EventManager.on(XCT_Events.JP_ShowTutorial, this.showTutorial, this);
        EventManager.on(XCT_Events.JP_HideTutorial, this.hideTutorial, this);

        this.packageBtn.node.on(Button.EventType.CLICK, this.onBtnPackClick, this);

        this.itemBtns.forEach((btn, index) => {
            btn.on("click", () => {
                this.onItemClick(index);
            }, this);
        });

        this.btnNext.on("click", this.btnNextClick, this);
        this.btnRestart.on("click", this.btnRestartClick, this);
        this.btnBack.on("click", this.btnBackClick, this);
        this.btnReturn.on("click", this.btnBackClick, this);
    }

    // 注销事件监听
    removeListener() {
        EventManager.off(XCT_Events.showTableItem, this.onShowTableItem, this);
        EventManager.off(XCT_Events.hideTableItem, this.hideTableItem, this);

        EventManager.off(XCT_Events.JP_Show_PackBag, this.showPackBag, this);
        EventManager.off(XCT_Events.JP_Hide_PackBag, this.hidePackBag, this);

        EventManager.off(XCT_Events.JP_Show_EndPanel, this.showEndPanel, this);
        EventManager.off(XCT_Events.JP_Hide_EndPanel, this.hideEndPanel, this);

        EventManager.off(XCT_Events.JP_Show_Money, this.showMoney, this);
        EventManager.off(XCT_Events.JP_Hide_Money, this.hideMoney, this);


    }

    // 注销事件监听
    onDestroy() {
        this.removeListener();
        this.isAddedEvent = false;
    }
}
