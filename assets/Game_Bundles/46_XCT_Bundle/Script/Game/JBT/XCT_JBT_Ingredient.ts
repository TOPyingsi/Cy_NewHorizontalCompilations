import { _decorator, Component, EventTouch, Input, instantiate, Node, Prefab, Touch, tween, Tween, UITransform, v2, v3, Vec2, Vec3 } from 'cc';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { XCT_Events } from '../../Common/XCT_Events';
import { XCT_JBT_DataManager, XCT_JBT_IngredientType } from '../../Manager/XCT_JBT_DataManager';
import { XCT_AudioManager } from '../../Manager/XCT_AudioManager';
const { ccclass, property } = _decorator;


@ccclass('XCT_JBT_Ingredient')
export class XCT_JBT_Ingredient extends Component {

    @property(Node)
    targetArea: Node = null; // 锅子节点

    private rainItem: Node = null; // 食材节点
    private rainContainer: Node = null; // 食材容器节点
    private rainTimer: number = 0;
    private isRaining: boolean = false;

    private ingredientPrefab: Node = null; // 食材预制体
    private isTouching: boolean = false; // 是否正在触摸

    // count: number = 0; // 点击次数


    protected onLoad(): void {
        this.addListener();
        this.ingredientPrefab = this.node.getChildByName('ingredient_sow');
        this.rainItem = this.node.getChildByName('rainItem');
        this.rainContainer = this.node.getChildByName('rainContainer');
        this.node.getChildByName('ingredient_suspended').active = false;
        this.node.getChildByName('selected').active = false;
    }

    /** 触摸开始：初始化角度 */
    private onTouchStart(event: Touch): void {
        
        if(XCT_JBT_DataManager.Instance.playerData.currentDay == 1 &&!XCT_JBT_DataManager.Instance.isTutorialEnd){
            if (XCT_JBT_DataManager.Instance.tutorialIdx == 7 && this.node.name !== "生菜") {
                return;
            }
            if (XCT_JBT_DataManager.Instance.tutorialIdx == 9 && this.node.name !== "薄脆") {
                return;
            }
            if (XCT_JBT_DataManager.Instance.tutorialIdx == 11 && this.node.name !== "葱花") {
                return;
            }
        }


        let touchPos = event.getUILocation(); // 触摸点世界坐标
        let ingredientNode = instantiate(this.ingredientPrefab);
        ingredientNode.parent = this.targetArea.getChildByName('Contanter');
        let prefabUITransform = this.ingredientPrefab.getComponent(UITransform);
        let targetAreaUITransform = this.targetArea.getComponent(UITransform);
        //获得点击点到this.targetArea中心的方向向量和距离，
        // 若距离大于宽度，则将点击点的坐标设置为，该方向向量上到this.targetArea中心的距离为prefabUITransform.width/2的点
        let dir = v2(touchPos.x - this.targetArea.worldPosition.x, touchPos.y - this.targetArea.worldPosition.y);
        let dist = dir.length();
        if (dist > targetAreaUITransform.width / 2) {
            dir = dir.normalize().multiplyScalar(targetAreaUITransform.width / 2);
            touchPos = v2(this.targetArea.worldPosition.x + dir.x, this.targetArea.worldPosition.y + dir.y);
        }

        let maxX = this.targetArea.worldPosition.x + targetAreaUITransform.width / 2 - prefabUITransform.width / 2;
        let minX = this.targetArea.worldPosition.x - targetAreaUITransform.width / 2 + prefabUITransform.width / 2;
        let maxY = this.targetArea.worldPosition.y + targetAreaUITransform.height / 2 - prefabUITransform.height / 2;
        let minY = this.targetArea.worldPosition.y - targetAreaUITransform.height / 2 + prefabUITransform.height / 2;
        if (touchPos.x > maxX) {
            touchPos.x = maxX;
        }
        if (touchPos.x < minX) {
            touchPos.x = minX;
        }
        if (touchPos.y > maxY) {
            touchPos.y = maxY;
        }
        if (touchPos.y < minY) {
            touchPos.y = minY;
        }
        ingredientNode.setWorldPosition(v3(touchPos.x, touchPos.y, 0));
        ingredientNode.active = true;
        ingredientNode.eulerAngles = new Vec3(0, 0, 10 * Math.random());
        // this.count++;
        let ingredientName = this.node.name;

        if (!XCT_JBT_DataManager.Instance.currentDishes[ingredientName]) {
            XCT_JBT_DataManager.Instance.currentDishes[ingredientName] = {
                type: XCT_JBT_IngredientType.SPICE,
                need: 1,
                count: 0,
                percentage: 0,
                rotateCount: 0
            }
        }
        XCT_JBT_DataManager.Instance.currentDishes[ingredientName].count++;
        XCT_AudioManager.getInstance().playSound("放");

        XCT_JBT_DataManager.Instance.playerData.money -= XCT_JBT_DataManager.Instance.ingredientsConfigObject[ingredientName].cost;
        XCT_JBT_DataManager.Instance.dayCost += XCT_JBT_DataManager.Instance.ingredientsConfigObject[ingredientName].cost;
        EventManager.Scene.emit(XCT_Events.JBT_Update_Money);
        XCT_JBT_DataManager.Instance.currentCookedSteps.push(ingredientName);


        if (XCT_JBT_DataManager.Instance.tutorialIdx == 7 && this.node.name == "生菜") {
            EventManager.Scene.emit(XCT_Events.HandAnimation_End);
            XCT_JBT_DataManager.Instance.tutorialIdx++;
        }
        if (XCT_JBT_DataManager.Instance.tutorialIdx == 9 && this.node.name == "薄脆") {
            EventManager.Scene.emit(XCT_Events.HandAnimation_End);
            XCT_JBT_DataManager.Instance.tutorialIdx++;
        }
        if (XCT_JBT_DataManager.Instance.tutorialIdx == 11 && this.node.name == "葱花") {
            EventManager.Scene.emit(XCT_Events.HandAnimation_End);
            XCT_JBT_DataManager.Instance.tutorialIdx++;
        }
    }



