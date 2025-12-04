import { _decorator, Component, Node, Prefab, instantiate, Vec3 } from 'cc';
import { XCT_JP_Customer } from './XCT_JP_Customer';
import { XCT_JP_DataManager } from '../../Manager/XCT_JP_DataManager';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { XCT_Events } from '../../Common/XCT_Events';

const { ccclass, property } = _decorator;

@ccclass('XCT_JP_CustomerManager')
export class XCT_JP_CustomerManager extends Component {
    @property({ type: Prefab })
    customerPrefab: Prefab = null!;

    @property({ type: Node })
    customerContainer: Node = null!;

    @property({ type: Node })
    createPos: Node = null;

    @property({ type: Node })
    dialogPath1: Node = null;

    @property({ type: Node })
    dialogPath2: Node = null;

    @property({ type: Node })
    destoryPath: Node = null;

    @property({ type: Node })
    destroyPos: Node = null;



    // private customerPool: XCT_JP_Customer[] = [];
    private activeCustomers: XCT_JP_Customer[] = [];

    init() {
        // // 初始化顾客池
        // for (let i = 0; i < 3; i++) {
        //     const customer = instantiate(this.customerPrefab).getComponent(XCT_JP_Customer);
        //     customer.node.parent = this.customerContainer;
        //     customer.hide();
        //     this.customerPool.push(customer);
        // }
        this.addListener();
    }

    // 创建新顾客
    createCustomer(orderId: string): XCT_JP_Customer | null {
        const order = XCT_JP_DataManager.Instance.getOrderConfig(orderId);
        if (!order) return null;

        // let customer = this.customerPool.pop();
        // if (!customer) {
        let customer = instantiate(this.customerPrefab).getComponent(XCT_JP_Customer);
        // }

        customer.node.name = order.spName;
        customer.node.parent = this.customerContainer;
        customer.node.setWorldPosition(this.createPos.worldPosition);
        customer.node.setScale(this.createPos.scale);
        // 初始化顾客数据
        customer.orderId = orderId;

        customer.show();
        customer.setSP(order.spName);
        this.activeCustomers.push(customer);

        return customer;
    }

    // 移除顾客
    removeCustomer(customer: XCT_JP_Customer) {
        const index = this.activeCustomers.indexOf(customer);
        if (index > -1) {
            this.activeCustomers.splice(index, 1);
        }
    }

    removeAllCustomers() {
        this.activeCustomers.forEach((customer: XCT_JP_Customer) => {
            this.removeCustomer(customer);
            customer.hide();
            // this.customerPool.push(customer);
            customer.destroy();
        })
    }

    // 获取当前第一个活跃顾客
    getFirstCustomer(): XCT_JP_Customer | null {
        return this.activeCustomers.length > 0 ? this.activeCustomers[0] : null;
    }

    addListener() {
        EventManager.on(XCT_Events.JP_Remove_All_Customers, this.removeAllCustomers, this);
    }

    removeListener() {
        EventManager.off(XCT_Events.JP_Remove_All_Customers, this.removeAllCustomers, this);
    }

    protected onDestroy(): void {
        this.removeListener();
    }

}