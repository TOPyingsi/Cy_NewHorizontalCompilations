import { _decorator, Component, EventTouch, Input, instantiate, Node, Prefab, Touch, UITransform, v2, v3, Vec2, Vec3 } from 'cc';
import { XCT_KLM_DataManager, XCT_KLM_IngredientType } from '../../Manager/XCT_KLM_DataManager';
import { XCT_Events } from '../../Common/XCT_Events';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
const { ccclass, property } = _decorator;

@ccclass('XCT_KLM_Bowl')
export class XCT_KLM_Bowl extends Component {

    startPos: Vec3 = null;
    targetPos: Vec3 = null;
    packedPrefab: Node = null;

    @property(Node)
    targetArea: Node = null; // 锅子节点


    @property(Node)
    dividers: Node[] = [];

    @property(Node)
    pieceNodes: Node[] = [];

    private isCanMove: boolean = false;

    protected onLoad(): void {
        this.startPos = this.node.getWorldPosition();
        this.targetPos = this.targetArea.getWorldPosition();
        this.node.getChildByName('selected').active = false;
        this.packedPrefab = this.node.getChildByName('packedPrefab');
        this.packedPrefab.active = false;
        // 注册触摸事件
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    /** 触摸开始：初始化角度 */
    private onTouchStart(event: Touch): void {
        if(XCT_KLM_DataManager.Instance.playerData.currentDay == 1 &&!XCT_KLM_DataManager.Instance.isTutorialEnd){
            let num = [10];
            if (num.indexOf(XCT_KLM_DataManager.Instance.tutorialIdx) == -1) {
                return;
            }
        }
        
        if (XCT_KLM_DataManager.Instance.currentCookedSteps.includes("烤冷面碗")) {
            EventManager.Scene.emit(XCT_Events.showTip, "只能打包一次！");
            return;
        }
        let hasSauce = false;
        let sauces = ["卷冷面"]
        XCT_KLM_DataManager.Instance.currentCookedSteps.forEach((ingredient: string) => {
            if (hasSauce) return;
            if (sauces.includes(ingredient)) {
                hasSauce = true;
            }
        })
        if (!hasSauce) {
            EventManager.Scene.emit(XCT_Events.showTip, "请先卷好冷面！");
            this.isCanMove = false;
            return;
        }

        let hasSauce2 = false;
        let sauces2 = ["铲子"]
        XCT_KLM_DataManager.Instance.currentCookedSteps.forEach((ingredient: string) => {
            if (hasSauce2) return;
            if (sauces2.includes(ingredient)) {
                hasSauce2 = true;
            }
        })
        if (!hasSauce2) {
            EventManager.Scene.emit(XCT_Events.showTip, "要先切割好冷面，才可以打包哦");
            this.isCanMove = false;
            return;
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
        const touchPos = event.getUILocation();

        if(XCT_KLM_DataManager.Instance.playerData.currentDay == 1 &&!XCT_KLM_DataManager.Instance.isTutorialEnd){
            let num = [10];
            if (num.indexOf(XCT_KLM_DataManager.Instance.tutorialIdx) == -1) {
                return;
            }
        }
        

        this.node.setWorldPosition(v3(touchPos.x, touchPos.y, 0));

    }


    /** 触摸结束：重置状态 */
    private onTouchEnd(event: Touch): void {
        if (!this.isCanMove) return;
        const uiTrans = this.targetArea.getComponent(UITransform);
        const isInside = uiTrans.getBoundingBoxToWorld().contains(v2(this.node.getWorldPosition().x, this.node.getWorldPosition().y))

        if (isInside) {
            this.dividers.forEach((divider: Node) => {
                divider.active = false;
            })
            this.pieceNodes.forEach((pieceNode: Node) => {
                pieceNode.active = false;
                pieceNode.getChildByName("before").active = true;
                pieceNode.getChildByName("after").active = false;
            })

            let packedNode = instantiate(this.packedPrefab);
            packedNode.parent = this.targetArea.getChildByName("Contanter");
            packedNode.setWorldPosition(this.targetPos);
            packedNode.active = true;
            this.node.setWorldPosition(this.startPos);
            this.node.getChildByName('selected').active = false;

            XCT_KLM_DataManager.Instance.currentCookedSteps.push(this.node.name);

            if (XCT_KLM_DataManager.Instance.tutorialIdx == 10) {
                EventManager.Scene.emit(XCT_Events.HandAnimation_End);
                XCT_KLM_DataManager.Instance.tutorialIdx++;
            }

            // if(!XCT_KLM_DataManager.Instance.currentDishes[this.node.name]){
            //     XCT_KLM_DataManager.Instance.currentDishes[this.node.name] = {
            //             type: XCT_KLM_IngredientType.SPICE,
            //             need: 1,
            //             count: 0,
            //             percentage: 0,
            //             rotateCount: 0
            //     }
            // }
            // XCT_KLM_DataManager.Instance.currentDishes[this.node.name].count++;

            // XCT_KLM_DataManager.Instance.playerData.money -= XCT_KLM_DataManager.Instance.ingredientsConfigObject[this.node.name].cost;
            // XCT_KLM_DataManager.Instance.dayCost += XCT_KLM_DataManager.Instance.ingredientsConfigObject[this.node.name].cost;
            // EventManager.Scene.emit(XCT_Events.KLM_Update_Money);

        } else {
            this.node.setWorldPosition(this.startPos);
            this.node.getChildByName('selected').active = false;
        }
    }

}


