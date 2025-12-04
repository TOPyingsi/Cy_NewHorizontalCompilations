import { _decorator, Component, JsonAsset, Node } from 'cc';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { XCT_Events } from '../Common/XCT_Events';
import { XCT_UIManager } from './XCT_UIManager';
import { XCT_UIPanel } from '../Common/XCT_UIPanel';
import { XCT_PanelAnimation } from '../Common/XCT_BasePanel';
import { XCT_AudioManager } from './XCT_AudioManager';
const { ccclass, property } = _decorator;

// 配料类型枚举
export enum XCT_HJM_IngredientType {
    SPICE = "撒料类",
    SPREAD = "涂抹类",
    EGG = "鸡蛋类"
}

// 按钮回调类型枚举
export enum XCT_HJM_ButtonAction {
    START_MAKE = "开始制作",
    NEXT_DIALOG = "下一段对话",
    BUY_INGREDIENT = "购买食材",
    REFUSE = "拒绝",
    END_DIALOG = "结束对话",
    LEAVE = "离开",
    GET_TAKE_OUT = "开展外卖业务",
    DELIVER_TAKE_OUT = "送达",
    TAKE_DISH = "递餐",
    // LEAVE_TAKE_OUT = "外卖员离开"
}

// 配料要求接口
export interface XCT_HJM_IngredientRequire {
    type: XCT_HJM_IngredientType;
    need: 0 | 1;
    count?: number;
    percentage?: number;
    rotateCount?: number;
}

// 订单接口
export interface XCT_HJM_Order {
    [key: string]: XCT_HJM_IngredientRequire; // 配料名: 要求
}

// 对话段落接口
export interface XCT_HJM_DialogSegment {
    id: number;
    buttons: XCT_HJM_DialogButton[];
    checkStock: boolean;
    text: string;
}

// 对话按钮接口
export interface XCT_HJM_DialogButton {
    text: string;
    action: XCT_HJM_ButtonAction;
    nextSegment: number; // -1:无 0:默认++ 其他:指定编号
}

// 订单检查结果接口
export interface XCT_HJM_OrderCheckResult {
    extraIngredients: string[]; // 多余配料
    missingIngredients: string[]; // 没放配料
    lessCountIngredients: string[]; // 少放配料
    lessSpreadIngredients: string[]; // 少涂抹
    moreSpreadIngredients: string[]; // 多涂抹
    lessRotateIngredients: string[]; // 少转圈
    moreCountIngredients: string[]; // 多放配料
}

// 客人接口
export interface XCT_HJM_Customer {
    id: number;
    avatar: string;
    order: XCT_HJM_Order;
    startDialogs: XCT_HJM_DialogSegment[];
    endDialogs: XCT_HJM_DialogSegment[];
}

// 天数配置接口
export interface XCT_HJM_DayConfig {
    day: number;
    customers: XCT_HJM_Customer[];
}


export interface XCT_HJM_PlayerData {
    money: number;
    currentDay: number;
    stock: { [key: string]: number };
    score: number;
    isTakeOutProjectSet: boolean;
    isTakeOutProjectOpen: boolean;
    isAdoptedCat: boolean;
}

export interface XCT_HJM_IngredientsConfig {
    name: string;
    price: number;
    cost: number,
    sellingPrice: number
};


export enum XCT_HJM_OrderStatus {
    UNHANDLED = 0,    // 未处理
    TIMEOUT = 1,      // 已超时
    COOKED = 2,       // 制作完成
    DELIVERED = 3,     // 已送达
    REFUSED = 4,        // 拒绝
}

// 单个订单数据接口
export interface XCT_HJM_TakeoutOrderConfig {
    id: string;               // 订单唯一标识
    avatarName: string;        // 头像资源路径
    customerName: string;     // 点单人昵称
    showTime: number[];       // 显示时间(如[14,00])
    expireTime: number[];       // 过期时间(如[14,00])
    content: string;          // 订单内容
    remark: string;           // 备注信息
    order: XCT_HJM_Order;            // 订单配置
}

// 外卖订单天数配置接口
export interface XCT_HJM_DayTakeoutConfig {
    day: number;
    takeoutOrders: XCT_HJM_TakeoutOrderConfig[];
}

// 单个订单数据接口
export interface XCT_HJM_TakeoutOrder {
    id: number;               // 订单唯一标识
    avatarName: string;        // 头像资源路径
    customerName: string;     // 点单人昵称
    expireTime: number[];       // 过期时间(如[14,00])
    content: string;          // 订单内容
    remark: string;           // 备注信息
    price: number;            // 订单价格
    order: XCT_HJM_Order;            // 订单配置
    status: XCT_HJM_OrderStatus;      // 订单状态
    missingStockIngredients: string[];
}

// 数据管理单例
@ccclass('XCT_HJM_DataManager')
export class XCT_HJM_DataManager extends Component {
    public static Instance: XCT_HJM_DataManager;
    private STORAGE_KEY = "XCT_HJM_PlayerData"

    @property(JsonAsset)
    ingredientsConfigJson: JsonAsset = null!;

