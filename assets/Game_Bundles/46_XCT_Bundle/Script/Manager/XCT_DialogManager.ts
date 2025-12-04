import { _decorator, Component, Node, Label, Button, Sprite, AssetManager, ImageAsset, find, JsonAsset, instantiate, tween, v3, Layout, Mask, Graphics, Tween } from 'cc';
import { XCT_JBT_ButtonAction, XCT_JBT_Customer, XCT_JBT_DayConfig, XCT_JBT_DialogSegment, XCT_JBT_DataManager, XCT_JBT_OrderCheckResult, XCT_JBT_IngredientRequire, XCT_JBT_IngredientType, XCT_JBT_OrderStatus } from './XCT_JBT_DataManager';
import { XCT_UIManager } from './XCT_UIManager';
import { XCT_UIPanel } from '../Common/XCT_UIPanel';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { XCT_Events } from '../Common/XCT_Events';
import Banner from 'db://assets/Scripts/Banner';
import { XCT_AudioManager } from './XCT_AudioManager';
import { XCT_Timer } from '../Common/XCT_Timer';

const { ccclass, property } = _decorator;

@ccclass('XCT_DialogManager')
export class XCT_DialogManager extends Component {
    public static Instance: XCT_DialogManager;

    @property({ type: JsonAsset }) gameConfig: JsonAsset = null;
    @property({ type: JsonAsset }) specialDialogConfig: JsonAsset = null;
    @property({ type: JsonAsset }) endingDialogConfig: JsonAsset = null;

    @property(Node) dialogPanel: Node = null; // 对话面板
    @property(Node) customerNode: Node = null; // 顾客头像
    @property(Label) dialogText: Label = null; // 对话文本
    @property(Node) buttonContainer: Node = null; // 按钮容器
    @property(Label) missingTip: Label = null; // 缺失提示
    @property(Button) buttonPrefab: Button = null; // 按钮预制体



    private dayConfigs: XCT_JBT_DayConfig[] = [];
    private specialDialogConfigs: { [key: string]: XCT_JBT_Customer } = {};
    private endingDialogConfigs: { [key: string]: XCT_JBT_DialogSegment[] } = {};

    private currentCustomers: XCT_JBT_Customer[] = [];

    private currentCustomer: XCT_JBT_Customer = null;
    private currentSegmentIndex: number = 0;
    private isStartDialog: boolean = true;
    private dialogConfig: XCT_JBT_DialogSegment[] = [];

    private dialogEndCallback: Function = null;
    private isAngry: boolean = false;

    private currentText: string = "";

    private tween :Tween<Node> = null;


    onLoad() {
        this.addListener();

        XCT_DialogManager.Instance = this;
        this.dialogPanel.active = false;
        this.missingTip.node.active = false;

        this.dayConfigs = this.gameConfig.json as XCT_JBT_DayConfig[];
        this.specialDialogConfigs = this.specialDialogConfig.json as { [key: string]: XCT_JBT_Customer };
        this.endingDialogConfigs = this.endingDialogConfig.json as { [key: string]: XCT_JBT_DialogSegment[] };

        // 显示对话面板
        this.dialogPanel.active = false;
    }

