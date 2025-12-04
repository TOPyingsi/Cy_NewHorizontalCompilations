import { _decorator, Animation, Component, instantiate, Node, v3 } from 'cc';
import { XCT_JBT_PancakeStick } from './XCT_JBT_PancakeStick';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { XCT_Events } from '../../Common/XCT_Events';
import { XCT_JBT_DataManager } from '../../Manager/XCT_JBT_DataManager';
const { ccclass, property } = _decorator;


@ccclass('XCT_JBT_Pack')
export class XCT_JBT_Pack extends Component {
    @property(Node)
    touchArea: Node = null;

    packedNodePrefab: Node = null;
    packedNodeContainer: Node = null;

    packAnimation_1: Node = null;
    packAnimation_2: Node = null;


    protected onLoad(): void {
        this.packAnimation_1 = this.node.getChildByName("packAnimation_1");
        this.packAnimation_2 = this.node.getChildByName("packAnimation_2");
        this.packAnimation_1.active = false;
        this.packAnimation_2.active = false;

        this.packedNodePrefab = this.node.getChildByName("packedNodePrefab");
        this.packedNodeContainer = this.node.getChildByName("packedNodeContainer");
        this.packedNodePrefab.active = false;

        this.packedNodeContainer.children.forEach((child) => {
            child.destroy();
        });

        this.onCancel_Click();

        this.addListener();
    }



    pack() {
        this.node.getChildByName("selected").active = false;
        //创建动画
        this.packAnimation_1.active = true;
        let animation = this.packAnimation_1.getComponent(Animation);
        animation.play();
        this.scheduleOnce(() => {
            this.packAnimation_1.active = false;
            EventManager.Scene.emit(XCT_Events.JBT_Pack_Ingredients);
            this.packAnimation_2.active = true;
            animation = this.packAnimation_2.getComponent(Animation);
            animation.play();
            this.scheduleOnce(() => {
                let packedNode = instantiate(this.packedNodePrefab);
                packedNode.parent = this.packedNodeContainer;
                packedNode.active = true;
                // packedNode.setWorldPosition(this.packAnimation_2.getChildByName("pocket").worldPosition);
                this.packAnimation_2.active = false;
                //oooooooooooooooooooooooooooooooooooooooooooo检查订单数量，若还有订单，则
                EventManager.Scene.emit(XCT_Events.JBT_All_Packed);
            }, 0.6);
        }, 0.33);
    }


    /** 触摸开始：初始化角度 */
    private onTouchStart(event: Touch): void {
                
        if(XCT_JBT_DataManager.Instance.playerData.currentDay == 1 &&!XCT_JBT_DataManager.Instance.isTutorialEnd){
            if (XCT_JBT_DataManager.Instance.tutorialIdx !== 14) {
                return;
            }
        }
        
        if (XCT_JBT_DataManager.Instance.tutorialIdx == 14) {
            EventManager.Scene.emit(XCT_Events.HandAnimation_End);
            XCT_JBT_DataManager.Instance.tutorialIdx++;
        }
        this.pack();
    }

    /** 触摸移动：实时更新角度和旋转 */
    private onTouchMove(event: Touch): void {

    }


    /** 触摸结束：重置状态 */
    private onTouchEnd(event: Touch): void {
    }

    onCancel_Click() {
        this.node.getChildByName('selected').active = false;
        this.removeTouchListener();
    }

    private onClick() {
        if (!XCT_JBT_DataManager.Instance.currentCookedSteps.includes("卷饼")) {
            EventManager.Scene.emit(XCT_Events.showTip, "要先卷饼才可以打包哦！");
            return;
        }
        
        if(XCT_JBT_DataManager.Instance.playerData.currentDay == 1 &&!XCT_JBT_DataManager.Instance.isTutorialEnd){
            if (XCT_JBT_DataManager.Instance.tutorialIdx !== 13) {
                return;
            }
        }
        
        EventManager.Scene.emit(XCT_Events.JBT_Cancel_All_Ingredients);
        console.log('点击了' + this.node.name);
        this.node.getChildByName('selected').active = true;
        if (XCT_JBT_DataManager.Instance.tutorialIdx == 13) {
            EventManager.Scene.emit(XCT_Events.HandAnimation_End);
            XCT_JBT_DataManager.Instance.tutorialIdx++;
        }
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

    addListener() {
        EventManager.on(XCT_Events.JBT_Cancel_All_Ingredients, this.onCancel_Click, this);

        this.node.on("click", this.onClick, this);
    }

    removeListener() {
        EventManager.off(XCT_Events.JBT_Cancel_All_Ingredients, this.onCancel_Click, this);
    }

    protected onDestroy(): void {
        this.removeListener();
    }
}


