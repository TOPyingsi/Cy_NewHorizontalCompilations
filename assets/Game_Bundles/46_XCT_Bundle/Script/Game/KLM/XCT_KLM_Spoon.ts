import { _decorator, Component, EventTouch, Input, instantiate, Node, Prefab, Touch, UITransform, v2, v3, Vec2, Vec3 } from 'cc';
import { XCT_KLM_DataManager, XCT_KLM_IngredientType } from '../../Manager/XCT_KLM_DataManager';
import { XCT_Events } from '../../Common/XCT_Events';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
const { ccclass, property } = _decorator;

@ccclass('XCT_KLM_Spoon')
export class XCT_KLM_Spoon extends Component {

    @property(Node)
    pie: Node = null; // 锅子节点

    maskPointPrefab: Node = null; // 遮罩点预制体

    @property(Node)
    maskPointContainer: Node = null; // 遮罩点容器节点

    daubCount: number = 0; // 点击次数

    startPos: Vec3 = null; // 触摸开始位置
    isTouching: boolean = false; // 是否正在触摸
    daubInterval: number = 0.05; // 每次点击间隔时间（秒）
    daubTimer: number = 0; // 上次点击时间（秒）

    isCanDaub: boolean = true; // 是否可以点击

    private isCanMove: boolean = false;

    protected onLoad(): void {
        this.maskPointPrefab = this.node.getChildByName("maskPointPrefab");
        this.maskPointPrefab.active = false;

        // 注册触摸事件
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    init(pan: Node) {
        this.pie = pan;
    }

    /** 触摸开始：初始化角度 */
    private onTouchStart(event: Touch): void {
        if (XCT_KLM_DataManager.Instance.isPacked) {
            EventManager.Scene.emit(XCT_Events.showTip, "卷冷面后不可再添加材料哦！");
            return;
        }
        if (this.node.parent.name !== "油") {
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
                this.isCanMove = false;
                return;
            }
        }

        if(XCT_KLM_DataManager.Instance.playerData.currentDay == 1 &&!XCT_KLM_DataManager.Instance.isTutorialEnd){
            let num = [0,3];
            if (num.indexOf(XCT_KLM_DataManager.Instance.tutorialIdx) == -1) {
                return;
            }
            if (XCT_KLM_DataManager.Instance.tutorialIdx == 0 && this.node.parent.name !== "油") {
                return;
            }
            if (XCT_KLM_DataManager.Instance.tutorialIdx == 3 && this.node.parent.name !== "浅色酱") {
                return;
            }
        }


        EventManager.Scene.emit(XCT_Events.KLM_Cancel_All_Ingredients);
        this.isCanMove = true;

        this.isTouching = true;
        this.daubTimer = 0;
        this.startPos = this.node.getPosition();
        const touchPos = event.getUILocation(); // 触摸点世界坐标
        this.node.setWorldPosition(v3(touchPos.x, touchPos.y, 0));

        const uiTrans = this.pie.getComponent(UITransform);
        const isInside = uiTrans.getBoundingBoxToWorld().contains(v2(this.node.getWorldPosition().x, this.node.getWorldPosition().y))

        if (!isInside) return;
        this.isCanDaub = false;
        this.createMaskPoint(touchPos);
    }

    /** 触摸移动：实时更新角度和旋转 */
    private onTouchMove(event: Touch): void {
        if (!this.isCanMove) return;
        
        if(XCT_KLM_DataManager.Instance.playerData.currentDay == 1 &&!XCT_KLM_DataManager.Instance.isTutorialEnd){
            let num = [0,3];
            if (num.indexOf(XCT_KLM_DataManager.Instance.tutorialIdx) == -1) {
                return;
            }
            if (XCT_KLM_DataManager.Instance.tutorialIdx == 0 && this.node.parent.name !== "油") {
                return;
            }
            if (XCT_KLM_DataManager.Instance.tutorialIdx == 3 && this.node.parent.name !== "浅色酱") {
                return;
            }
        }


        const touchPos = event.getUILocation();

        this.node.setWorldPosition(v3(touchPos.x, touchPos.y, 0));

        if (!this.isCanDaub) return;
        const uiTrans = this.pie.getComponent(UITransform);
        const isInside = uiTrans.getBoundingBoxToWorld().contains(v2(this.node.getWorldPosition().x, this.node.getWorldPosition().y))

        if (!isInside) return;
        this.isCanDaub = false;
        this.createMaskPoint(touchPos);
    }


    /** 触摸结束：重置状态 */
    private onTouchEnd(event: Touch): void {
        if (!this.isCanMove) return;

        this.isTouching = false;
        console.log('点击次数:', this.daubCount);

        if (this.daubCount > 0) {
            if (XCT_KLM_DataManager.Instance.tutorialIdx == 0 && this.node.parent.name == "油") {
                EventManager.Scene.emit(XCT_Events.HandAnimation_End);
                XCT_KLM_DataManager.Instance.tutorialIdx++;
            }

            if (XCT_KLM_DataManager.Instance.tutorialIdx == 3 && this.node.parent.name == "浅色酱") {
                EventManager.Scene.emit(XCT_Events.HandAnimation_End);
                XCT_KLM_DataManager.Instance.tutorialIdx++;
            }



            XCT_KLM_DataManager.Instance.currentCookedSteps.push(this.node.parent.name);

            if (!XCT_KLM_DataManager.Instance.currentDishes[this.node.parent.name]) {
                XCT_KLM_DataManager.Instance.currentDishes[this.node.parent.name] = {
                    type: XCT_KLM_IngredientType.SPICE,
                    need: 1,
                    count: 1,
                    percentage: 0,
                    rotateCount: 0
                }
            }
            else{
                XCT_KLM_DataManager.Instance.currentDishes[this.node.parent.name].count ++;
            }

            XCT_KLM_DataManager.Instance.playerData.money -= XCT_KLM_DataManager.Instance.ingredientsConfigObject[this.node.parent.name].cost;
            XCT_KLM_DataManager.Instance.dayCost += XCT_KLM_DataManager.Instance.ingredientsConfigObject[this.node.parent.name].cost;
            EventManager.Scene.emit(XCT_Events.KLM_Update_Money);
        }

        // this.breshNode.destroy();
        this.node.setPosition(this.startPos);
    }

    private createMaskPoint(touchPos: Vec2) {
        this.daubCount++;
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

}


