import { _decorator, Component, Graphics, instantiate, Mask, Node, Touch, v3, Vec3 } from 'cc';
import { XCT_Events } from '../../Common/XCT_Events';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { XCT_JBT_DataManager } from '../../Manager/XCT_JBT_DataManager';
const { ccclass, property } = _decorator;

@ccclass('XCT_JBT_Completed')
export class XCT_JBT_Completed extends Component {

    @property(Node)
    maskNode: Node = null;

    @property(Node)
    touchBtn: Node = null;

    @property(Node)
    guideContainer: Node = null;

    @property(Node)
    completedContainer: Node = null;

    completedContainerPrefab: Node = null;

    startY: number = 0;

    distance: number = 0;

    startPos: Vec3 = new Vec3();

    protected onLoad(): void {
        this.addListener();
        this.completedContainerPrefab = this.node.getChildByName("completedContainerPrefab");
        this.completedContainerPrefab.active = false;

        this.touchBtn.active = false;
        this.guideContainer.children.forEach((node: Node) => {
            node.active = false;
        })
    }

    /** 触摸开始：初始化角度 */
    private onTouchStart(event: Touch): void {
        const touchPos = event.getUILocation(); // 触摸点世界坐标
        this.startY = touchPos.y;
        this.startPos = this.touchBtn.position;
    }


    /** 触摸移动：实时更新角度和旋转 */
    private onTouchMove(event: Touch): void {
        const touchPos = event.getUILocation(); // 触摸点世界坐标
        this.touchBtn.setWorldPosition(new Vec3(touchPos.x, touchPos.y, 0));

    }

    /** 触摸结束：重置状态 */
    private onTouchEnd(event: Touch): void {
        const touchPos = event.getUILocation(); // 触摸点世界坐标
        const deltaY = this.startY - touchPos.y;
        if (deltaY > 200) {
            this.showPackAnim();
            this.hideGuideAnim();
            this.touchBtn.active = false;
            this.cancelTouchBtn();
        }
        this.touchBtn.setPosition(this.startPos);
    }

    showPackAnim() {
        this.maskNode.getComponent(Graphics).enabled = true;
        this.maskNode.getComponent(Mask).enabled = true;
        // this.completedContainer.children[0].active = false;
        // this.scheduleOnce(()=>{
        //     this.completedContainer.children[1].active = false;
        // }, 0.5);
        let completedContainerNode = instantiate(this.completedContainerPrefab);
        completedContainerNode.parent = this.completedContainer;
        completedContainerNode.setPosition(v3(0, 0, 0));
        completedContainerNode.active = true;
        completedContainerNode.children.forEach((node: Node) => {
            node.active = true;
        })
    }

    showGuideAnim() {
        this.guideContainer.children.forEach((node: Node) => {
            node.active = true;
        })
    }

    hideGuideAnim() {
        this.guideContainer.children.forEach((node: Node) => {
            node.active = false;
        })
    }

    private onClick(): void {
        if (!XCT_JBT_DataManager.Instance.currentCookedSteps.includes("白面团") && !XCT_JBT_DataManager.Instance.currentCookedSteps.includes("土豆面")) {
            EventManager.Scene.emit(XCT_Events.showTip, "请先摊好面皮");
            return;
        }
        if (!XCT_JBT_DataManager.Instance.currentCookedSteps.includes("鸡蛋")) {
            EventManager.Scene.emit(XCT_Events.showTip, "请先摊好面皮");
            return;
        }
        if (!XCT_JBT_DataManager.Instance.currentCookedSteps.includes("调味酱") && !XCT_JBT_DataManager.Instance.currentCookedSteps.includes("辣椒酱")) {
            EventManager.Scene.emit(XCT_Events.showTip, "要先抹好调味酱，才能撒配料哦！");
            return;
        }
        let hasIngredient = false;
        let ingredients = ["培根", "油条", "烤肠", "牛肉", "生菜", "红枣", "辣条", "薄脆", "鸭腿", "黄瓜", "葱花", "香菜"]
        XCT_JBT_DataManager.Instance.currentCookedSteps.forEach((ingredient: string) => {
            if (hasIngredient) return;
            if (ingredients.includes(ingredient)) {
                hasIngredient = true;
            }
        })
        if (!hasIngredient) {
            EventManager.Scene.emit(XCT_Events.showTip, "要先撒上配料，才能卷饼哦！");
            return;
        }
        
        if(XCT_JBT_DataManager.Instance.playerData.currentDay == 1 &&!XCT_JBT_DataManager.Instance.isTutorialEnd){
            if (XCT_JBT_DataManager.Instance.tutorialIdx !== 12) {
                return;
            }
        }

        EventManager.Scene.emit(XCT_Events.JBT_Cancel_All_Ingredients);
        XCT_JBT_DataManager.Instance.isPacked = true;
        XCT_JBT_DataManager.Instance.currentCookedSteps.push("卷饼");
        if (XCT_JBT_DataManager.Instance.tutorialIdx == 12) {
            EventManager.Scene.emit(XCT_Events.HandAnimation_End);
            XCT_JBT_DataManager.Instance.tutorialIdx++;
        }
        this.showPackAnim();
        this.hideGuideAnim();
        // this.touchBtn.active = true;
        // this.touchBtn.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        // this.touchBtn.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        // this.touchBtn.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        // this.touchBtn.on(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    private cancelTouchBtn() {
        this.touchBtn.off(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.touchBtn.off(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.touchBtn.off(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.touchBtn.off(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    private addListener() {
        this.node.on("click", this.onClick, this);
    }

    private removeListener() {
        this.node.off("click", this.onClick, this);
    }

    onDestroy(): void {
        this.removeListener();
    }
}