    // 开始顾客对话
    startCustomerDialog(customer: XCT_JBT_Customer, isStart: boolean = true, isRefuse: boolean = false) {
        this.currentCustomer = customer;
        this.isStartDialog = isStart;
        this.dialogConfig = isStart ? customer.startDialogs : customer.endDialogs;
        if ((!isStart && !this.dialogConfig) || isRefuse) {
            this.dialogConfig = this.endingDialogConfigs[customer.avatar];
        }
        let replaceTxt = null;
        if (isStart) {
            if (isRefuse) {
                this.currentSegmentIndex = 9;
                this.isAngry = true;
                this.currentSegmentIndex++;
            }
            else {
                this.currentSegmentIndex = 1;
            }

        }
        else {
            if (customer.avatar === "外卖员") {
                this.currentSegmentIndex = 0;
            }
            else {
                if (XCT_JBT_DataManager.Instance.currentSmile < 30) {
                    this.currentSegmentIndex = 8;
                    this.isAngry = true;
                }
                else if (XCT_JBT_DataManager.Instance.orderCheckResult.extraIngredients.length !== 0) {
                    this.currentSegmentIndex = 1;
                    this.isAngry = true;
                    replaceTxt = XCT_JBT_DataManager.Instance.orderCheckResult.extraIngredients.join('、');
                }
                else if (XCT_JBT_DataManager.Instance.orderCheckResult.missingIngredients.length !== 0) {
                    this.currentSegmentIndex = 2;
                    this.isAngry = true;
                    replaceTxt = XCT_JBT_DataManager.Instance.orderCheckResult.missingIngredients.join('、');
                }
                else if (XCT_JBT_DataManager.Instance.orderCheckResult.lessCountIngredients.length !== 0) {
                    this.currentSegmentIndex = 3;
                    this.isAngry = true;
                    replaceTxt = XCT_JBT_DataManager.Instance.orderCheckResult.lessCountIngredients.join('、');
                }
                // else if(XCT_JBT_DataManager.Instance.orderCheckResult.lessSpreadIngredients.length !== 0){
                //      this.currentSegmentIndex = 4;
                //      replaceTxt = XCT_JBT_DataManager.Instance.orderCheckResult.lessSpreadIngredients.join('、');
                // }
                // else if(XCT_JBT_DataManager.Instance.orderCheckResult.moreSpreadIngredients.length !== 0){
                //      this.currentSegmentIndex = 5;
                //      replaceTxt = XCT_JBT_DataManager.Instance.orderCheckResult.moreSpreadIngredients.join('、');
                // }
                // else if(XCT_JBT_DataManager.Instance.orderCheckResult.lessRotateIngredients.length !== 0){
                //     this.currentSegmentIndex = 6;
                //     this.isAngry = true;
                //     replaceTxt = XCT_JBT_DataManager.Instance.orderCheckResult.lessRotateIngredients.join('、');
                // }
                else if (XCT_JBT_DataManager.Instance.orderCheckResult.moreCountIngredients.length !== 0) {
                    this.currentSegmentIndex = 7;
                    replaceTxt = XCT_JBT_DataManager.Instance.orderCheckResult.moreCountIngredients.join('、');
                }
                else {
                    this.currentSegmentIndex = 0;
                }
            }
            this.currentSegmentIndex++;
        }

        this.loadSp(this.currentCustomer.avatar)

        // 显示对话面板
        this.dialogPanel.active = true;

        this.showCurrentSegment(replaceTxt);
    }

    // 显示当前对话段
    private showCurrentSegment(replaceTxt: string = null) {
        if (this.currentSegmentIndex >= this.dialogConfig.length + 1) {
            this.leave();
            return;
        }

        const segment = this.dialogConfig[this.currentSegmentIndex - 1];

        // 检查库存
        if (segment.checkStock) {
            const hasStock = XCT_JBT_DataManager.Instance.checkStock();
            this.updateStockTip(hasStock);
        } else {
            this.missingTip.node.active = false;
        }

        if (replaceTxt !== null) {
            segment.text = segment.text.replace('${}', replaceTxt);
        }

        this.currentText = segment.text;

        // 更新对话文本
        this.dialogText.string = segment.text;

        this.dialogPanel.getChildByName("mask").getComponent(Graphics).enabled = true;
        this.dialogPanel.getChildByName("mask").getComponent(Mask).enabled = true;

        // 清除现有按钮
        this.clearButtons();

        // 创建新按钮
        this.createButtons(segment);

        this.addTimer(0.07, () => {
            this.dialogPanel.getChildByName("mask").getComponent(Graphics).enabled = false;
            this.dialogPanel.getChildByName("mask").getComponent(Mask).enabled = false;
        })


        this.addTimer(2, () => {
            // 有回调就执行回调
            this.dialogEndCallback && this.dialogEndCallback();
            this.dialogEndCallback = null;
        });

    }