    @property(JsonAsset)
    TipConfigJson: JsonAsset = null!;

    @property(JsonAsset)
    TakeoutOrderConfigJson: JsonAsset = null!;

    // 商店配置
    public ingredientsConfig: XCT_HJM_IngredientsConfig[] = null!;
    public ingredientsConfigObject: { [key: string]: XCT_HJM_IngredientsConfig } = null!;

    public tipConfig: { [key: string]: string } = null!;

    // 外卖订单配置
    public takeoutOrderConfig: XCT_HJM_DayTakeoutConfig[] = null!;

    public standardSpreadCount: number = 300;


    // 游戏数据
    public playerData: XCT_HJM_PlayerData = null;
    // public currentDay: number = 1;

    public isTutorialEnd: boolean = false;
    public isNeedShowDragTutorial:boolean = false;
    public tutorialIdx: number = 0;

    public isCooking: boolean = false; // 是否正在制作

    //时间相关
    public currentTime: number = 0;
    public currentHour: number = 8; // 从早上8点开始
    public currentMinute: number = 0;
    private lastMinuteUpdate: number = 0; // 记录上次更新分钟的时间点
    private lastHourUpdate: number = 0; // 记录上次更新小时的时间点
    public readonly MINUTES_PER_HOUR = 12;
    private readonly MINUTE_INTERVAL = 15; // 分钟更新间隔(15分钟)
    private readonly isTimePause = false; // 是否暂停时间更新
    public totalTime: number = 0; // 总时间(秒)
    public isDayEnd: boolean = false; // 是否是当天结束

    //好感度相关
    public currentSmile: number = 100;
    private startCookingTime: number = 0; // 开始制作时间

    public isTakeout: boolean = false; // 是否是外卖

    //顾客对话、订单相关
    public currentCustomerIndex: number = 0;
    public dayCustomerCount: number = 0;
    public currentCustomer: XCT_HJM_Customer = null;
    public missingStockIngredients: string[] = []; // 缺失配料

    public isEndingDialog: boolean = false; // 是否是结束对话
    public isRefuse: boolean = false; // 是否拒绝顾客

    // 外卖订单相关
    public currentDayTakeoutConfig: XCT_HJM_TakeoutOrderConfig[] = [];
    public currentTakeoutOrders: XCT_HJM_TakeoutOrder[] = []; // 当前处理的订单列表
    public lastTakeoutOrderIds: number[] = []; // 最近处理的订单ID列表
    public currentTakeoutOrder: XCT_HJM_TakeoutOrder = null; // 当前处理的订单
    public needShowTakeoutCome: boolean = false; // 是否需要展示外卖订单结果

    public notes: string[][] = []; // 订单笔记
    public takeoutNotes: string[][] = []; // 订单笔记

    //制作结果相关
    public currentDishes: XCT_HJM_Order = {};
    public orderCheckResult: XCT_HJM_OrderCheckResult = this.initOrderCheckResult();

    public currentEggIngredientType: string = "白面团";
    public eggIngredientTypeTransfer: { [key: string]: number[] } = {};
    public currentSauceType: string = "调味酱";
    public sauceTypeCount: { [key: string]: number[] } = {};

    public currentCookedSteps: string[] = [];

    //售价
    public currentSellingPrice: number = 0;
    public daySellingPrice: number = 0;
    //小费
    public currentSellingAddTip: number = 0;
    public totalSellingTip: number = 10; // 最高小费
    public daySellingAddTip: number = 0;
    //退款
    public refund: number = 0;
    public dayRefund: number = 0;
    //租金
    public Rent: number = 10; // 租金
    //成本
    public dayCost: number = 0;

    isHadShowShop: boolean = false; // 是否展示过商店
    isShowingTakeoutPanel: boolean = false; // 是否 正在展示外卖订单面板
    isShowingShopPanel: boolean = false; // 是否 正在展示商店面板

    isCatDriveAway: boolean = false; // 猫是否跑了

    isPause: boolean = false; // 是否暂停时间更新

    // public stock: { [key: string]: number } = {"鸡蛋":1,"沙拉酱":1}; // 库存

    // 初始化订单检查结果
    private initOrderCheckResult(): XCT_HJM_OrderCheckResult {
        return {
            extraIngredients: [],
            missingIngredients: [],
            lessCountIngredients: [],
            lessSpreadIngredients: [],
            moreSpreadIngredients: [],
            lessRotateIngredients: [],
            moreCountIngredients: []
        };
    }

    onLoad() {
        this.addListener();
        XCT_HJM_DataManager.Instance = this;
        //配置数据
        this.ingredientsConfig = this.ingredientsConfigJson.json as XCT_HJM_IngredientsConfig[];
        this.ingredientsConfigObject = this.ingredientsConfig.reduce((obj, item) => {
            obj[item.name] = item;
            return obj;
        }, {} as { [key: string]: XCT_HJM_IngredientsConfig });

        // 提示配置
        this.tipConfig = this.TipConfigJson.json as { [key: string]: string };
        // 外卖订单配置
        this.takeoutOrderConfig = this.TakeoutOrderConfigJson.json as XCT_HJM_DayTakeoutConfig[];

        //持久化数据
        this.playerData = this.loadData();
        //动态数据
        this.initData();
    }

