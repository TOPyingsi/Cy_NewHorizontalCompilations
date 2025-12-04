import { _decorator, Component, Button, v3 } from 'cc';
import { XCT_JP_CustomerManager } from './XCT_JP_CustomerManager';
import { XCT_JP_DialogManager } from './XCT_JP_DialogManager';
import { XCT_JP_DataManager } from '../../Manager/XCT_JP_DataManager';
import { XCT_JP_Customer } from './XCT_JP_Customer';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { XCT_Events } from '../../Common/XCT_Events';
import { XCT_AudioManager } from '../../Manager/XCT_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('XCT_JP_OrderManager')
export class XCT_JP_OrderManager extends Component {
    @property({ type: XCT_JP_CustomerManager })
    customerManager: XCT_JP_CustomerManager = null!;

    @property({ type: XCT_JP_DialogManager })
    dialogManager: XCT_JP_DialogManager = null!;


    // @property({ type: Button })
    // remindBtn: Button = null!; // 提醒按钮

    // private currentCustomer: XCT_JP_Customer | null = null;

    init() {
        // this.remindBtn.node.on(Button.EventType.CLICK, this.onRemindClick, this);
        // this.remindBtn.node.active = false;
    }

    // 开始处理订单
    startProcessing() {
        this.createNextOrder();
    }

    // 创建下一个订单
    createNextOrder() {
        const orderId = XCT_JP_DataManager.Instance.getNextOrderId();
        if (!orderId) {
            this.handleLevelPass();
            return;
        }


        const customer = this.customerManager.createCustomer(orderId);
        if (customer) {
            customer.node.getChildByName("remindBtn").on(Button.EventType.CLICK, this.onRemindClick, this);
            customer.node.getChildByName("remindBtn").active = false;
            XCT_JP_DataManager.Instance.currentCustomer = customer;
            // 让顾客走到点餐位置
            let path = [...this.customerManager.dialogPath1.children];
            customer.walk(path, () => {
                XCT_JP_DataManager.Instance.isCanGetItem = true;
                const order = XCT_JP_DataManager.Instance.getOrderConfig(orderId);
                this.dialogManager.showDialog(order.content, customer.personId, true);
                if (XCT_JP_DataManager.Instance.isTutorial) {
                    EventManager.Scene.emit(XCT_Events.JP_HideTutorial);
                    if(!XCT_JP_DataManager.Instance.tutorialIndexs.includes(1)){
                        EventManager.Scene.emit(XCT_Events.JP_ShowTutorial, "1");
                    }
                    else if(!XCT_JP_DataManager.Instance.tutorialIndexs.includes(2)){
                        EventManager.Scene.emit(XCT_Events.JP_ShowTutorial, "2");
                    }
                    else if(!XCT_JP_DataManager.Instance.tutorialIndexs.includes(3)){
                        EventManager.Scene.emit(XCT_Events.JP_ShowTutorial, "3");
                    }
                }

                // // 特殊订单显示提醒按钮（少给钱）
                // XCT_JP_DataManager.Instance.currentRemindType = 0;
                // this.remindBtn.node.active = true;
                customer.node.getChildByName("remindBtn").active = false;
            });
        }
    }