    // 创建对话按钮
    private createButtons(segment: XCT_JBT_DialogSegment) {
        if (XCT_JBT_DataManager.Instance.missingStockIngredients.length > 0 && !XCT_JBT_DataManager.Instance.isRefuse) {
            //按钮1
            const btnNode = instantiate(this.buttonPrefab.node);
            btnNode.parent = this.buttonContainer;

            const label = btnNode.getComponentInChildren(Label);

            // 处理库存相关按钮文本
            label.string = `进货：${XCT_JBT_DataManager.Instance.missingStockIngredients[0]}`

            btnNode.getChildByName("sign_video").active = true;


            btnNode.getComponent(Layout).updateLayout();

            this.buttonContainer.getComponent(Layout).updateLayout();

            btnNode.active = true;

            // 绑定点击事件
            btnNode.on(Button.EventType.CLICK, () => {
                XCT_AudioManager.getInstance().playSound("点击");
                this.buyIngredient();
            });

            //按钮2
            const btnNode2 = instantiate(this.buttonPrefab.node);
            btnNode2.parent = this.buttonContainer;

            const label2 = btnNode2.getComponentInChildren(Label);

            // 处理库存相关按钮文本
            label2.string = `不接待`

            btnNode2.getChildByName("sign_video").active = false;


            btnNode2.getComponent(Layout).updateLayout();

            this.buttonContainer.getComponent(Layout).updateLayout();

            btnNode2.active = true;

            // 绑定点击事件
            btnNode2.on(Button.EventType.CLICK, () => {
                XCT_AudioManager.getInstance().playSound("点击");
                this.refuse();
            });

        }
        else {
            segment.buttons.forEach((btnInfo, index) => {

                if (btnInfo.action == XCT_JBT_ButtonAction.LEAVE) {
                    this.dialogEndCallback = this.leave;
                }
                // else if(btnInfo.action == XCT_JBT_ButtonAction.GET_TAKE_OUT){
                //     this.dialogEndCallback =()=>{this.getTakeOutProgect(btnInfo)};
                // }
                else if (btnInfo.action == XCT_JBT_ButtonAction.DELIVER_TAKE_OUT) {
                    this.dialogEndCallback = this.deliverTakeOut;
                }
                // else if(btnInfo.action == XCT_JBT_ButtonAction.LEAVE_TAKE_OUT){
                //     this.dialogEndCallback = this.leaveTakeOut;
                // }


                else if(btnInfo.action == XCT_JBT_ButtonAction.TAKE_DISH){
                    this.takeDish(btnInfo);
                }
                else {
                    const btnNode = instantiate(this.buttonPrefab.node);
                    btnNode.parent = this.buttonContainer;

                    const btn = btnNode.getComponent(Button);
                    const label = btnNode.getComponentInChildren(Label);

                    // 处理库存相关按钮文本
                    label.string = this.getButtonText(btnInfo, index);

                    if (XCT_JBT_DataManager.Instance.missingStockIngredients.length > 0 && index === 0) {
                        btnNode.getChildByName("sign_video").active = true;
                    }

                    btnNode.getComponent(Layout).updateLayout();

                    this.buttonContainer.getComponent(Layout).updateLayout();

                    btnNode.active = true;

                    // 绑定点击事件
                    btnNode.on(Button.EventType.CLICK, () => {
                        XCT_AudioManager.getInstance().playSound("点击");
                        this.onButtonClick(btnInfo, segment);
                    });

                }
            });
        }
    }

    // 获取按钮文本（处理库存情况）
    private getButtonText(btnInfo: any, index: number): string {
        if (XCT_JBT_DataManager.Instance.missingStockIngredients.length > 0 && index === 0) {
            return `进货：${XCT_JBT_DataManager.Instance.missingStockIngredients[0]}`;
        }
        return btnInfo.text;
    }

    // 按钮点击处理
    private onButtonClick(btnInfo: any, segment: XCT_JBT_DialogSegment) {

        // 处理库存相关操作
        let actualAction = btnInfo.action;
        if (actualAction === XCT_JBT_ButtonAction.START_MAKE) {
            if (XCT_JBT_DataManager.Instance.missingStockIngredients.length > 0) {
                actualAction = XCT_JBT_ButtonAction.BUY_INGREDIENT;
            }
        }

        if (actualAction !== XCT_JBT_ButtonAction.BUY_INGREDIENT) {
            XCT_JBT_DataManager.Instance.notes.push([this.currentText, btnInfo.text]);
        }

        // 执行按钮动作
        switch (actualAction) {
            case XCT_JBT_ButtonAction.START_MAKE:
                this.startMaking();
                break;
            case XCT_JBT_ButtonAction.NEXT_DIALOG:
                // 处理跳转
                // if (btnInfo.nextSegment !== -1) {
                //     this.currentSegmentIndex = btnInfo.nextSegment || this.currentSegmentIndex + 1;
                //     this.showCurrentSegment();
                // }
                // else{
                this.nextSegment(btnInfo);
                // }
                break;
            case XCT_JBT_ButtonAction.BUY_INGREDIENT:
                this.buyIngredient();
                break;
            case XCT_JBT_ButtonAction.GET_TAKE_OUT:
                this.getTakeOutProgect(btnInfo)
                break;
            case XCT_JBT_ButtonAction.DELIVER_TAKE_OUT:
                this.deliverTakeOut();
                break;
            case XCT_JBT_ButtonAction.TAKE_DISH:
                this.takeDish(btnInfo);
                break;
            case XCT_JBT_ButtonAction.REFUSE:
                this.refuse();
                break;
            case XCT_JBT_ButtonAction.END_DIALOG:
                this.leave();
                break;
        }


    }

