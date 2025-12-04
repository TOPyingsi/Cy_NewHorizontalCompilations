import { _decorator, Component, EventTouch, Input, instantiate, Node, Prefab, Touch, tween, Tween, UIOpacity, UITransform, v2, v3, Vec2, Vec3 } from 'cc';

import { XCT_Events } from '../../Common/XCT_Events';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { XCT_HJM_DataManager, XCT_HJM_IngredientType } from '../../Manager/XCT_HJM_DataManager';
const { ccclass, property } = _decorator;


@ccclass('XCT_HJM_Ingredient_Single')
export class XCT_HJM_Ingredient_Single extends Component {

    @property(Node)
    beforeLayer: Node = null; // 面节点

    @property(Node)
    afterLayer: Node = null; // 汤节点

    @property(Node)
    toolsLayer: Node = null; // 工具节点

    @property(Node)
    spoonPrefab: Node = null; // 勺子预制体

    @property(Node)
    bowl: Node = null; // 碗节点

    @property(Number)
    IngredientType: number = 1; // 0汤1面



    private beforePrefab: Node = null; // 勺子预制体
    private afterPrefab: Node = null; // 勺子预制体
    private maskPrefab: Node = null; // 勺子遮罩预制体

    private bowlPrefab: Node = null; // 碗预制体

    // private ingredientPrefab: Node = null; // 食材预制体
    // private spoonPrefab: Node = null; // 勺子预制体

    private spoonNode: Node = null; // 勺子节点

    count: number = 0; // 点击次数

    private tween: Tween<Node> = null; // 缩放动画


    protected onLoad(): void {
        this.addListener();
        // this.ingredientPrefab = this.node.getChildByName('ingredient_sow');
        // this.spoonPrefab = this.node.getChildByName('spoonPrefab');
        this.beforePrefab = this.node.getChildByName('beforePrefab');
        this.afterPrefab = this.node.getChildByName('afterPrefab');
        this.maskPrefab = this.node.getChildByName('maskPrefab');
        this.bowlPrefab = this.node.getChildByName('bowlPrefab');
        this.maskPrefab.active = false;
        this.afterPrefab.active = false;
        this.beforePrefab.active = false;
        this.bowlPrefab.active = false;

        this.spoonPrefab.active = false;
        this.spoonPrefab.getChildByName("spoonMask").active = false;

        this.bowl.getChildByName("cookArea").active = false;

        this.node.getChildByName('ingredient_suspended').active = false;
        // this.node.getChildByName('ingredient_sow').active = false;
        this.node.getChildByName('selected').active = false;
    }

    /** 触摸开始：初始化角度 */
    private onTouchStart(event: Touch): void {

        if (XCT_HJM_DataManager.Instance.tutorialIdx == 1 && this.node.name == "番茄锅") {
            EventManager.Scene.emit(XCT_Events.HandAnimation_End);
            XCT_HJM_DataManager.Instance.tutorialIdx++;
        }
        if (XCT_HJM_DataManager.Instance.tutorialIdx == 3 && this.node.name == "火鸡面") {
            EventManager.Scene.emit(XCT_Events.HandAnimation_End);
            XCT_HJM_DataManager.Instance.tutorialIdx++;
        }
    }