    initData() {
        //持久化数据
        this.playerData = this.loadData();
        //动态数据
        this.resetDay();
    }

    /**
    * 加载玩家数据，如果没有则初始化默认数据
    */
    private loadData(): XCT_HJM_PlayerData {
        const savedData = localStorage.getItem(this.STORAGE_KEY);
        if (savedData) {
            return JSON.parse(savedData);
        }

        // 初始化默认数据
        return {
            money: 100,
            currentDay: 1,
            stock: { "番茄锅": 1, "火鸡面": 1, "洋葱": 1, "咸鸭蛋": 1, "酱": 1, "盐": 1 },
            score: 5,
            isTakeOutProjectSet: false,
            isTakeOutProjectOpen: false,
            isAdoptedCat: false,
        };
    }

    resetDay() {
        this.tutorialIdx = 0;
        this.isTutorialEnd = false;
        this.isNeedShowDragTutorial = false;
        //初始化顾客相关
        this.currentCustomerIndex = 0;
        this.dayCustomerCount = 0;
        this.orderCheckResult = this.initOrderCheckResult();

        // 初始化时间为早上8点整
        this.currentTime = 0;
        this.currentHour = 8;
        this.currentMinute = 0;
        this.lastMinuteUpdate = 0;
        this.lastHourUpdate = 0;
        this.totalTime = 24 * this.MINUTES_PER_HOUR;
        this.isDayEnd = false;

        this.daySellingPrice = 0;
        this.daySellingAddTip = 0;
        this.dayRefund = 0;

        this.currentDayTakeoutConfig = this.generateRandomTakeoutOrders();
        this.currentTakeoutOrders = [];
        this.needShowTakeoutCome = false; // 是否需要展示外卖订单结果
        this.isShowingTakeoutPanel = false;        

        this.isCatDriveAway = false;
        this.isCooking = false;

        this.isPause = false;

        EventManager.Scene.emit(XCT_Events.HJM_Update_Money);
        EventManager.Scene.emit(XCT_Events.HJM_Update_Smile);
        EventManager.Scene.emit(XCT_Events.HJM_Update_Time);
        EventManager.Scene.emit(XCT_Events.HJM_Hide_New_Takeout_Order);

        EventManager.Scene.emit(XCT_Events.HJM_Start_NewDay_Dialog);
    }

    
        
        /**
         * 随机生成当日的外卖订单
         * 从第5天的配置中随机选择5个订单，随机排列，并分配合理的时间
         * @returns 生成的外卖订单配置数组
         */
        private generateRandomTakeoutOrders(): XCT_HJM_TakeoutOrderConfig[] {
            // if(this.playerData.currentDay <= 3) {
            //     return this.takeoutOrderConfig.find((item) => item.day === this.playerData.currentDay)?.takeoutOrders|| [];
            // }
    
            // 获取第5天的外卖订单配置
            const day5Config = this.takeoutOrderConfig.find(item => item.day === 5);
            if (!day5Config || day5Config.takeoutOrders.length === 0) {
                console.warn('第5天的外卖订单配置不存在或为空');
                return [];
            }
    
            // 复制订单数组以避免修改原始数据
            const allOrders = [...day5Config.takeoutOrders];
            const selectedOrders: XCT_HJM_TakeoutOrderConfig[] = [];
    
            // 随机选择5个订单（如果可用订单不足5个，则全部选择）
            const count = Math.min(5, allOrders.length);
            for (let i = 0; i < count; i++) {
                // 随机选择一个订单
                const randomIndex = Math.floor(Math.random() * allOrders.length);
                const selectedOrder = { ...allOrders[randomIndex] }; // 深拷贝订单
                selectedOrders.push(selectedOrder);
                // 从候选列表中移除已选择的订单
                allOrders.splice(randomIndex, 1);
            }
    
            // 为订单分配时间
            const orderedTimes = this.generateOrderTimes(count);
            
            // 为每个订单设置时间并返回
            return selectedOrders.map((order, index) => {
                // 设置显示时间
                order.showTime = orderedTimes[index];
                // 设置过期时间（显示时间2小时后）
                const expireHour = orderedTimes[index][0] + 2;
                order.expireTime = [expireHour, orderedTimes[index][1]];
                return order;
            });
        }
    
