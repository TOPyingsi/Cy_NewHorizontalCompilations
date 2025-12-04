import { _decorator, Button, Component, director, Graphics, instantiate, Label, Mask, Node, Sprite, SpriteFrame, tween, v3 } from 'cc';
import { XCT_BasePanel, XCT_PanelAnimation } from '../../Common/XCT_BasePanel';
import { XCT_UILayer } from '../../Common/XCT_UILayer';
import { XCT_UIManager } from '../../Manager/XCT_UIManager';
import { XCT_UIPanel } from '../../Common/XCT_UIPanel';
import { XCT_Events } from '../../Common/XCT_Events';
import { XCT_KLM_OrderStatus, XCT_KLM_TakeoutOrder, XCT_KLM_DataManager } from '../../Manager/XCT_KLM_DataManager';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import Banner from 'db://assets/Scripts/Banner';
import { XCT_AudioManager } from '../../Manager/XCT_AudioManager';
import { ProjectEvent, ProjectEventManager } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';

const { ccclass, property } = _decorator;

@ccclass('XCT_KLM_TakeoutPanel')
export class XCT_KLM_TakeoutPanel extends XCT_BasePanel {
    protected defaultShowAnimation: XCT_PanelAnimation = XCT_PanelAnimation.NONE;
    protected defaultHideAnimation: XCT_PanelAnimation = XCT_PanelAnimation.NONE;
    public defaultLayer: XCT_UILayer = XCT_UILayer.Pop2;
    protected animationDuration: number = 0.6;

    @property({ type: Label })
    lbCurrentTime: Label = null;     // 当前时间标签

    @property({ type: Node })
    starContainer: Node = null;      // 星星容器节点

    @property({ type: Node })
    shopItemContainer: Node = null;  // 订单容器节点

    @property(Node)
    btnReturn: Node = null;

    @property(Node)
    nodeNoOrder: Node = null;

    isAddedEvent: boolean = false;

    protected start(): void {
        if (!this.isAddedEvent) {
            this.addListener();
            this.isAddedEvent = true;
        }
    }


    init() {
        //  ProjectEventManager.emit(ProjectEvent.弹出窗口, "小吃摊");
        XCT_KLM_DataManager.Instance.isShowingTakeoutPanel = true;
        super.init();
        this.refreshPanel();
                EventManager.Scene.emit(XCT_Events.Game_Pause);
    }

    // 刷新整个面板
    refreshPanel() {
        // 获取店铺信息并更新
        const hour = XCT_KLM_DataManager.Instance.currentHour.toString().padStart(2, '0');
        const minute = XCT_KLM_DataManager.Instance.currentMinute.toString().padStart(2, '0');
        this.lbCurrentTime.string = `${hour}:${minute}`;
        this.updateStars(XCT_KLM_DataManager.Instance.playerData.score);

        // 获取订单列表并刷新
        const orders: XCT_KLM_TakeoutOrder[] = XCT_KLM_DataManager.Instance.currentTakeoutOrders;
        this.nodeNoOrder.active = orders.length === 0;
        //将orders里的内容倒序排列到一个新数组里，再刷新列表
        const newOrders: XCT_KLM_TakeoutOrder[] = [];
        for (let i = orders.length - 1; i >= 0; i--) {
            newOrders.push(orders[i]);
        }

        this.refreshOrderList(newOrders);
    }

    // 更新星星评分
    updateStars(score: number) {
        this.starContainer.children.forEach((node: Node, index) => {
            node.active = index < score;
        })
    }


    // 刷新订单列表
    refreshOrderList(orders: XCT_KLM_TakeoutOrder[]) {
        // 清除现有订单
        for (let i = 0; i < this.shopItemContainer.children.length; i++) {
            if (i === 0) {
                this.shopItemContainer.children[i].active = false;
                continue;
            }
            this.shopItemContainer.children[i].destroy();
        }

        let takeoutItemPrefab = this.shopItemContainer.children[0];
        // 创建新订单项
        orders.forEach(order => {
            const orderItem = instantiate(takeoutItemPrefab);
            orderItem.parent = this.shopItemContainer;
            orderItem.active = true;
            this.updateOrderItem(orderItem, order);
        });
           XCT_KLM_DataManager.Instance.lastTakeoutOrderIds = XCT_KLM_DataManager.Instance.currentTakeoutOrders.map(order => order.id);
    }