    /** 触摸结束：重置状态 */
    private onTouchEnd(event: Touch): void {

    }


    update(dt: number): void {
        if (this.isRaining) {
            this.rainTimer -= dt;
            if (this.rainTimer <= 0) {
                this.createRainItem();
                this.rainTimer = Math.random() * 0.3; // 0~0.3秒随机间隔
            }
        }
    }

    private createRainItem(): void {
        const ingredient = this.node.getChildByName('ingredient_suspended');
        const ingredientWorldPos = ingredient.getWorldPosition();
        const ingredientWidth = ingredient.getComponent(UITransform).width;

        const rainItem = instantiate(this.rainItem);
        rainItem.parent = this.rainContainer;

        // 设置x坐标为ingredient节点左右边界内的随机值
        const xPos = ingredientWorldPos.x - ingredientWidth / 2 + Math.random() * ingredientWidth;
        rainItem.setWorldPosition(v3(xPos, ingredientWorldPos.y, 0));
        rainItem.active = true;

        // 0.5秒后销毁
        // 设置下落动画
        let targetY = 70 + Math.random() * 50; // 下落终点
        const duration = targetY / 300; // 根据速度计算持续时间
        targetY = rainItem.worldPosition.y - targetY;
        let targetX = rainItem.worldPosition.x;
        tween(rainItem)
            .to(duration, { worldPosition: v3(targetX, targetY, 0) })
            .to(duration, { scale: v3(0, 0, 0) })
            .call(() => rainItem.destroy())
            .start();
        // 0.5秒后销毁
        // this.scheduleOnce(() => {
        //     rainTween.stop();
        //     rainItem.destroy();
        // }, 1);
    }


    /** 点击所有食材 */
    private onCancel_Click() {
        // this.isTouching = false;
        this.stopRainIngredient();
        this.removeTouchListener();
    }

    private onClick() {
        if (XCT_JBT_DataManager.Instance.isPacked) {
            EventManager.Scene.emit(XCT_Events.showTip, "卷饼后不可再添加材料哦！");
            return;
        }
        if(XCT_JBT_DataManager.Instance.playerData.currentDay == 1 &&!XCT_JBT_DataManager.Instance.isTutorialEnd){
            let num = [6,8,10];
            if (num.indexOf(XCT_JBT_DataManager.Instance.tutorialIdx) == -1) {
                return;
            }
            if (XCT_JBT_DataManager.Instance.tutorialIdx == 6 && this.node.name !== "生菜") {
                return;
            }
            if (XCT_JBT_DataManager.Instance.tutorialIdx == 8 && this.node.name !== "薄脆") {
                return;
            }
            if (XCT_JBT_DataManager.Instance.tutorialIdx == 10 && this.node.name !== "葱花") {
                return;
            }
        }

        if (XCT_JBT_DataManager.Instance.tutorialIdx == 6 && this.node.name == "生菜") {
            EventManager.Scene.emit(XCT_Events.HandAnimation_End);
            XCT_JBT_DataManager.Instance.tutorialIdx++;
        }
        if (XCT_JBT_DataManager.Instance.tutorialIdx == 8 && this.node.name == "薄脆") {
            EventManager.Scene.emit(XCT_Events.HandAnimation_End);
            XCT_JBT_DataManager.Instance.tutorialIdx++;
        }
        if (XCT_JBT_DataManager.Instance.tutorialIdx == 10 && this.node.name == "葱花") {
            EventManager.Scene.emit(XCT_Events.HandAnimation_End);
            XCT_JBT_DataManager.Instance.tutorialIdx++;
        }
        if (!XCT_JBT_DataManager.Instance.currentCookedSteps.includes("白面团") && !XCT_JBT_DataManager.Instance.currentCookedSteps.includes("土豆面")) {
            EventManager.Scene.emit(XCT_Events.showTip, "请先摊好面皮");
            return;
        }
        if (!XCT_JBT_DataManager.Instance.currentCookedSteps.includes("鸡蛋")) {
            EventManager.Scene.emit(XCT_Events.showTip, "请先摊好鸡蛋");
            return;
        }
         if (!XCT_JBT_DataManager.Instance.currentCookedSteps.includes("调味酱") && !XCT_JBT_DataManager.Instance.currentCookedSteps.includes("辣椒酱")) {
            EventManager.Scene.emit(XCT_Events.showTip, "要先抹好调味酱，才能撒配料哦！");
            return;
        }



        EventManager.Scene.emit(XCT_Events.JBT_Cancel_All_Ingredients);
        // this.isTouching = true;
        this.node.getChildByName('ingredient_suspended').active = true;
        this.rainIngredient();
        this.addTouchListener();
    }


    private rainIngredient() {
        this.node.getChildByName('selected').active = true;
        this.node.getChildByName('ingredient_suspended').active = true;
        this.isRaining = true;
        this.rainTimer = 0; // 立即创建第一个雨滴
    }

    private stopRainIngredient() {
        this.node.getChildByName('selected').active = false;
        this.node.getChildByName('ingredient_suspended').active = false;
        this.isRaining = false;
    }

    addTouchListener() {
        this.targetArea.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        // this.targetArea.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.targetArea.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
    }

    removeTouchListener() {
        this.targetArea.off(Node.EventType.TOUCH_START, this.onTouchStart, this);
        // this.targetArea.off(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.targetArea.off(Node.EventType.TOUCH_END, this.onTouchEnd, this);
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