    /** 触摸结束：重置状态 */
    private onTouchEnd(event: Touch): void {
        let beforeNode = instantiate(this.beforePrefab);
        // let targetLayer = this.IngredientType == 0 ? this.afterLayer : this.beforeLayer;
        beforeNode.parent = this.beforeLayer.getChildByName('Contanter');
        beforeNode.setPosition(v3(0, 0, 0));
        beforeNode.eulerAngles = new Vec3(0, 0, 50 * Math.random() - 50);
        beforeNode.getComponent(UIOpacity).opacity = 255;
        if (this.IngredientType == 0) {
            beforeNode.setSiblingIndex(0);
        }
        beforeNode.active = true;


        let afterNode = instantiate(this.afterPrefab);
        // let targetLayer = this.IngredientType == 0 ? this.afterLayer : this.beforeLayer;
        afterNode.parent = this.afterLayer.getChildByName('Contanter');
        afterNode.setPosition(v3(0, 0, 0));
        afterNode.eulerAngles = new Vec3(0, 0, 50 * Math.random() - 50);
        afterNode.getComponent(UIOpacity).opacity = 0;
        if (this.IngredientType == 0) {
            afterNode.setSiblingIndex(0);
        }
        else {
            afterNode.name = "Noodle";
        }
        afterNode.active = true;

        this.count++;

        EventManager.Scene.emit(XCT_Events.HJM_Cancel_All_Ingredients);

        //更新碗内容
        let layerName: string = "";
        if (this.IngredientType == 0) {
            layerName = "layer_Soup";
        }
        else {
            layerName = "layer_Noodle";
        }
        let bowlContainer = this.bowl.getChildByName("cookArea").getChildByName(layerName).getChildByName("Contanter");
        bowlContainer.children.forEach((item) => {
            item.destroy();
        })

        let bowlNode = instantiate(this.bowlPrefab);
        bowlNode.parent = bowlContainer;
        bowlNode.setPosition(v3(0, 0, 0));
        bowlNode.eulerAngles = new Vec3(0, 0, 0);
        bowlNode.active = true;


        //更新勺子遮罩
        let maskNode = instantiate(this.maskPrefab);
        let spoonMask = this.spoonPrefab.getChildByName("spoonMask");
        let container = this.IngredientType == 0 ? spoonMask.getChildByName("soupMaskContainer") : spoonMask.getChildByName("noodleMaskContainer");
        container.children.forEach((item) => {
            item.destroy();
        })
        maskNode.parent = container;
        maskNode.setPosition(v3(0, 0, 0));
        maskNode.active = true;

        //
        if (this.IngredientType == 1) {
            let spoonNode = instantiate(this.spoonPrefab);
            spoonNode.parent = this.toolsLayer.getChildByName('Contanter');
            spoonNode.setPosition(v3(0, 0, 0));
            let spoonMaskNode = spoonNode.getChildByName("spoonMask");
            spoonMaskNode.active = false;
            spoonNode.active = true;
            this.spoonNode = spoonNode;
        }

        XCT_HJM_DataManager.Instance.currentCookedSteps.push(this.node.name);

        if (!XCT_HJM_DataManager.Instance.currentDishes[this.node.name]) {
            XCT_HJM_DataManager.Instance.currentDishes[this.node.name] = {
                type: XCT_HJM_IngredientType.SPICE,
                need: 1,
                count: 0,
                percentage: 0,
                rotateCount: 0
            }
        }
        XCT_HJM_DataManager.Instance.currentDishes[this.node.name].count++;

        XCT_HJM_DataManager.Instance.playerData.money -= XCT_HJM_DataManager.Instance.ingredientsConfigObject[this.node.name].cost;
        XCT_HJM_DataManager.Instance.dayCost += XCT_HJM_DataManager.Instance.ingredientsConfigObject[this.node.name].cost;
        EventManager.Scene.emit(XCT_Events.HJM_Update_Money);
    }



    /** 点击所有食材 */
    private onCancel_Click() {
        // this.isTouching = false;
        if (this.spoonNode) {
            //oooooooooooooooooooooooooooooooooooooooooooooooooooooo设置dataManager【当前菜品idx】【菜品类型】+=角度
            this.spoonNode.destroy();
        }
        this.spoonNode = null;

        this.stopScaleSingleItem();
        this.removeTouchListener();
    }