        /**
         * 生成订单的时间列表，确保时间分布合理
         * @param count 需要生成的时间数量
         * @returns 时间列表，每个时间为[小时,分钟]
         */
        private generateOrderTimes(count: number): number[][] {
            // 可选的小时范围：9-17点
            const availableHours = Array.from({ length: 9 }, (_, i) => i + 9); // [9,10,...,17]
            // 可选的分钟：0,15,30,45
            const availableMinutes = [0, 15, 30, 45];
            
            // 生成所有可能的时间组合
            const allPossibleTimes: number[][] = [];
            for (const hour of availableHours) {
                for (const minute of availableMinutes) {
                    allPossibleTimes.push([hour, minute]);
                }
            }
            
            // 随机打乱所有可能的时间
            for (let i = allPossibleTimes.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [allPossibleTimes[i], allPossibleTimes[j]] = [allPossibleTimes[j], allPossibleTimes[i]];
            }
            
            // 选择前count个时间，并按时间排序
            const selectedTimes = allPossibleTimes.slice(0, count);
            selectedTimes.sort((a, b) => {
                // 先按小时排序，再按分钟排序
                if (a[0] !== b[0]) return a[0] - b[0];
                return a[1] - b[1];
            });
            
            return selectedTimes;
        }

    resetCustomer(customer: XCT_HJM_Customer) {
        this.currentCustomer = customer;
        this.isRefuse = false;
        this.missingStockIngredients = [];
        this.currentSellingPrice = 0;
        this.currentSellingAddTip = 0;
        this.refund = 0;
        this.currentDishes = {};
        // this.currentSmile = 100;
        this.startCookingTime = this.currentTime;
        this.currentCookedSteps = [];
        this.notes = [];
        this.startCookingTime = this.currentTime;
        this.currentSmile = 100;
        this.isPause = false;
        EventManager.Scene.emit(XCT_Events.HJM_Update_Smile);
    }

    resetTakout(orderData: XCT_HJM_TakeoutOrder){
        this.currentTakeoutOrder = orderData;
        this.takeoutNotes = [];
        this.isTakeout = true;
        this.currentSellingAddTip = 0;
        this.refund = 0;
        this.currentDishes = {};
        this.currentCookedSteps = [];
        this.isPause = false;
    }

    passDay() {
        // XCT_UIManager.Instance.showPanel(XCT_UIPanel.PassPanel,null,()=>{
        this.playerData.currentDay++;
        this.saveData();
        //加载游戏UI
        XCT_UIManager.Instance.showPanel(XCT_UIPanel.HJM_GameUI, null, () => {
            //加载对话UI
            XCT_UIManager.Instance.showPanel(XCT_UIPanel.HJM_DialoguePanel, null, () => {
                //加载提示UI
                XCT_UIManager.Instance.showPanel(XCT_UIPanel.TipPanel);
                this.scheduleOnce(() => {
                    //预加载游戏面板
                    XCT_UIManager.Instance.showPanel(XCT_UIPanel.HJM_GamePanel, null, null, XCT_PanelAnimation.PreLoad_at_Bottom);
                    //隐藏开始、加载面板
                    XCT_UIManager.Instance.hidePanel(XCT_UIPanel.StartPanel);
                    XCT_UIManager.Instance.hidePanel(XCT_UIPanel.PassPanel);
                    XCT_UIManager.Instance.hidePanel(XCT_UIPanel.LoadingPanel, () => {
                        //显示游戏物品
                        XCT_UIManager.Instance.hidePanel(XCT_UIPanel.TablePanel);
                        EventManager.Scene.emit(XCT_Events.showTableItem);
                        // 开始新一天对话
                        this.resetDay();
                        // XCT_DialogManager.Instance.startNewDayDialog(XCT_HJM_DataManager.Instance.playerData.currentDay)
                    });
                }, 0.5);
            }, XCT_PanelAnimation.NONE);
        }, XCT_PanelAnimation.NONE);
        // this.resetDay();

        // });
    }


    startCooking() {
        if (this.isTakeout) {
            this.currentSellingPrice = this.calculateSellingPrice(this.currentTakeoutOrder.order);
            EventManager.Scene.emit(XCT_Events.HJM_Hide_smile)
        } else {
            this.currentSellingPrice = this.calculateSellingPrice(this.currentCustomer.order);
            EventManager.Scene.emit(XCT_Events.HJM_Show_smile)
        }

        this.playerData.money += this.currentSellingPrice;
        this.daySellingPrice += this.currentSellingPrice;
        XCT_AudioManager.getInstance().playSound("收银");
        EventManager.Scene.emit(XCT_Events.HJM_Update_Money);
        XCT_UIManager.Instance.showPanel(XCT_UIPanel.HJM_GamePanel);
        //新手引导
        if (XCT_HJM_DataManager.Instance.playerData.currentDay == 1 && !XCT_HJM_DataManager.Instance.isTutorialEnd)
            XCT_UIManager.Instance.showPanel(XCT_UIPanel.HJM_TutorialPanel, null, null, XCT_PanelAnimation.SLIDE_FROM_BOTTOM);

        XCT_UIManager.Instance.hidePanel(XCT_UIPanel.HJM_DialoguePanel);
        XCT_UIManager.Instance.hidePanel(XCT_UIPanel.HJM_TakeoutPanel, null, XCT_PanelAnimation.SLIDE_TO_TOP);
        this.isCooking = true;
        this.needShowTakeoutCome = false; // 是否需要展示外卖订单结果
        this.isPause = false;
        EventManager.Scene.emit(XCT_Events.Game_Resume);
    }