    // 开始制作
    private startMaking() {
        XCT_JBT_DataManager.Instance.isTakeout = false;
        XCT_JBT_DataManager.Instance.startCooking();
    }

    // 购买食材
    private buyIngredient() {
        if (XCT_JBT_DataManager.Instance.missingStockIngredients.length > 0) {
            const bought = XCT_JBT_DataManager.Instance.missingStockIngredients.shift();

            console.log(`购买了食材：${bought}`);

            Banner.Instance.ShowVideoAd(() => {
                // 进货
                if (XCT_JBT_DataManager.Instance.playerData.stock[bought]) {
                    XCT_JBT_DataManager.Instance.playerData.stock[bought]++;
                } else {
                    XCT_JBT_DataManager.Instance.playerData.stock[bought] = 1;
                }
                //扣钱
                // XCT_JBT_DataManager.Instance.playerData.money -= XCT_JBT_DataManager.Instance.ingredientsConfigObject[bought].price;
                // EventManager.Scene.emit(XCT_Events.JBT_Update_Money);

                // 更新界面
                if (XCT_JBT_DataManager.Instance.missingStockIngredients.length === 0) {
                    this.missingTip.node.active = false;
                } else {
                    this.missingTip.string = `缺少配料：${XCT_JBT_DataManager.Instance.missingStockIngredients[0]}`;
                }

                this.showCurrentSegment();
            })
        }
    }


    // 下一段对话
    private nextSegment(btnInfo?: any) {
        if (!btnInfo) {
            this.currentSegmentIndex++;
            this.showCurrentSegment();
            return;
        }
        if (btnInfo.nextSegment && btnInfo.nextSegment !== -1) {
            this.currentSegmentIndex = btnInfo.nextSegment;
            this.showCurrentSegment();
        }
        else {
            this.currentSegmentIndex++;
            this.showCurrentSegment();
        }
    }

    // // 结束对话
    // private endDialog() {
    //     this.dialogPanel.active = false;
    //     this.clearButtons();

    //     if (this.isStartDialog) {
    //         this.leave();
    //     }
    // }


    getTakeOutProgect(btnInfo?: any) {
        XCT_JBT_DataManager.Instance.playerData.isTakeOutProjectSet = true;
        EventManager.Scene.emit(XCT_Events.showTableItem);
        if (btnInfo) {
            this.nextSegment(btnInfo);
        }
    }

    deliverTakeOut() {
        this.dialogPanel.active = false;
        this.clearButtons();
        XCT_JBT_DataManager.Instance.isEndingDialog = false;
        this.move(false, () => {
            XCT_JBT_DataManager.Instance.currentTakeoutOrder.status = XCT_JBT_OrderStatus.DELIVERED;
            if (XCT_JBT_DataManager.Instance.isDayEnd) {
                XCT_JBT_DataManager.Instance.checkoutDay();
            }
            else {
                this.addTimer(0.5, () => {
                    this.restartCurrentCustomerDialog();
                });
                // this.addTimer(0.5, () => {
                //     XCT_UIManager.Instance.showPanel(XCT_UIPanel.JBT_TipPanel, null, () => {
                //         EventManager.Scene.emit(XCT_Events.JBT_ShowTip_Evaluation);
                //     })
                // })
            }
        })
    }

    takeDish(btnInfo?: any) {
        // EventManager.Scene.emit(XCT_Events.JBT_Take_Dish);
        // this.dialogPanel.active = false;

        let dragEnd = ()=>{
            this.dialogPanel.active = true;
            this.nextSegment(btnInfo);
            EventManager.off(XCT_Events.Dish_Drag_End,dragEnd,this)
        }

        EventManager.on(XCT_Events.Dish_Drag_End,dragEnd,this)
    }

