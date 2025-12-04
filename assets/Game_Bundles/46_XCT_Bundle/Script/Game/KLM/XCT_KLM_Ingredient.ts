import { _decorator, Component, EventTouch, Input, instantiate, Node, Prefab, Touch, Tween, UITransform, v2, v3, Vec2, Vec3 } from 'cc';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { XCT_Events } from '../../Common/XCT_Events';
import { XCT_KLM_DataManager, XCT_KLM_IngredientType } from '../../Manager/XCT_KLM_DataManager';
import { XCT_AudioManager } from '../../Manager/XCT_AudioManager';
const { ccclass, property } = _decorator;


@ccclass('XCT_KLM_Ingredient')
export class XCT_KLM_Ingredient extends Component {

    @property(Node)
    targetArea: Node = null; // 锅子节点

    ingredientPrefab: Node = null; // 食材预制体

    isTouching: boolean = false; // 是否正在触摸
    tween: Tween<Node> = null; // 缩放动画

    count: number = 0; // 点击次数

    protected onLoad(): void {
        this.addListener();
        this.ingredientPrefab = this.node.getChildByName('ingredient');
        this.node.getChildByName('ingredient').active = false;
        this.node.getChildByName('selected').active = false;
    }

    /** 触摸开始：初始化角度 */
    private onTouchStart(event: Touch): void {
        const touchPos = event.getUILocation(); // 触摸点世界坐标
        let ingredientNode = instantiate(this.ingredientPrefab);
        ingredientNode.parent = this.targetArea.getChildByName('Contanter');
        ingredientNode.setWorldPosition(v3(touchPos.x, touchPos.y, 0));
        ingredientNode.setScale(v3(2, 2, 2));
        ingredientNode.eulerAngles = new Vec3(0, 0, 20);
        this.count++;

        XCT_KLM_DataManager.Instance.currentCookedSteps.push(this.node.name);

        if (XCT_KLM_DataManager.Instance.tutorialIdx == 5 && this.node.name == "生菜") {
            EventManager.Scene.emit(XCT_Events.HandAnimation_End);
            XCT_KLM_DataManager.Instance.tutorialIdx++;
        }

        if (XCT_KLM_DataManager.Instance.tutorialIdx == 7 && this.node.name == "洋葱") {
            EventManager.Scene.emit(XCT_Events.HandAnimation_End);
            XCT_KLM_DataManager.Instance.tutorialIdx++;
        }

        if (!XCT_KLM_DataManager.Instance.currentDishes[this.node.name]) {
            XCT_KLM_DataManager.Instance.currentDishes[this.node.name] = {
                type: XCT_KLM_IngredientType.SPICE,
                need: 1,
                count: 0,
                percentage: 0,
                rotateCount: 0
            }
        }
        XCT_KLM_DataManager.Instance.currentDishes[this.node.name].count++;
        XCT_AudioManager.getInstance().playSound("放");


        XCT_KLM_DataManager.Instance.playerData.money -= XCT_KLM_DataManager.Instance.ingredientsConfigObject[this.node.name].cost;
        XCT_KLM_DataManager.Instance.dayCost += XCT_KLM_DataManager.Instance.ingredientsConfigObject[this.node.name].cost;
        EventManager.Scene.emit(XCT_Events.KLM_Update_Money);
    }



    /** 触摸结束：重置状态 */
    private onTouchEnd(event: Touch): void {

    }


    update(dt: number): void {

    }

    /** 点击所有食材 */
    private onKLM_Cancel_Click() {
        // this.isTouching = false;
        this.stopScaleSingleItem();
        this.removeTouchListener();
    }