    // 更新单个订单项
    updateOrderItem(itemNode: Node, order: XCT_KLM_TakeoutOrder) {
        let lastTakeoutOrderIds = XCT_KLM_DataManager.Instance.lastTakeoutOrderIds;

        if(lastTakeoutOrderIds.includes(order.id)){
            itemNode.getChildByName('nodeNew').active = false;
        }
        else{
            itemNode.getChildByName('nodeNew').active = true;
        }

        // 设置头像(这里假设使用Sprite)
        itemNode.getChildByName('spAvatar').children.forEach((node: Node) => {
            if (node.name === order.avatarName) {
                node.active = true;
            }
            else {
                node.active = false;
            }
        })


        // 设置文本信息
        itemNode.getChildByName('lblName').getComponent(Label).string = order.customerName;
        itemNode.getChildByName('lblExpirationTime').getComponent(Label).string = `过期时间: ${order.expireTime[0].toString().padStart(2, '0')}:${order.expireTime[1].toString().padStart(2, '0')}`;
        itemNode.getChildByName('lblContent').getComponent(Label).string = order.content;
        itemNode.getChildByName('lblNote').getComponent(Label).string = `备注: ${order.remark}`;
        itemNode.getChildByName('lblPrice').getComponent(Label).string = order.price.toFixed(1);
        if (order.missingStockIngredients.length > 0) {
            itemNode.getChildByName('lblMissing').getComponent(Label).string = `缺少配料：${order.missingStockIngredients[0]}`;
            itemNode.getChildByName('lblMissing').active = true;
        }
        else {
            itemNode.getChildByName('lblMissing').active = false;
        }

        // 获取状态相关节点
        const btnAccept = itemNode.getChildByName('btnAccept').getComponent(Button);
        const btnVideo = itemNode.getChildByName('btnVideo').getComponent(Button);
        const btnRefuse = itemNode.getChildByName('btnRefuse').getComponent(Button);
        const nodeTimeout = itemNode.getChildByName('NodeTimeout');
        const nodeCookEnd = itemNode.getChildByName('NodeCookEnd');
        const nodeDelivered = itemNode.getChildByName('NodeDelivered');
        const nodeRefused = itemNode.getChildByName('NodeRefused');

        // 根据状态显示对应节点
        btnAccept.node.active = false;
        btnVideo.node.active = false;
        btnRefuse.node.active = false;
        nodeTimeout.active = false;
        nodeCookEnd.active = false;
        nodeDelivered.active = false;
        nodeRefused.active = false;

        switch (order.status) {
            case XCT_KLM_OrderStatus.UNHANDLED:
                if (order.missingStockIngredients.length > 0) {
                    btnVideo.node.active = true;
                    btnVideo.node.off(Button.EventType.CLICK);
                    btnVideo.node.on(Button.EventType.CLICK, () => this.handleVideo(order, itemNode.getChildByName('lblMissing')), this);
                }
                else {
                    btnAccept.node.active = true;
                    btnAccept.node.off(Button.EventType.CLICK);
                    btnAccept.node.on(Button.EventType.CLICK, () => this.handleAcceptOrder(order), this);
                }

                btnRefuse.node.active = true;
                // 绑定按钮事件

                btnRefuse.node.off(Button.EventType.CLICK);
                btnRefuse.node.on(Button.EventType.CLICK, () => this.handleRefuseOrder(order), this);
                break;
            case XCT_KLM_OrderStatus.TIMEOUT:
                nodeTimeout.active = true;
                break;
            case XCT_KLM_OrderStatus.COOKED:
                nodeCookEnd.active = true;
                break;
            case XCT_KLM_OrderStatus.DELIVERED:
                nodeDelivered.active = true;
                break;
            case XCT_KLM_OrderStatus.REFUSED:
                nodeRefused.active = true;
                break;
        }
    }

    // 处理接单
    handleVideo(orderData: XCT_KLM_TakeoutOrder, missLabelNode: Node) {
        XCT_AudioManager.getInstance().playSound("点击");
        Banner.Instance.ShowVideoAd(() => {
            // 假设视频播放完成
            if (XCT_KLM_DataManager.Instance.playerData.stock[orderData.missingStockIngredients[0]]) {
                XCT_KLM_DataManager.Instance.playerData.stock[orderData.missingStockIngredients[0]]++;
            } else {
                XCT_KLM_DataManager.Instance.playerData.stock[orderData.missingStockIngredients[0]] = 1;
            }
            orderData.missingStockIngredients.splice(0, 1)


            // // 更新界面
            // if (orderData.missingStockIngredients.length === 0) {
            //     missLabelNode.active = false;

            // } else {
            //     missLabelNode.getComponent(Label).string = `缺少配料：${orderData.missingStockIngredients[0]}`;
            // }
            this.refreshPanel(); // 刷新面板
        });
        // XCT_KLM_DataManager.Instance.updateOrderStatus(orderId, OrderStatus.COOKED);
    }

    // 处理接单
    handleAcceptOrder(orderData: XCT_KLM_TakeoutOrder) {
        XCT_AudioManager.getInstance().playSound("点击");
     XCT_KLM_DataManager.Instance.resetTakout(orderData);
           XCT_KLM_DataManager.Instance.takeoutNotes.push([orderData.content, `备注: ${orderData.remark}`])
        XCT_KLM_DataManager.Instance.startCooking();
        // XCT_KLM_DataManager.Instance.updateOrderStatus(orderId, OrderStatus.COOKED);
        this.refreshPanel(); // 刷新面板
    }

    // 处理拒单
    handleRefuseOrder(orderData: XCT_KLM_TakeoutOrder) {
        XCT_AudioManager.getInstance().playSound("点击");
        // 实际项目中可能需要确认逻辑
        orderData.status = XCT_KLM_OrderStatus.REFUSED;
        // XCT_KLM_DataManager.Instance.updateOrderStatus(orderId, OrderStatus.TIMEOUT);
        this.refreshPanel(); // 刷新面板
    }

    onClickReturn() {
        XCT_AudioManager.getInstance().playSound("点击");
        XCT_KLM_DataManager.Instance.isShowingTakeoutPanel = false;
        XCT_UIManager.Instance.hidePanel(XCT_UIPanel.KLM_TakeoutPanel);
    }


    onHideComplete() {
        EventManager.Scene.emit(XCT_Events.Game_Resume);
    }

    // 完善事件监听
    addListener() {
        super.addListener();
        this.btnReturn.on(Button.EventType.CLICK, this.onClickReturn, this);
        // 添加数据更新事件监听(如果有)
        EventManager.on(XCT_Events.KLM_ORDER_DATA_UPDATED, this.refreshPanel, this);
        EventManager.on(XCT_Events.KLM_Update_Time, this.refreshPanel, this);
    }

    // 移除事件监听
    removeListener() {
        super.removeListener();
        EventManager.off(XCT_Events.KLM_ORDER_DATA_UPDATED, this.refreshPanel, this);
        EventManager.off(XCT_Events.KLM_Update_Time, this.refreshPanel, this);
    }

    // 注销事件监听
    onDestroy() {
        this.removeListener();
        this.isAddedEvent = false;
    }
}