    // ///pppppppppppppppppppppppppppppppp
    // leaveTakeOut(){
    //     this.dialogPanel.active = false;
    //     this.clearButtons();
    //     //如果是结束对话，才执行顾客结算
    //     XCT_JBT_DataManager.Instance.isEndingDialog = false;
    //     this.move(false,()=>{
    //         if(XCT_JBT_DataManager.Instance.isDayEnd){
    //              XCT_JBT_DataManager.Instance.checkoutDay();
    //         }
    //         else{
    //             this.scheduleOnce(()=>{
    //                 this.restartCurrentCustomerDialog();
    //             },0.5);
    //         }
    //     })
    // }


    refuse() {
        XCT_JBT_DataManager.Instance.isRefuse = true;
        this.startCustomerDialog(XCT_JBT_DataManager.Instance.currentCustomer, true, true)
    }


    leave() {
        this.dialogPanel.active = false;
        this.clearButtons();
        //如果是结束对话，才执行顾客结算
        if (!this.isStartDialog) {
            XCT_JBT_DataManager.Instance.checkoutCustomer();
        }
        XCT_JBT_DataManager.Instance.isEndingDialog = false;
        this.move(false, () => {
            if (XCT_JBT_DataManager.Instance.dayCustomerCount === 6) {
                XCT_JBT_DataManager.Instance.isDayEnd = true;
            }
            if (XCT_JBT_DataManager.Instance.isDayEnd) {
                XCT_JBT_DataManager.Instance.checkoutDay();
            }
            else {
                this.addTimer(0.5, () => {
                    this.nextCustomer();
                });
            }
        })
    }

    enter(cb?: Function) {
        this.move(true, () => {
            cb && cb();
        })
    }



    move(isShow: boolean, callback: Function) {
        //oooooooooooooooooooooo待完成顾客移动动画，并执行回调
        if (isShow) {
            this.customerNode.setScale(v3(1, 0, 1))
            this.tween = tween(this.customerNode)
                .to(0.3, { scale: v3(0.8, 1.1, 1) })
                .to(0.2, { scale: v3(1.1, 0.9, 1) })
                .to(0.2, { scale: v3(1, 1, 1) })
                .call(() => {
                    callback();
                })
                .start();
        }
        else {
            this.customerNode.setScale(v3(1, 1, 1))
            this.tween = tween(this.customerNode)
                .to(0.3, { scale: v3(0.8, 1.1, 1) })
                .to(0.2, { scale: v3(1, 0, 1) })
                .call(() => {
                    callback();
                })
                .start();
        }
    }

    // 清除按钮
    private clearButtons() {
        this.buttonContainer.children.forEach(child => {
            child.destroy();
        });
    }

    // 更新库存提示
    private updateStockTip(hasStock: boolean) {
        if (!hasStock && XCT_JBT_DataManager.Instance.missingStockIngredients.length > 0) {
            this.missingTip.node.active = true;
            this.missingTip.string = `缺少配料：${XCT_JBT_DataManager.Instance.missingStockIngredients[0]}`;
        } else {
            this.missingTip.node.active = false;
        }
    }

    // 加载头像
    private loadSp(avatarName: string) {
        this.customerNode.children.forEach((child: Node) => {
            child.active = false;
            if (child.name === avatarName) {
                child.active = true;
                child.getChildByName("smile").active = !this.isAngry;
                child.getChildByName("angry").active = this.isAngry;
                this.isAngry = false;
            }
        })
    }

    // 开始新的一天
    startNewDayDialog() {
        let day = XCT_JBT_DataManager.Instance.playerData.currentDay  >= 16 ? 16 : XCT_JBT_DataManager.Instance.playerData.currentDay;
        const dayConfig = this.dayConfigs.find(c => c.day === day);
        if (dayConfig) {
            this.currentCustomers = dayConfig.customers;
            if (XCT_JBT_DataManager.Instance.playerData.currentDay  >= 16) {
                XCT_JBT_DataManager.Instance.currentCustomerIndex = Math.floor(Math.random() * (this.currentCustomers.length - 1));
            }
            else {
                XCT_JBT_DataManager.Instance.currentCustomerIndex = 0;
            }

            this.startNextCustomerDialog();
        }
    }

