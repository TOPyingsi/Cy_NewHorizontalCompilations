import { _decorator, Component, EventTouch, Input, instantiate, Node, Prefab, Touch, UITransform, v2, v3, Vec2, Vec3 } from 'cc';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { XCT_Events } from '../../Common/XCT_Events';
import { XCT_JBT_DataManager } from '../../Manager/XCT_JBT_DataManager';
const { ccclass, property } = _decorator;

@ccclass('XCT_JBT_Sauce')
export class XCT_JBT_Sauce extends Component {

    @property(Node)
    touchArea: Node = null; // 触摸区域节点

    @property(Node)
    maskPointContainer: Node = null; // 遮罩点容器节点

    @property(Node)
    Pot: Node = null; // 锅子节点

    @property(Node)
    toolsLayer: Node = null; // 触摸区域节点

    brush: Node = null; // 刷子节点

    maskPointPrefab: Node = null; // 遮罩点预制体


    daubCount: number = 0; // 点击次数

    cost: number = 0; // 成本
    lastCost: number = 0; // 上次成本

    startPos: Vec3 = null; // 触摸开始位置
    isTouching: boolean = false; // 是否正在触摸
    daubInterval: number = 0.01; // 每次点击间隔时间（秒）
    daubTimer: number = 0; // 上次点击时间（秒）

    isCanDaub: boolean = true; // 是否可以点击

    sauceNum: number = 0; // 酱料编号