    endCooking(bowlNode:Node) {
        //检查订单
        this.pack();
        if (this.isTakeout) {
            this.checkOrder(this.currentTakeoutOrder.order);
            EventManager.Scene.emit(XCT_Events.HJM_Hide_smile)
        }
        else {
            this.checkOrder(this.currentCustomer.order);
            EventManager.Scene.emit(XCT_Events.HJM_Show_smile)
        }

        XCT_UIManager.Instance.showPanel(XCT_UIPanel.HJM_DialoguePanel, true, () => {
             EventManager.Scene.emit(XCT_Events.HJM_Show_Bowl,bowlNode);
            if (this.isTakeout) {
                EventManager.Scene.emit(XCT_Events.HJM_Show_Takeout_End_Dialog);
              EventManager.Scene.emit(XCT_Events.HJM_Show_Dish_Node);
            }
            else {
                 EventManager.Scene.emit(XCT_Events.HJM_Show_End_Dialog_Sp);
                EventManager.Scene.emit(XCT_Events.HJM_Show_Dish_Node);
            }
            this.isEndingDialog = true;

            XCT_UIManager.Instance.hidePanel(XCT_UIPanel.HJM_GamePanel);
        }, XCT_PanelAnimation.SLIDE_FROM_TOP);
        this.isCooking = false;
        EventManager.Scene.emit(XCT_Events.Game_Resume);
    }


    checkoutCustomer() {
        this.calculateRefund(this.currentCustomer.order);
        if (this.refund > 0) {
            this.playerData.money -= this.refund;
            EventManager.Scene.emit(XCT_Events.HJM_Update_Money);
            this.refund = 0;
            return;
        }

        this.calculateAddTip();
        if (this.currentSellingAddTip > 0) {
            EventManager.Scene.emit(XCT_Events.HJM_Show_Add_Tip);
            this.playerData.money += this.currentSellingAddTip;
            EventManager.Scene.emit(XCT_Events.HJM_Update_Money);
            this.currentSellingAddTip = 0;
        }
    }

    checkoutDay() {
        EventManager.Scene.emit(XCT_Events.hideTableItem);
        XCT_UIManager.Instance.showPanel(XCT_UIPanel.TablePanel);
        XCT_UIManager.Instance.showPanel(XCT_UIPanel.LoadingPanel, () => {
            XCT_UIManager.Instance.showPanel(XCT_UIPanel.HJM_CheckoutPanel);
        });

    }

    // endCustomerLeave():boolean{
    //     if(this.isDayEnd){
    //         this.passDay();
    //         return false;
    //     }
    // }

    startNewDay() {
        //初始化新手引导

        //初始化今日时间流逝

        //初始化今日对话

        //初始化好评度
    }




    addOneHour() {
        this.currentTime += this.MINUTES_PER_HOUR;
        this.updateLogic();
    }

    update(dt: number) {
       if (this.isPause || !this.isCooking || this.isDayEnd || this.isTakeout) return;
        this.currentTime += dt;
        this.updateLogic();
    }