    // 开始下一个顾客的对话
    startNextCustomerDialog() {

        let day = XCT_JBT_DataManager.Instance.playerData.currentDay >= 16 ? 16 : XCT_JBT_DataManager.Instance.playerData.currentDay;
        const dayConfig = this.dayConfigs.find(c => c.day === day);
        if (dayConfig) {
            this.currentCustomers = dayConfig.customers;
        }
        let customer: XCT_JBT_Customer = null;
        if (XCT_JBT_DataManager.Instance.playerData.isTakeOutProjectSet) {
            customer = this.currentCustomers[XCT_JBT_DataManager.Instance.currentCustomerIndex];
            while (customer.avatar == "外卖员") {
                if (XCT_JBT_DataManager.Instance.playerData.currentDay >= 16) {
                    XCT_JBT_DataManager.Instance.currentCustomerIndex = Math.floor(Math.random() * (this.currentCustomers.length - 1));
                }
                else {
                    XCT_JBT_DataManager.Instance.currentCustomerIndex++
                }

                customer = this.currentCustomers[XCT_JBT_DataManager.Instance.currentCustomerIndex];
            }
        }
        else {
            customer = this.currentCustomers[XCT_JBT_DataManager.Instance.currentCustomerIndex];
        }



        if (customer) {
            XCT_JBT_DataManager.Instance.resetCustomer(customer);
            // 加载角色
            this.loadSp(customer.avatar);
            this.enter(() => {
                this.startCustomerDialog(customer);
            })

        } else {
            // 当天所有顾客处理完毕
            console.log(`第${XCT_JBT_DataManager.Instance.playerData.currentDay}天结束`);
        }
    }

    restartCurrentCustomerDialog() {
        this.startNextCustomerDialog();
    }

    showTakeoutEndDialog() {
        //结算掉上一人的(通常不会走到这步)
        if (XCT_JBT_DataManager.Instance.isEndingDialog) {
            XCT_JBT_DataManager.Instance.isEndingDialog = false;
            if (XCT_JBT_DataManager.Instance.currentCustomer.avatar !== "外卖员") {
                XCT_JBT_DataManager.Instance.checkoutCustomer();
                if (XCT_JBT_DataManager.Instance.playerData.currentDay  >= 16 ) {
                    XCT_JBT_DataManager.Instance.currentCustomerIndex = Math.floor(Math.random() * (this.currentCustomers.length - 1));
                }
                else {
                    XCT_JBT_DataManager.Instance.currentCustomerIndex++
                }
                XCT_JBT_DataManager.Instance.dayCustomerCount++;
            }
        }

        XCT_JBT_DataManager.Instance.missingStockIngredients = [];
        this.dialogPanel.active = false;
        this.customerNode.setScale(v3(1, 0, 1))
        const customer = this.specialDialogConfigs["外卖员"];
        if (customer) {
            // 加载角色
            this.loadSp(customer.avatar);
            this.enter(() => {
                this.startCustomerDialog(customer, false);
            })
        }
    }

    // 对话结束回调
    nextCustomer() {
        if (XCT_JBT_DataManager.Instance.playerData.currentDay  >= 16 ) {
            XCT_JBT_DataManager.Instance.currentCustomerIndex = Math.floor(Math.random() * (this.currentCustomers.length - 1));
        }
        else {
            XCT_JBT_DataManager.Instance.currentCustomerIndex++
        }
        XCT_JBT_DataManager.Instance.dayCustomerCount++;
        // XCT_JBT_DataManager.Instance.currentCustomerIndex++;
        XCT_JBT_DataManager.Instance.addOneHour();
        this.startNextCustomerDialog();
    }

    showEndDialogSp() {
        this.dialogPanel.active = false;
        this.loadSp(XCT_JBT_DataManager.Instance.currentCustomer.avatar);
        this.customerNode.setScale(v3(1, 1, 1))
    }

    continueCustomerDialog() {
        this.loadSp(XCT_JBT_DataManager.Instance.currentCustomer.avatar);
        this.customerNode.setScale(v3(1, 1, 1))
        this.startCustomerDialog(XCT_JBT_DataManager.Instance.currentCustomer, false)
    }

    onGamePause(){
        if (this.tween) {
            this.tween.pause();
        }
        // 暂停所有计时器
        this.pauseAllTimers();
    }

    onGameResume(){
        if (this.tween) {
            this.tween.resume();
        }
        // 恢复所有计时器
        this.resumeAllTimers();
    }