    // 打包处理（预留方法）
    packageOrder() {
        if (!XCT_JP_DataManager.Instance.currentCustomer) return;

        // this.remindBtn.node.active = false;
        XCT_JP_DataManager.Instance.currentCustomer.node.getChildByName("remindBtn").active = false;
        const order = XCT_JP_DataManager.Instance.getOrderConfig(XCT_JP_DataManager.Instance.currentCustomer.orderId);

        this.dialogManager.showDialog(
            XCT_JP_DataManager.Instance.dialogConfig.host[1],
            0,
            true
        );

        this.scheduleOnce(() => {
            if (XCT_JP_DataManager.Instance.isTutorial) {
                EventManager.Scene.emit(XCT_Events.JP_ShowTutorial, "4");

            }
            //oooooooooooooooooooooooooo
            //顾客收货
            EventManager.Scene.emit(XCT_Events.JP_Hide_PackBag);

            XCT_JP_DataManager.Instance.checkOrder();
            if (Object.keys(XCT_JP_DataManager.Instance.extraDishes).length === 0 && Object.keys(XCT_JP_DataManager.Instance.lessDishes).length === 0) {
                XCT_JP_DataManager.Instance.lessDishes = {};
                XCT_JP_DataManager.Instance.extraDishes = {};
                XCT_JP_DataManager.Instance.currentDishes = {};

                this.dialogManager.showDialog(
                    XCT_JP_DataManager.Instance.dialogConfig.customer[order.personId][0],
                    order.personId,
                    true
                );

                //显示提醒按钮（不给钱）
                XCT_JP_DataManager.Instance.currentRemindType = 1;
                // this.remindBtn.node.active = true;
                XCT_JP_DataManager.Instance.currentCustomer.node.getChildByName("remindBtn").active = true;

                XCT_JP_DataManager.Instance.currentCustomer.setPacked();
                if (order.specialType === 1) {
                    XCT_JP_DataManager.Instance.isRemind = false;
                    EventManager.Scene.emit(XCT_Events.JP_Hide_Money);
                }
                else {
                    XCT_JP_DataManager.Instance.isRemind = true;
                    EventManager.Scene.emit(XCT_Events.JP_Show_Money);
                }

                if (XCT_JP_DataManager.Instance.isTutorial) {
                    return;
                }
                // 2秒后顾客离开并创建新订单
                this.scheduleOnce(() => {
                    EventManager.Scene.emit(XCT_Events.JP_Hide_Money);

                    //隐藏提醒按钮
                    // this.remindBtn.node.active = false;
                    XCT_JP_DataManager.Instance.currentCustomer.node.getChildByName("remindBtn").active = false;

                    if (XCT_JP_DataManager.Instance.isRemind) {
                        if (XCT_JP_DataManager.Instance.isWrongRemind) {

                        }
                        else {
                            // 处理完成后继续
                            this.dialogManager.hideAllDialogs();
                            XCT_JP_DataManager.Instance.currentCustomer.node.setSiblingIndex(0);

                            XCT_JP_DataManager.Instance.lastCustomer = XCT_JP_DataManager.Instance.currentCustomer;
                            this.customerManager.removeCustomer(XCT_JP_DataManager.Instance.currentCustomer!);
                            this.createNextOrder();
                            //离开
                            let path = [...this.customerManager.destoryPath.children, ...[this.customerManager.destroyPos]];
                            XCT_JP_DataManager.Instance.isRemind = false;
                            XCT_JP_DataManager.Instance.lastCustomer?.walk(path, () => {
                                // EventManager.Scene.emit(XCT_Events.JP_Hide_Money);
                                XCT_JP_DataManager.Instance.lastCustomer.hide();
                                XCT_JP_DataManager.Instance.lastCustomer.destroy();
                                XCT_JP_DataManager.Instance.lastCustomer = null;
                            }, 1000);
                        }
                    }
                    else {
                        // 处理完成后继续
                        this.dialogManager.hideAllDialogs();
                        XCT_JP_DataManager.Instance.currentCustomer.node.setSiblingIndex(0);

                        //离开
                        let path = [...this.customerManager.destoryPath.children, ...[this.customerManager.destroyPos]];
                        XCT_JP_DataManager.Instance.isRemind = false;
                        XCT_JP_DataManager.Instance.currentCustomer?.walk(path, () => {
                            this.dialogManager.showDialog(
                                XCT_JP_DataManager.Instance.dialogConfig.narrator[1],
                                -1,
                                true
                            );
                            this.scheduleOnce(() => {
                                XCT_JP_DataManager.Instance.isFail = true;
                                EventManager.Scene.emit(XCT_Events.JP_Show_EndPanel);
                            }, 1.5)

                        }, 1000);
                    }

                }, 2);
            }
            else {
                let content: string = '';
                // const dialogsTip = XCT_JP_DataManager.Instance.dialogConfig.narrator;
                const personContents = XCT_JP_DataManager.Instance.dialogConfig.customer[order.personId];
                if (Object.keys(XCT_JP_DataManager.Instance.lessDishes).length > 0) {
                    content = "" + personContents[1];
                    //将content中的‘${goods}’替换为少的菜品
                    content = content.replace('${goods}', Object.keys(XCT_JP_DataManager.Instance.lessDishes).join('、'));
                }
                // else if(Object.keys(XCT_JP_DataManager.Instance.extraDishes).length > 0){
                //     content = ""+dialogsTip[6];
                //     //将content中的‘${goods}’替换为多的菜品
                //     content = content.replace('${goods}', Object.keys(XCT_JP_DataManager.Instance.extraDishes).join('、'));
                // }

                this.dialogManager.showDialog(
                    content,
                    order.personId,
                    true
                );
                XCT_JP_DataManager.Instance.currentCustomer?.setAngry();
                // this.dialogManager.showDialog(content, -1, true);
                XCT_JP_DataManager.Instance.lessDishes = {};
                XCT_JP_DataManager.Instance.extraDishes = {};
                XCT_JP_DataManager.Instance.currentDishes = {};
                //游戏失败
                this.scheduleOnce(() => {
                    XCT_JP_DataManager.Instance.isFail = true;
                    EventManager.Scene.emit(XCT_Events.JP_Show_EndPanel);
                }, 2)
            }

        }, 1.5)

    }