    updateLogic() {


        // 计算游戏内经过的小时数（1分钟=1小时）
        const gameHoursPassed = this.currentTime / this.MINUTES_PER_HOUR;

        // 检查是否需要更新小时（每过1小时更新一次）
        const newHour = 8 + Math.floor(gameHoursPassed);
        if (newHour !== this.currentHour && gameHoursPassed >= this.lastHourUpdate + 1) {
            this.currentHour = newHour;
            this.lastHourUpdate = Math.floor(gameHoursPassed);
        }

        // 检查是否需要更新分钟（每过15分钟更新一次，只显示00、15、30、45）
        const minutesInGameTime = gameHoursPassed * 60; // 转换为游戏内分钟数
        const minuteSteps = Math.floor(minutesInGameTime / this.MINUTE_INTERVAL);
        const newMinute = (minuteSteps % 4) * this.MINUTE_INTERVAL;

        if (newMinute !== this.currentMinute && minutesInGameTime >= this.lastMinuteUpdate + this.MINUTE_INTERVAL) {
            this.currentMinute = newMinute;
            this.lastMinuteUpdate = minuteSteps * this.MINUTE_INTERVAL;
        }

        // 检查是否到达19:00，触发当天结束事件
        if (this.currentHour >= 19) {
            this.currentTime = this.totalTime - (5 + 8) * this.MINUTES_PER_HOUR;
            this.currentHour = 19;
            this.currentMinute = 0;
            this.isDayEnd = true;
            // 发射当天结束事件
            // EventManager.emit(XCT_Events.dayEnd);
            // 可以在这里添加防止重复触发的逻辑，比如设置一个标志位
        }
        EventManager.Scene.emit(XCT_Events.HJM_Update_Time);


        // 处理外卖订单逻辑1：检查并创建新的外卖订单
        for (let i = this.currentDayTakeoutConfig.length - 1; i >= 0; i--) {
            const orderConfig = this.currentDayTakeoutConfig[i];
            const [orderHour, orderMinute] = orderConfig.showTime;

            // 比较当前时间是否大于订单显示时间
            if ((this.currentHour > orderHour) ||
                (this.currentHour === orderHour && this.currentMinute >= orderMinute)) {

                // 创建新的外卖订单对象
                const takeoutOrder: XCT_HJM_TakeoutOrder = {
               id: Date.now(),
                    avatarName: orderConfig.avatarName,
                    customerName: orderConfig.customerName,
                    expireTime: orderConfig.expireTime,
                    content: orderConfig.content,
                    remark: orderConfig.remark,
                    order: orderConfig.order,
                    price: 0, // 初始价格设为0
                    status: XCT_HJM_OrderStatus.UNHANDLED,
                    missingStockIngredients: []
                };

                // 计算订单价格
                takeoutOrder.price = this.calculateSellingPrice(orderConfig.order);

                takeoutOrder.missingStockIngredients = this.checkTakeoutStock(orderConfig.order)

                // 将订单添加到当前处理的订单列表
                this.currentTakeoutOrders.push(takeoutOrder);
                EventManager.Scene.emit(XCT_Events.HJM_ORDER_DATA_UPDATED);
                if (this.isCooking) {
                    this.needShowTakeoutCome = true; // 是否需要展示外卖订单结果
                }
                else {
                    EventManager.Scene.emit(XCT_Events.HJM_New_Takeout_Order);
                }
                // 从原配置中删除该订单
                this.currentDayTakeoutConfig.splice(i, 1);
            }
        }

        // 处理外卖订单逻辑2：检查订单是否超时
        for (let i = 0; i < this.currentTakeoutOrders.length; i++) {
            const order = this.currentTakeoutOrders[i];

            // 只处理未处理状态的订单
            if (order.status === XCT_HJM_OrderStatus.UNHANDLED) {
                const [expireHour, expireMinute] = order.expireTime;

                // 比较当前时间是否超过过期时间
                if ((this.currentHour > expireHour) ||
                    (this.currentHour === expireHour && this.currentMinute >= expireMinute)) {

                    // 将订单状态设置为超时
                    order.status = XCT_HJM_OrderStatus.TIMEOUT;
                    EventManager.Scene.emit(XCT_Events.HJM_ORDER_DATA_UPDATED);
                }
            }
        }




        if (!this.isTakeout) {
            // 计算从开始制作到现在经过的游戏内分钟数
            const cookingTimePassed = this.currentTime - this.startCookingTime;
            // // 根据游戏时间流速，转换为游戏内分钟数（游戏内1小时=现实20秒）
            // // 1小时=60分钟，所以游戏内1分钟=现实20/60秒=1/3秒
            // const gameMinutesPassed = cookingTimePassed * 3;

            const gameHoursPassed = cookingTimePassed / this.MINUTES_PER_HOUR;
            const minutesPassed = gameHoursPassed * 60 / 6; // 转换为游戏内分钟数

            // currentSmile = 100 - 已过去的分钟数，且不小于0
            // this.currentSmile = Math.max(0, 100 - Math.floor(gameMinutesPassed));
            this.currentSmile = Math.max(0, 100 - Math.floor(minutesPassed));
            EventManager.Scene.emit(XCT_Events.HJM_Update_Smile);
        }
    }

    buyNewIngredient(Ingredient: string) {
        this.playerData.stock[Ingredient] = 1;
    }

    // 重置订单检查结果
    resetOrderCheckResult() {
        this.orderCheckResult = this.initOrderCheckResult();
    }

    // 检查库存是否满足订单
    checkStock(): boolean {
        let order = this.currentCustomer.order;
        this.missingStockIngredients = [];
        Object.keys(order).forEach(ingredient => {
            const require = order[ingredient];
            if (require.need === 1) {
                const hasIngredient = this.playerData.stock[ingredient] !== undefined && this.playerData.stock[ingredient] > 0; // 假设库存检查结果

                if (!hasIngredient) {
                    this.missingStockIngredients.push(ingredient);
                }
            }
        });
        return this.missingStockIngredients.length === 0;
    }

    // 检查库存是否满足订单
    checkTakeoutStock(order: XCT_HJM_Order): string[] {
        // let order = this.currentCustomer.order;
        let missingStockIngredients: string[] = [];
        Object.keys(order).forEach(ingredient => {
            const require = order[ingredient];
            if (require.need === 1) {
                const hasIngredient = this.playerData.stock[ingredient] !== undefined && this.playerData.stock[ingredient] > 0; // 假设库存检查结果

                if (!hasIngredient) {
                    missingStockIngredients.push(ingredient);
                }
            }
        });
        return missingStockIngredients;
    }


