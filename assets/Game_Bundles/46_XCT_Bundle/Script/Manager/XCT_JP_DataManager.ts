import { _decorator, Component, JsonAsset } from 'cc';
import { XCT_JP_Customer } from '../Game/JP/XCT_JP_Customer';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { XCT_Events } from '../Common/XCT_Events';
const { ccclass, property } = _decorator;

interface DialogConfig {
    opening: Array<{ personId: number, content: string, next: number }>;
    narrator: string[];
    host: string[];
    customer: { [key: string]: { [key: string]: string } };
}

interface LevelConfig {
    [key: string]: { orders: string[] };
}

interface OrderConfig {
    [key: string]: {
        specialType: number;//0正常，1没给，2少给
        papers: number[];
        order: { [key: string]: number };
        content: string;
        personId: number;
        spName: string;
    }
}

@ccclass('XCT_JP_DataManager')
export class XCT_JP_DataManager extends Component {
    public static Instance: XCT_JP_DataManager;
    @property(JsonAsset)
    dialogConfigJson: JsonAsset = null!;
    @property(JsonAsset)
    levelConfigJson: JsonAsset = null!;
    @property(JsonAsset)
    orderConfigJson: JsonAsset = null!;

    // 配置数据
    dialogConfig: DialogConfig = null!;
    levelConfig: LevelConfig = null!;
    orderConfig: OrderConfig = null!;

    // 运行时数据
    currentLevel: number = 1;
    currentOrderIndex: number = 0;
    // isProcessingOrder: boolean = false;

    currentCustomer: XCT_JP_Customer | null = null;
    lastCustomer: XCT_JP_Customer | null = null;

    currentRemindType: number = 0;//0少给，1不给
    currentDishes: { [key: string]: number } = {};

    extraDishes: { [key: string]: number } = {};
    lessDishes: { [key: string]: number } = {};

    isFail: boolean = false;

    isRemind: boolean = false;
    isWrongRemind: boolean = false;

    isTutorial: boolean = true;
    isCanGetItem: boolean = false;
    tutorialIndexs: number[] = [];

    isEnd: boolean = false;
    isRandomMode: boolean = false;



    onLoad() {
        XCT_JP_DataManager.Instance = this;
        // 加载配置文件
        this.dialogConfig = this.dialogConfigJson.json as DialogConfig;
        this.levelConfig = this.levelConfigJson.json as LevelConfig;
        this.orderConfig = this.orderConfigJson.json as OrderConfig;
    }


    resetLevelData() {
        this.isRandomMode = false;
        this.currentOrderIndex = 0;
        this.currentDishes = {};
        this.extraDishes = {};
        this.lessDishes = {};
        this.isFail = false;
        this.isEnd = false;
        this.isRemind = true;
        this.isWrongRemind = false;
        this.isTutorial = true;
        this.tutorialIndexs = [];
        EventManager.Scene.emit(XCT_Events.JP_Hide_Money);
        EventManager.Scene.emit(XCT_Events.JP_Hide_PackBag);
    }

    // private async loadConfig<T>(path: string): Promise<T> {
    //     const response = await fetch(path + '.json');
    //     return await response.json() as T;
    // }

    // 获取当前关卡订单列表
    getCurrentLevelOrders(): string[] {
        return this.levelConfig["1"].orders;
    }

    // 获取下一个订单ID
    getNextOrderId(): string | null {
        const orders = this.getCurrentLevelOrders();
        if (this.currentOrderIndex >= 1) {
            this.isRandomMode = true;
        }
        if (this.isRandomMode) {

            this.currentOrderIndex = Math.floor(Math.random() * (orders.length - 1));
            if (this.lastCustomer) {
                while (this.orderConfig[orders[this.currentOrderIndex]].spName === this.lastCustomer?.name) {
                    this.currentOrderIndex = Math.floor(Math.random() * (orders.length - 1));
                }
            }
        }
        return orders[this.currentOrderIndex++];
    }

    // 获取订单配置
    getOrderConfig(orderId: string) {
        return this.orderConfig[orderId];
    }

    checkOrder() {
        const order = XCT_JP_DataManager.Instance.getOrderConfig(this.currentCustomer.orderId);
        for (let key in order.order) {
            if (!this.currentDishes[key]) {
                this.lessDishes[key] = order.order[key];
                continue;
            }
            if (this.currentDishes[key] < order.order[key]) {
                this.lessDishes[key] = order.order[key] - this.currentDishes[key];
            }
            else if (this.currentDishes[key] > order.order[key]) {
                this.extraDishes[key] = this.currentDishes[key] - order.order[key];
            }
        }
    }
}