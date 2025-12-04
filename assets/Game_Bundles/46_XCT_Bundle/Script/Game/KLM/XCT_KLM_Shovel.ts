import { _decorator, Component, EventTouch, Input, instantiate, Node, Prefab, Touch, UITransform, v2, v3, Vec2, Vec3 } from 'cc';
import { XCT_KLM_DataManager } from '../../Manager/XCT_KLM_DataManager';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { XCT_Events } from '../../Common/XCT_Events';
const { ccclass, property } = _decorator;


@ccclass('XCT_KLM_Shovel')
export class XCT_KLM_Shovel extends Component {

    @property(Node)
    dividers: Node[] = [];

    @property(Node)
    pieceNodes: Node[] = [];

    dividerCount: number = 0;

    startPos: Vec3 = null;
    // targetPos:Vec3 = null;
    // piePrefab: Node = null;

    // @property(Node) 
    // targetArea: Node = null; // 锅子节点
    private isCanMove: boolean = false;

    protected onLoad(): void {
        this.startPos = this.node.getWorldPosition();
        this.dividers.forEach((divider: Node) => {
            divider.active = false;
        })
        this.pieceNodes.forEach((pieceNode: Node) => {
            pieceNode.getChildByName("before").active = true;
            pieceNode.getChildByName("after").active = false;
            pieceNode.active = false;
        })
        // this.targetPos = this.targetArea.getWorldPosition();
        // this.node.getChildByName('selected').active = false;
        // this.piePrefab = this.node.getChildByName('piePrefab');
        // this.piePrefab.active = false;
        // 注册触摸事件
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    /** 触摸开始：初始化角度 */
    private onTouchStart(event: Touch): void {
        let hasSauce = false;
        let sauces = ["卷冷面"]
        XCT_KLM_DataManager.Instance.currentCookedSteps.forEach((ingredient: string) => {
            if (hasSauce) return;
            if (sauces.includes(ingredient)) {
                hasSauce = true;
            }
        })
        if (!hasSauce) {
            EventManager.Scene.emit(XCT_Events.showTip, "请先卷好冷面，才能切开哦！");
            this.isCanMove = false;

            return;
        }

        if(XCT_KLM_DataManager.Instance.playerData.currentDay == 1 &&!XCT_KLM_DataManager.Instance.isTutorialEnd){
            let num = [9];
            if (num.indexOf(XCT_KLM_DataManager.Instance.tutorialIdx) == -1) {
                return;
            }
        }

        EventManager.Scene.emit(XCT_Events.KLM_Cancel_All_Ingredients);
        this.isCanMove = true;


        const touchPos = event.getUILocation(); // 触摸点世界坐标
        this.node.setWorldPosition(v3(touchPos.x, touchPos.y, 0));
        // this.node.getChildByName('selected').active = true;
    }

    /** 触摸移动：实时更新角度和旋转 */
    private onTouchMove(event: Touch): void {
        if (!this.isCanMove) return;
        const touchPos = event.getUILocation();

        this.node.setWorldPosition(v3(touchPos.x, touchPos.y, 0));
        let isInside = false;
        let dividerIndex = -1;
        this.dividers.forEach((divider: Node, index: number) => {
            if (isInside) return;
            if (divider.active) {
                const uiTrans = divider.getComponent(UITransform);
                isInside = uiTrans.getBoundingBoxToWorld().contains(v2(this.node.getWorldPosition().x, this.node.getWorldPosition().y))
                if (isInside) {
                    if (XCT_KLM_DataManager.Instance.tutorialIdx == 9) {
                        this.dividerCount++;
                    }
                    dividerIndex = index;
                    divider.active = false;
                }
            }
        })

        if (dividerIndex != -1) {
            XCT_KLM_DataManager.Instance.currentCookedSteps.push(this.node.name);
            if (XCT_KLM_DataManager.Instance.tutorialIdx == 9 && this.dividerCount == 3) {
                EventManager.Scene.emit(XCT_Events.HandAnimation_End);
                XCT_KLM_DataManager.Instance.tutorialIdx++;
            }

            this.pieceNodes[dividerIndex].getChildByName("before").active = false;
            this.pieceNodes[dividerIndex].getChildByName("after").active = true;

            if (dividerIndex == 1 || dividerIndex == 2) {
                this.pieceNodes[dividerIndex + 1].getChildByName("before").active = false;
                this.pieceNodes[dividerIndex + 1].getChildByName("after").active = true;
            }
        }
    }


    /** 触摸结束：重置状态 */
    private onTouchEnd(event: Touch): void {
        if (!this.isCanMove) return;

        // const uiTrans = this.targetArea.getComponent(UITransform);
        // const isInside = uiTrans.getBoundingBoxToWorld().contains(v2(this.node.getWorldPosition().x, this.node.getWorldPosition().y))

        // if (isInside) {
        //     // let pieNode = instantiate(this.piePrefab);
        //     // pieNode.parent = this.targetArea.getChildByName("Contanter");
        //     // // pieNode.setWorldPosition(this.targetPos);
        //     // pieNode.active = true;
        //     this.node.setWorldPosition(this.startPos);
        //     // this.node.getChildByName('selected').active = false;
        // }else{
        //     this.node.setWorldPosition(this.startPos);
        //     // this.node.getChildByName('selected').active = false;
        // }
        this.node.setWorldPosition(this.startPos);
    }
}