    addListener() {
        EventManager.on(XCT_Events.JBT_Start_NewDay_Dialog, this.startNewDayDialog, this);
        EventManager.on(XCT_Events.JBT_Show_End_Dialog_Sp, this.showEndDialogSp, this);
        EventManager.on(XCT_Events.JBT_Continue_Customer_EndDialog, this.continueCustomerDialog, this);
        EventManager.on(XCT_Events.JBT_Show_Takeout_End_Dialog, this.showTakeoutEndDialog, this);
        EventManager.on(XCT_Events.Game_Pause, this.onGamePause, this);
        EventManager.on(XCT_Events.Game_Resume, this.onGameResume, this);
    }

    removeListener() {
        EventManager.off(XCT_Events.JBT_Start_NewDay_Dialog, this.startNewDayDialog, this);
        EventManager.off(XCT_Events.JBT_Show_End_Dialog_Sp, this.showEndDialogSp, this);
        EventManager.off(XCT_Events.JBT_Continue_Customer_EndDialog, this.continueCustomerDialog, this);
        EventManager.off(XCT_Events.JBT_Show_Takeout_End_Dialog, this.showTakeoutEndDialog, this);
        EventManager.off(XCT_Events.Game_Pause, this.onGamePause, this);
        EventManager.off(XCT_Events.Game_Resume, this.onGameResume, this);
    }

    protected onDestroy(): void {
        this.removeListener();
        this.clearAllTimers();
    }




    private timers: XCT_Timer[] = [];       // 所有计时器数组
    private nextTimerId: number = 0;    // 下一个计时器ID
    private isAllTimersPaused: boolean = false; // 是否所有计时器都暂停
    
    // Update方法 - 每帧更新所有计时器
    update(deltaTime: number) {
        if (this.timers.length === 0) return;

        // 遍历所有计时器
        for (let i = this.timers.length - 1; i >= 0; i--) {
            const timer = this.timers[i];
            
            // 如果计时器未暂停且全局未暂停
            if (!timer.isPaused && !this.isAllTimersPaused) {
                // 更新已流逝时间
                timer.elapsed += deltaTime;
                
                // 检查是否计时结束
                if (timer.elapsed >= timer.duration) {
                    // 执行回调
                    try {
                        timer.callback();
                    } catch (error) {
                        console.error('Timer callback error:', error);
                    }
                    
                    // 移除计时器（一次性）
                    this.timers.splice(i, 1);
                }
            }
        }
    }

    // 添加一个新的一次性计时器
    // duration: 倒计时时间（秒）
    // callback: 计时结束时的回调函数
    // 返回计时器ID，用于后续操作
    addTimer(duration: number, callback: Function): number {
        const timerId = this.nextTimerId++;
        
        const newTimer: XCT_Timer = {
            id: timerId,
            duration: duration,
            elapsed: 0,
            callback: callback,
            isPaused: false
        };
        
        this.timers.push(newTimer);
        return timerId;
    }

    // 暂停指定ID的计时器
    pauseTimer(timerId: number): boolean {
        const timer = this.timers.find(t => t.id === timerId);
        if (timer) {
            timer.isPaused = true;
            return true;
        }
        return false;
    }

    // 恢复指定ID的计时器
    resumeTimer(timerId: number): boolean {
        const timer = this.timers.find(t => t.id === timerId);
        if (timer) {
            timer.isPaused = false;
            return true;
        }
        return false;
    }

    // 移除指定ID的计时器
    removeTimer(timerId: number): boolean {
        const index = this.timers.findIndex(t => t.id === timerId);
        if (index !== -1) {
            this.timers.splice(index, 1);
            return true;
        }
        return false;
    }

    // 暂停所有计时器
    pauseAllTimers(): void {
        this.isAllTimersPaused = true;
    }

    // 恢复所有计时器
    resumeAllTimers(): void {
        this.isAllTimersPaused = false;
    }

    // 获取指定计时器的剩余时间
    getTimerRemainingTime(timerId: number): number | null {
        const timer = this.timers.find(t => t.id === timerId);
        if (timer) {
            return Math.max(0, timer.duration - timer.elapsed);
        }
        return null;
    }

    // 清除所有计时器
    clearAllTimers(): void {
        this.timers = [];
        this.isAllTimersPaused = false;
    }

}