    calculateSellingPrice(order: XCT_HJM_Order): number {
        let totalSellingPrice = 0;
        for (let ingredientName in order) {
            let ingredientRequire = order[ingredientName];
            if (ingredientRequire.need == 0) {
                continue;
            }
            const ingredientConfig = this.ingredientsConfigObject[ingredientName];
                        if(!ingredientConfig){
                console.log(`LSF_DataManager: 未找到材料配置 ${ingredientName},订单：`, order);
                continue;
            }
            let sellingPrice = ingredientConfig.sellingPrice;
            if (ingredientRequire.type == XCT_HJM_IngredientType.SPICE) {
                sellingPrice = ingredientConfig.sellingPrice * ingredientRequire.count;
            }
            else if (ingredientRequire.type == XCT_HJM_IngredientType.SPREAD) {
                sellingPrice = ingredientConfig.sellingPrice * ingredientRequire.percentage;
            }
            else if (ingredientRequire.type == XCT_HJM_IngredientType.EGG) {
                sellingPrice = ingredientConfig.sellingPrice * ingredientRequire.count;
            }

            totalSellingPrice += sellingPrice;
        }
        return totalSellingPrice;
    }


    pack() {
        // //面团
        // Object.keys(this.eggIngredientTypeTransfer).forEach(doughType => {
        //     let totalRotateCount = 0;
        //     this.eggIngredientTypeTransfer[doughType].forEach(rotateCount => {
        //         totalRotateCount += rotateCount;
        //     });
        //     if(!XCT_HJM_DataManager.Instance.currentDishes[doughType]){
        //         XCT_HJM_DataManager.Instance.currentDishes[doughType] = {
        //                 type: XCT_HJM_IngredientType.EGG,
        //                 need: 1,
        //                 count: 0,
        //                 percentage: 0,
        //                 rotateCount: 0
        //         }
        //     }
        //     this.currentDishes[doughType].rotateCount = totalRotateCount;
        // });

        // sauce
        Object.keys(this.sauceTypeCount).forEach(sauceType => {
            let totalCount = 0;
            this.sauceTypeCount[sauceType].forEach(count => {
                totalCount += count;
            });

            let percentage = totalCount / this.standardSpreadCount;
            if (!XCT_HJM_DataManager.Instance.currentDishes[sauceType]) {
                XCT_HJM_DataManager.Instance.currentDishes[sauceType] = {
                    type: XCT_HJM_IngredientType.SPREAD,
                    need: 1,
                    count: 1,
                    percentage: 0,
                    rotateCount: 0
                }
            }
            this.currentDishes[sauceType].percentage = percentage;
        });

        //
    }


    // 检查订单
    public checkOrder(order: XCT_HJM_Order) {
        let actualIngredients: XCT_HJM_Order = this.currentDishes;
        this.resetOrderCheckResult();
        const result = this.orderCheckResult;
        // const order = this.currentCustomer.order;

        // 检查多余配料
        Object.keys(actualIngredients).forEach(ingredient => {
            if (order[ingredient] && order[ingredient].need === 0) {
                result.extraIngredients.push(ingredient);
            }
        });

        // 检查没放配料
        Object.keys(order).forEach(ingredient => {
            if (order[ingredient].need === 1 && !actualIngredients[ingredient]) {
                result.missingIngredients.push(ingredient);
            }
        });
        // 对需要检查的配料（need=1）进行详细检查
        Object.keys(order).forEach(ingredient => {
            const orderItem = order[ingredient];
            const actualItem = actualIngredients[ingredient];

            // 只处理订单要求必须放的配料（need=1）且实际已放的情况
            if (orderItem.need === 1 && actualItem) {
                switch (orderItem.type) {
                    case XCT_HJM_IngredientType.SPICE: // 撒料类
                        this.checkSpiceIngredient(ingredient, orderItem, actualItem, result);
                        break;
                    case XCT_HJM_IngredientType.SPREAD: // 涂抹类
                        this.checkSpreadIngredient(ingredient, orderItem, actualItem, result);
                        break;
                    case XCT_HJM_IngredientType.EGG: // 鸡蛋类
                        this.checkEggIngredient(ingredient, orderItem, actualItem, result);
                        break;
                }
            }
        });
    }

    /** 检查撒料类配料 */
    private checkSpiceIngredient(
        ingredient: string,
        orderItem: XCT_HJM_IngredientRequire,
        actualItem: any,
        result: XCT_HJM_OrderCheckResult
    ) {
        // 撒料类必须配置数量，且不需要检查百分比和转数
        if (orderItem.count === undefined) return;

        // 3. 少放配料（数量不足）
        if (actualItem.count < orderItem.count) {
            result.lessCountIngredients.push(ingredient);
        }
        // 7. 多放配料（数量过多）
        else if (actualItem.count > orderItem.count) {
            result.moreCountIngredients.push(ingredient);
        }
    }

    /** 检查涂抹类配料 */
    private checkSpreadIngredient(
        ingredient: string,
        orderItem: XCT_HJM_IngredientRequire,
        actualItem: any,
        result: XCT_HJM_OrderCheckResult
    ) {
        // 涂抹类必须配置百分比，数量固定为1（无需检查数量）
        if (orderItem.percentage === undefined) return;

        // 4. 少涂抹（百分比不足）
        if (actualItem.percentage < orderItem.percentage) {
            result.lessSpreadIngredients.push(ingredient);
        }
        // 5. 多涂抹（百分比超过需求+50）
        else if (actualItem.percentage > orderItem.percentage + 50) {
            result.moreSpreadIngredients.push(ingredient);
        }
    }