    private onClick() {

        let soups = ["番茄锅", "红油辣锅", "玉米排骨锅", "菌菇锅"];
        let noodles = ["火鸡面", "方便面", "宽粉", "拉面", "细粉"]
        if (this.IngredientType == 1) {
            let hasSoup = false;

            XCT_HJM_DataManager.Instance.currentCookedSteps.forEach((soup: string) => {
                if (hasSoup) return;
                if (soups.includes(soup)) {
                    hasSoup = true;
                }
            })
            if (!hasSoup) {
                EventManager.Scene.emit(XCT_Events.showTip, "要先选择汤底，才可以加面哦！");
                return;
            }

            let hasNoodle = false;

            XCT_HJM_DataManager.Instance.currentCookedSteps.forEach((noodle: string) => {
                if (hasNoodle) return;
                if (noodles.includes(noodle)) {
                    hasNoodle = true;
                }
            })
            if (hasNoodle) {
                EventManager.Scene.emit(XCT_Events.showTip, "一碗面只能加一块面饼哦");
                return;
            }
        } else {
            let hasSoup = false;

            XCT_HJM_DataManager.Instance.currentCookedSteps.forEach((soup: string) => {
                if (hasSoup) return;
                if (soups.includes(soup)) {
                    hasSoup = true;
                }
            })
            if (hasSoup) {
                EventManager.Scene.emit(XCT_Events.showTip, "一碗面只能选择一种面汤底哦！");
                return;
            }
        }

        if(XCT_HJM_DataManager.Instance.playerData.currentDay == 1 &&!XCT_HJM_DataManager.Instance.isTutorialEnd){
            let num = [0,2];
            if (num.indexOf(XCT_HJM_DataManager.Instance.tutorialIdx) == -1) {
                return;
            }
            if (XCT_HJM_DataManager.Instance.tutorialIdx == 0 && this.node.name !== "番茄锅") {
                return;
            }
            if (XCT_HJM_DataManager.Instance.tutorialIdx == 2 && this.node.name !== "火鸡面") {
                return;
            }
        }

        if (XCT_HJM_DataManager.Instance.tutorialIdx == 0 && this.node.name == "番茄锅") {
            EventManager.Scene.emit(XCT_Events.HandAnimation_End);
            XCT_HJM_DataManager.Instance.tutorialIdx++;
        }
        if (XCT_HJM_DataManager.Instance.tutorialIdx == 2 && this.node.name == "火鸡面") {
            EventManager.Scene.emit(XCT_Events.HandAnimation_End);
            XCT_HJM_DataManager.Instance.tutorialIdx++;
        }


        EventManager.Scene.emit(XCT_Events.HJM_Cancel_All_Ingredients);
        // this.isTouching = true;
        this.sacleSingeItem();
        this.addTouchListener();
    }

    private sacleSingeItem() {
        this.node.getChildByName('selected').active = true;
        let singleItem = this.node.getChildByName('ingredient_suspended');
        singleItem.active = true;
        // 保存原始缩放值
        const originalScale = singleItem.scale.clone();
        // 创建循环缩放动画
        this.tween = new Tween(singleItem)
            .to(0.5, { scale: new Vec3(originalScale.x * 1.2, originalScale.y * 1.2, originalScale.z) })
            .to(0.5, { scale: originalScale })
            .union()
            .repeatForever()
            .start();
    }

    private stopScaleSingleItem() {
        this.node.getChildByName('selected').active = false;
        let singleItem = this.node.getChildByName('ingredient_suspended');
        singleItem.active = false;
        if (this.tween) {
            this.tween.stop();
            this.tween = null;
            singleItem.scale = new Vec3(1, 1, 1);
        }
        console.log('点击次数:', this.count);
    }

    addTouchListener() {
        // if(this.IngredientType == 1){
        //     this.beforeLayer.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        //     // this.targetArea.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        //     this.beforeLayer.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        // }else{
        this.afterLayer.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        // this.targetArea.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.afterLayer.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        // }
    }

    removeTouchListener() {
        // if(this.IngredientType == 1){
        //     this.beforeLayer.off(Node.EventType.TOUCH_START, this.onTouchStart, this);
        //     // this.targetArea.off(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        //     this.beforeLayer.off(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        // }else{
        this.afterLayer.off(Node.EventType.TOUCH_START, this.onTouchStart, this);
        // this.targetArea.off(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.afterLayer.off(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        // }
    }

    private addListener() {
        EventManager.on(XCT_Events.HJM_Cancel_All_Ingredients, this.onCancel_Click, this);
        this.node.on("click", this.onClick, this);
    }

    private removeListener() {
        EventManager.off(XCT_Events.HJM_Cancel_All_Ingredients, this.onCancel_Click, this);
    }

    onDestroy() {
        this.removeListener();
    }
}