    protected onLoad(): void {
        this.addListener();
        this.maskPointPrefab = this.node.getChildByName("maskPointPrefab");
        this.maskPointPrefab.active = false;
        this.brush = this.node.getChildByName("brush");
        this.node.getChildByName('selected').active = false;
        // 注册触摸事件
        // this.touchArea.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        // this.touchArea.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        // this.touchArea.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        // this.touchArea.on(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    /** 触摸开始：初始化角度 */
    private onTouchStart(event: Touch): void {
        this.isTouching = true;
        this.daubTimer = 0;
        this.startPos = this.brush.getPosition();
        const touchPos = event.getUILocation(); // 触摸点世界坐标
        this.brush.setParent(this.toolsLayer);
        this.brush.setWorldPosition(v3(touchPos.x, touchPos.y, 0));

        const uiTrans = this.Pot.getComponent(UITransform);
        const isInside = uiTrans.getBoundingBoxToWorld().contains(v2(this.brush.getWorldPosition().x, this.brush.getWorldPosition().y))

        if (!isInside) return;
        this.isCanDaub = false;
        this.createMaskPoint(touchPos);
    }

    /** 触摸移动：实时更新角度和旋转 */
    private onTouchMove(event: Touch): void {
        const touchPos = event.getUILocation();

        this.brush.setWorldPosition(v3(touchPos.x, touchPos.y, 0));

        if (!this.isCanDaub) return;
        const uiTrans = this.Pot.getComponent(UITransform);
        const isInside = uiTrans.getBoundingBoxToWorld().contains(v2(this.brush.getWorldPosition().x, this.brush.getWorldPosition().y))

        if (!isInside) return;
        this.isCanDaub = false;
        this.createMaskPoint(touchPos);
    }


    /** 触摸结束：重置状态 */
    private onTouchEnd(event: Touch): void {
        this.isTouching = false;
        XCT_JBT_DataManager.Instance.sauceTypeCount[XCT_JBT_DataManager.Instance.currentSauceType][this.sauceNum] = this.daubCount;

        this.cost = Math.floor(this.daubCount / 100);
        if (this.cost !== this.lastCost) {
            XCT_JBT_DataManager.Instance.playerData.money -= (this.cost - this.lastCost) * XCT_JBT_DataManager.Instance.ingredientsConfigObject[XCT_JBT_DataManager.Instance.currentSauceType].cost;
            XCT_JBT_DataManager.Instance.dayCost += (this.cost - this.lastCost) * XCT_JBT_DataManager.Instance.ingredientsConfigObject[XCT_JBT_DataManager.Instance.currentSauceType].cost;
            EventManager.Scene.emit(XCT_Events.JBT_Update_Money);
        }
        this.lastCost = this.cost;

        // this.breshNode.destroy();
        this.brush.setParent(this.node);
        this.brush.setPosition(this.startPos);

        //更新步骤
        let totalRotateCount = 0;
        XCT_JBT_DataManager.Instance.sauceTypeCount[XCT_JBT_DataManager.Instance.currentSauceType].forEach(rotateCount => {
            totalRotateCount += rotateCount;
        });

        if (totalRotateCount > 100) {
            XCT_JBT_DataManager.Instance.currentCookedSteps.push(XCT_JBT_DataManager.Instance.currentSauceType);
            if (XCT_JBT_DataManager.Instance.tutorialIdx == 5) {
                EventManager.Scene.emit(XCT_Events.HandAnimation_End);
                XCT_JBT_DataManager.Instance.tutorialIdx++;
            }
        }
    }

    private createMaskPoint(touchPos: Vec2) {
        this.daubCount++;
        console.log('点击次数:', this.daubCount);
        const maskPoint = instantiate(this.maskPointPrefab);
        maskPoint.parent = this.maskPointContainer;
        maskPoint.active = true;
        let sourcePos = maskPoint.getChildByName('Sp');
        sourcePos.setParent(this.maskPointContainer);
        sourcePos.setPosition(v3(0, 0, 0));
        maskPoint.setWorldPosition(v3(touchPos.x, touchPos.y, 0));
        let sourceWorldPos = sourcePos.getWorldPosition();
        sourcePos.setParent(maskPoint);
        sourcePos.setWorldPosition(v3(sourceWorldPos.x, sourceWorldPos.y, 0));
    }


    update(dt: number): void {
        if (!this.isTouching) return;
        this.daubTimer += dt;
        if (this.daubTimer >= this.daubInterval) {
            this.daubTimer = 0;
            this.isCanDaub = true;
        }
    }

    onCancel_Click() {
        this.node.getChildByName('selected').active = false;
        this.isTouching = false;
        this.removeTouchListener();
    }

    private onClick() {
        if (XCT_JBT_DataManager.Instance.isPacked) {
            EventManager.Scene.emit(XCT_Events.showTip, "卷饼后不可再添加材料哦！");
            return;
        }

        if(XCT_JBT_DataManager.Instance.playerData.currentDay == 1 &&!XCT_JBT_DataManager.Instance.isTutorialEnd){
            if (XCT_JBT_DataManager.Instance.tutorialIdx !== 4) {
                return;
            }
        }

        if (!XCT_JBT_DataManager.Instance.currentCookedSteps.includes("白面团") && !XCT_JBT_DataManager.Instance.currentCookedSteps.includes("土豆面")) {
            EventManager.Scene.emit(XCT_Events.showTip, "请先摊好面皮");
            return;
        }
        if (!XCT_JBT_DataManager.Instance.currentCookedSteps.includes("鸡蛋")) {
            EventManager.Scene.emit(XCT_Events.showTip, "要先摊好鸡蛋，才能抹酱哦！");
            return;
        }

        if (XCT_JBT_DataManager.Instance.tutorialIdx == 4) {
            EventManager.Scene.emit(XCT_Events.HandAnimation_End);
            XCT_JBT_DataManager.Instance.tutorialIdx++;
        }

        EventManager.Scene.emit(XCT_Events.JBT_Cancel_All_Ingredients);
        XCT_JBT_DataManager.Instance.currentSauceType = this.node.name;
        if (!XCT_JBT_DataManager.Instance.sauceTypeCount[XCT_JBT_DataManager.Instance.currentSauceType]) {
            XCT_JBT_DataManager.Instance.sauceTypeCount[XCT_JBT_DataManager.Instance.currentSauceType] = [0];
        }
        else {
            XCT_JBT_DataManager.Instance.sauceTypeCount[XCT_JBT_DataManager.Instance.currentSauceType].push(0)
        }
        this.sauceNum = XCT_JBT_DataManager.Instance.sauceTypeCount[XCT_JBT_DataManager.Instance.currentSauceType].length - 1;

        console.log('点击了' + this.node.name);
        this.node.getChildByName('selected').active = true;
        // this.isTouching = true;
        this.addTouchListener();
    }


    addTouchListener() {
        this.touchArea.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.touchArea.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.touchArea.on(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
        this.touchArea.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
    }

    removeTouchListener() {
        this.touchArea.off(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.touchArea.off(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.touchArea.off(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
        this.touchArea.off(Node.EventType.TOUCH_END, this.onTouchEnd, this);
    }

    private addListener() {
        EventManager.on(XCT_Events.JBT_Cancel_All_Ingredients, this.onCancel_Click, this);
        this.node.on("click", this.onClick, this);
    }

    private removeListener() {
        EventManager.off(XCT_Events.JBT_Cancel_All_Ingredients, this.onCancel_Click, this);
    }

    onDestroy() {
        this.removeListener();
    }
}