    /** 检查鸡蛋类配料（同时检查数量和转数） */
    private checkEggIngredient(
        ingredient: string,
        orderItem: XCT_HJM_IngredientRequire,
        actualItem: any,
        result: XCT_HJM_OrderCheckResult
    ) {
        // 鸡蛋类必须配置数量和转数
        if (orderItem.count === undefined || orderItem.rotateCount === undefined) return;

        // 3. 少放配料（数量不足）
        if (actualItem.count < orderItem.count) {
            result.lessCountIngredients.push(ingredient);
        }
        // 7. 多放配料（数量过多）
        else if (actualItem.count > orderItem.count) {
            result.moreCountIngredients.push(ingredient);
        }

        // 6. 少转圈（转数不足）
        if (actualItem.rotateCount < orderItem.rotateCount) {
            result.lessRotateIngredients.push(ingredient);
        }
    }


    private calculateRefund(order: XCT_HJM_Order) {
        this.refund = 0;
        if (this.orderCheckResult.extraIngredients.length > 0) {
            this.refund += this.currentSellingPrice * 0.8;
            if (this.refund > this.currentSellingPrice) this.refund = this.currentSellingPrice;
            this.dayRefund += this.refund;
            return;
        }

        if (this.orderCheckResult.missingIngredients.length > 0) {
            this.orderCheckResult.missingIngredients.forEach((ingredient) => {
                // const order = this.currentCustomer.order;
                const orderItem = order[ingredient];
                switch (orderItem.type) {
                    case XCT_HJM_IngredientType.SPICE: // 撒料类
                        this.refund += this.ingredientsConfigObject[ingredient].sellingPrice * orderItem.count;
                        break;
                    case XCT_HJM_IngredientType.SPREAD: // 涂抹类
                        this.refund += this.ingredientsConfigObject[ingredient].sellingPrice * 1;
                        break;
                    case XCT_HJM_IngredientType.EGG: // 鸡蛋类
                        this.refund += this.ingredientsConfigObject[ingredient].sellingPrice * orderItem.count;
                        break;
                }
            })
        }

        if (this.orderCheckResult.lessCountIngredients.length > 0) {
            this.orderCheckResult.lessCountIngredients.forEach((ingredient) => {
                let actualIngredients: XCT_HJM_Order = this.currentDishes;
                const actualItem = actualIngredients[ingredient];
                // const order = this.currentCustomer.order;
                const orderItem = order[ingredient];
                this.refund += this.ingredientsConfigObject[ingredient].sellingPrice * (orderItem.count - actualItem.count);
            })
        }

        if (this.currentSmile < 30) {
            this.refund += (30 - this.currentSmile) / 30 * this.currentSellingPrice;
        }

        if (this.refund > this.currentSellingPrice) this.refund = this.currentSellingPrice;

        this.dayRefund += this.refund;
        return this.refund;
    }


    private calculateAddTip() {
        this.currentSellingAddTip = 0;
        if (this.orderCheckResult.extraIngredients.length > 0) {
            return;
        }
        if (this.orderCheckResult.missingIngredients.length > 0) {
            return;
        }
        if (this.orderCheckResult.lessCountIngredients.length > 0) {
            return;
        }
        if (this.orderCheckResult.lessSpreadIngredients.length > 0) {
            return;
        }
        if (this.orderCheckResult.moreSpreadIngredients.length > 0) {
            return;
        }
        if (this.orderCheckResult.lessRotateIngredients.length > 0) {
            return;
        }
        if (this.orderCheckResult.moreCountIngredients.length > 0) {
            this.currentSellingAddTip += this.orderCheckResult.moreCountIngredients.length + 2;
        }


        if (this.currentSmile > 60) {
            this.currentSellingAddTip += (this.currentSmile - 60) / 40 * this.totalSellingTip;
        }
        if (this.currentSellingAddTip > this.totalSellingTip) {
            this.currentSellingAddTip = this.totalSellingTip;
        }
        this.daySellingAddTip += this.currentSellingAddTip;
    }

        /**
     * 游戏暂停时调用
     */
    private onGamePause() {
        this.isPause = true;
    }

    /**
     * 游戏恢复时调用
     */
    private onGameResume() {
       this.isPause = false;
    }

    /**
   * 保存数据到本地存储
   */
    private saveData(): void {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.playerData));
    }

     /**
     * 添加事件监听
     */
    private addListener() {
        EventManager.on(XCT_Events.Game_Pause, this.onGamePause, this);
        EventManager.on(XCT_Events.Game_Resume, this.onGameResume, this);
    }

    /**
     * 移除事件监听
     */
    private removeListener() {
        EventManager.off(XCT_Events.Game_Pause, this.onGamePause, this);
        EventManager.off(XCT_Events.Game_Resume, this.onGameResume, this);
    }
 
    protected onDestroy(): void {
        this.removeListener();
    }

}



