import { _decorator, Animation, Component, EventTouch, Input, instantiate, Node, Prefab, Touch, UITransform, v2, v3, Vec2, Vec3 } from 'cc';
import { XCT_KLM_DataManager, XCT_KLM_IngredientType } from '../../Manager/XCT_KLM_DataManager';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { XCT_Events } from '../../Common/XCT_Events';
const { ccclass, property } = _decorator;

@ccclass('XCT_KLM_Egg')
export class XCT_KLM_Egg extends Component {

    startPos: Vec3 = null;
    targetPos: Vec3 = null;
    eggPrefab: Node = null;

    @property(Node)
    targetArea: Node = null; // 锅子节点

    private isCanMove: boolean = false;

    protected onLoad(): void {
        this.startPos = this.node.getWorldPosition();
        this.targetPos = this.targetArea.getWorldPosition();
        this.node.getChildByName('selected').active = false;
        this.eggPrefab = this.node.getChildByName('eggPrefab');
        this.eggPrefab.active = false;
        this.eggPrefab.getComponent(Animation).play();
        // 注册触摸事件
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    /** 触摸开始：初始化角度 */
    private onTouchStart(event: Touch): void {
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
            this.isCanMove = false;
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
            this.isCanMove = false;
            return;
        }

        if(XCT_KLM_DataManager.Instance.playerData.currentDay == 1 &&!XCT_KLM_DataManager.Instance.isTutorialEnd){
            let num = [2];
            if (num.indexOf(XCT_KLM_DataManager.Instance.tutorialIdx) == -1) {
                return;
            }
        }


        EventManager.Scene.emit(XCT_Events.KLM_Cancel_All_Ingredients);
        this.isCanMove = true;

        const touchPos = event.getUILocation(); // 触摸点世界坐标
        this.node.setWorldPosition(v3(touchPos.x, touchPos.y, 0));
        this.node.getChildByName('selected').active = true;
    }

    /** 触摸移动：实时更新角度和旋转 */
    private onTouchMove(event: Touch): void {
        if (!this.isCanMove) return;

        
        if(XCT_KLM_DataManager.Instance.playerData.currentDay == 1 &&!XCT_KLM_DataManager.Instance.isTutorialEnd){
            let num = [2];
            if (num.indexOf(XCT_KLM_DataManager.Instance.tutorialIdx) == -1) {
                return;
            }
        }

        
        const touchPos = event.getUILocation();

        this.node.setWorldPosition(v3(touchPos.x, touchPos.y, 0));
    }


    /** 触摸结束：重置状态 */
    private onTouchEnd(event: Touch): void {
        if (!this.isCanMove) return;

        const uiTrans = this.targetArea.getComponent(UITransform);
        const isInside = uiTrans.getBoundingBoxToWorld().contains(v2(this.node.getWorldPosition().x, this.node.getWorldPosition().y))

        if (isInside) {
            let eggNode = instantiate(this.eggPrefab);
            eggNode.parent = this.targetArea.getChildByName("Contanter");
            eggNode.setWorldPosition(this.targetPos);
            eggNode.active = true;
            this.node.setWorldPosition(this.startPos);
            this.node.getChildByName('selected').active = false;

            XCT_KLM_DataManager.Instance.currentCookedSteps.push(this.node.name);

            if (XCT_KLM_DataManager.Instance.tutorialIdx == 2) {
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

            XCT_KLM_DataManager.Instance.playerData.money -= XCT_KLM_DataManager.Instance.ingredientsConfigObject[this.node.name].cost;
            XCT_KLM_DataManager.Instance.dayCost += XCT_KLM_DataManager.Instance.ingredientsConfigObject[this.node.name].cost;
            EventManager.Scene.emit(XCT_Events.KLM_Update_Money);
        } else {
            this.node.setWorldPosition(this.startPos);
            this.node.getChildByName('selected').active = false;
        }
    }
}