    // 提醒按钮点击,少给钱点击
    onRemindClick() {
        if (!XCT_JP_DataManager.Instance.currentCustomer) return;
        XCT_AudioManager.getInstance().playSound("点击");
        if (XCT_JP_DataManager.Instance.isTutorial) {
            EventManager.Scene.emit(XCT_Events.JP_HideTutorial);
            XCT_JP_DataManager.Instance.isTutorial = false;
        }

        const order = XCT_JP_DataManager.Instance.getOrderConfig(XCT_JP_DataManager.Instance.currentCustomer.orderId);
        const dialogs = XCT_JP_DataManager.Instance.dialogConfig.customer[order.personId];
        const dialogsTip = XCT_JP_DataManager.Instance.dialogConfig.narrator;

        let content: string = '';
        if (XCT_JP_DataManager.Instance.currentRemindType === 0) {
            // if(order.specialType === 2){
            //     content =  dialogs[1];
            //     this.dialogManager.showDialog(content, order.personId, true);
            // }
            // else{
            //     content = dialogsTip[0];
            //     this.dialogManager.showDialog(content, -1, true);
            //     this.scheduleOnce(()=>{
            //         XCT_JP_DataManager.Instance.isFail = true;
            //         EventManager.Scene.emit(XCT_Events.JP_Show_EndPanel);
            //     },2)
            // }
        }
        else {
            if (order.specialType === 1) {
                XCT_JP_DataManager.Instance.isRemind = true;
                EventManager.Scene.emit(XCT_Events.JP_Show_Money);
                content = dialogs[2];
                this.dialogManager.showDialog(content, order.personId, true);

                // 2秒后顾客离开并创建新订单
                this.scheduleOnce(() => {
                    if (!XCT_JP_DataManager.Instance.isRemind) return;
                    EventManager.Scene.emit(XCT_Events.JP_Hide_Money);
                    //隐藏提醒按钮
                    // this.remindBtn.node.active = false;
                    XCT_JP_DataManager.Instance.currentCustomer.node.getChildByName("remindBtn").active = false;

                    // 处理完成后继续
                    this.dialogManager.hideAllDialogs();
                    XCT_JP_DataManager.Instance.currentCustomer.node.setSiblingIndex(0);

                    XCT_JP_DataManager.Instance.lastCustomer = XCT_JP_DataManager.Instance.currentCustomer;
                    this.customerManager.removeCustomer(XCT_JP_DataManager.Instance.currentCustomer!);
                    this.createNextOrder();
                    XCT_JP_DataManager.Instance.isRemind = false;

                    //离开
                    let path = [...this.customerManager.destoryPath.children, ...[this.customerManager.destroyPos]];
                    XCT_JP_DataManager.Instance.lastCustomer?.walk(path, () => {
                        // if(XCT_JP_DataManager.Instance.isRemind){
                        // EventManager.Scene.emit(XCT_Events.JP_Hide_Money);
                        XCT_JP_DataManager.Instance.lastCustomer.hide();
                        XCT_JP_DataManager.Instance.lastCustomer.destroy();
                        XCT_JP_DataManager.Instance.lastCustomer = null;
                        // XCT_JP_DataManager.Instance.isRemind = false;
                        // }
                    }, 1000);
                }, 2);
            }
            else {
                XCT_JP_DataManager.Instance.isWrongRemind = true;
                // content = dialogsTip[2];
                // this.dialogManager.showDialog(content, -1, true);
                content = dialogs[3];
                this.dialogManager.showDialog(content, order.personId, true);
                XCT_JP_DataManager.Instance.currentCustomer?.setAngry();
                this.scheduleOnce(() => {
                    XCT_JP_DataManager.Instance.isFail = true;
                    EventManager.Scene.emit(XCT_Events.JP_Show_EndPanel);
                }, 2)
            }
        }

        // this.remindBtn.node.active = false;
        XCT_JP_DataManager.Instance.currentCustomer.node.getChildByName("remindBtn").active = false;

        // // 处理完成后继续
        // this.scheduleOnce(() => {
        //     this.packageOrder();
        // }, 1.5);
    }

    // 关卡通过处理
    handleLevelPass() {
        this.dialogManager.showDialog(
            XCT_JP_DataManager.Instance.dialogConfig.host[1],
            0,
            true
        );
        this.scheduleOnce(() => {
            XCT_JP_DataManager.Instance.isFail = false;
            EventManager.Scene.emit(XCT_Events.JP_Show_EndPanel);
        }, 2)
    }
}