    private onClick() {
        if (XCT_KLM_DataManager.Instance.isPacked) {
            EventManager.Scene.emit(XCT_Events.showTip, "卷冷面后不可再添加材料哦！");
            return;
        }
        let hasSauce1 = false;
        let sauces1 = ["油"]
        XCT_KLM_DataManager.Instance.currentCookedSteps.forEach((ingredient: string) => {
            if (hasSauce1) return;
            if (sauces1.includes(ingredient)) {
                hasSauce1 = true;
            }
        })
        if (!hasSauce1) {
            EventManager.Scene.emit(XCT_Events.showTip, "要先刷油才可以放冷面皮哦！");
            return;
        }


        let hasSauce = false;
        let sauces = ["冷面皮"]
        XCT_KLM_DataManager.Instance.currentCookedSteps.forEach((ingredient: string) => {
            if (hasSauce) return;
            if (sauces.includes(ingredient)) {
                hasSauce = true;
            }
        })
        if (!hasSauce) {
            EventManager.Scene.emit(XCT_Events.showTip, "请先放置冷面皮！");
            return;
        }

        let hasSauce2 = false;
        let sauces2 = ["鸡蛋"]
        XCT_KLM_DataManager.Instance.currentCookedSteps.forEach((ingredient: string) => {
            if (hasSauce2) return;
            if (sauces2.includes(ingredient)) {
                hasSauce2 = true;
            }
        })
        if (!hasSauce2) {
            EventManager.Scene.emit(XCT_Events.showTip, "请先放置鸡蛋！");
            return;
        }

        let hasSauce3 = false;
        let sauces3 = ["浅色酱", "芝麻", "调味酱", "花生酱"]
        XCT_KLM_DataManager.Instance.currentCookedSteps.forEach((ingredient: string) => {
            if (hasSauce3) return;
            if (sauces3.includes(ingredient)) {
                hasSauce3 = true;
            }
        })
        if (!hasSauce3) {
            EventManager.Scene.emit(XCT_Events.showTip, "要先刷上酱料，才能放置配料哦！");
            return;
        }

        if(XCT_KLM_DataManager.Instance.playerData.currentDay == 1 &&!XCT_KLM_DataManager.Instance.isTutorialEnd){
            let num = [4,6];
            if (num.indexOf(XCT_KLM_DataManager.Instance.tutorialIdx) == -1) {
                return;
            }
            if (XCT_KLM_DataManager.Instance.tutorialIdx == 4 && this.node.name !== "生菜") {
                return;
            }
            if (XCT_KLM_DataManager.Instance.tutorialIdx == 6 && this.node.name !== "洋葱") {
                return;
            }
        }


        EventManager.Scene.emit(XCT_Events.KLM_Cancel_All_Ingredients);

        if (XCT_KLM_DataManager.Instance.tutorialIdx == 4 && this.node.name == "生菜") {
            EventManager.Scene.emit(XCT_Events.HandAnimation_End);
            XCT_KLM_DataManager.Instance.tutorialIdx++;
        }

        if (XCT_KLM_DataManager.Instance.tutorialIdx == 6 && this.node.name == "洋葱") {
            EventManager.Scene.emit(XCT_Events.HandAnimation_End);
            XCT_KLM_DataManager.Instance.tutorialIdx++;
        }

        // this.isTouching = true;
        this.node.getChildByName('ingredient').active = true;
        this.sacleSingeItem();
        this.addTouchListener();
    }

    private sacleSingeItem() {
        this.node.getChildByName('selected').active = true;
        let singleItem = this.node.getChildByName('ingredient');
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
        let singleItem = this.node.getChildByName('ingredient');
        singleItem.active = false;
        if (this.tween) {
            this.tween.stop();
            this.tween = null;
            singleItem.scale = new Vec3(1, 1, 1);
        }
        console.log('点击次数:', this.count);
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
        EventManager.on(XCT_Events.KLM_Cancel_All_Ingredients, this.onKLM_Cancel_Click, this);
        this.node.on("click", this.onClick, this);
    }

    private removeListener() {
        EventManager.off(XCT_Events.KLM_Cancel_All_Ingredients, this.onKLM_Cancel_Click, this);
    }

    onDestroy() {
        this.removeListener();
    }
}


