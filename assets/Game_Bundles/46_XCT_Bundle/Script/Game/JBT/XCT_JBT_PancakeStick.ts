import { _decorator, Component, Node, Vec2, Input, EventTouch, UITransform, math, Vec3, Sprite, Touch, v2, instantiate } from 'cc';
import { XCT_JBT_DataManager } from '../../Manager/XCT_JBT_DataManager';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { XCT_Events } from '../../Common/XCT_Events';
import { XCT_AudioManager } from '../../Manager/XCT_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('XCT_JBT_PancakeStick')
export class XCT_JBT_PancakeStick extends Component {
    @property(Node)
    pan: Node = null; // 锅子节点
    // @property(Node) 
    piePrefabsContainer: Node = null; // 所有转圈节点

    pieNodesContanter: Node = null;

    currentPieNode: Node = null;

    private panCenter: Vec2 = Vec2.ZERO; // 锅子中心点
    // private isTouching: boolean = false; // 是否处于触摸中
    private startAngle: number = 0; // 初始角度（0~1.0）
    private endAngle: number = 0; // 结束角度（0~1.0）
    private currentTransfer: number = 0; // 旋转圈数计数
    totalAngle: number = 0; // 总角度

    private touchIndex = -1;
    private nodeIndex = 0;
    private touchAngles: number[][] = [];

    private lastAngle: number = 0;

    private doughNum: number = 0;

    protected onLoad(): void {

        if (!XCT_JBT_DataManager.Instance.eggIngredientTypeTransfer[XCT_JBT_DataManager.Instance.currentEggIngredientType]) {
            XCT_JBT_DataManager.Instance.eggIngredientTypeTransfer[XCT_JBT_DataManager.Instance.currentEggIngredientType] = [0];
        }
        else {
            XCT_JBT_DataManager.Instance.eggIngredientTypeTransfer[XCT_JBT_DataManager.Instance.currentEggIngredientType].push(0)
        }
        this.doughNum = XCT_JBT_DataManager.Instance.eggIngredientTypeTransfer[XCT_JBT_DataManager.Instance.currentEggIngredientType].length - 1;

        this.addListener();
        // this.node.active = false;
        // 更新T型杆旋转角度（弧度）
        this.piePrefabsContainer.children.forEach((node, index) => {
            node.active = false;
            const sprite = node.getComponent(Sprite);
            sprite.fillStart = 0;
            sprite.fillRange = 0;
        })
        // 获取锅子中心点（世界坐标）
        this.panCenter = new Vec2(this.pan.worldPosition.x, this.pan.worldPosition.y);
        this.initPancakeStick();
    }

    setPiePrefabs(piePrefabsContainer: Node, pieNodesContanter: Node) {
        this.piePrefabsContainer = piePrefabsContainer;
        this.pieNodesContanter = pieNodesContanter;
    }

    /** 触摸开始：初始化角度 */
    private onTouchStart(event: Touch): void {
        if (!this.piePrefabsContainer || !this.pieNodesContanter) {
            return;
        }
        const touchPos = event.getUILocation(); // 触摸点世界坐标

        const startAngle = this.calcAngleRatio(touchPos); // 当前角度（0~1.0）
        const rotationRad = startAngle * Math.PI * 2; // 0~1.0 → 0~2π
        this.node.eulerAngles = new Vec3(0, 0, rotationRad * 180 / Math.PI);
        this.startAngle = startAngle;
        this.endAngle = this.startAngle; // 初始化结束角度
        this.lastAngle = startAngle;
        this.touchIndex++;
        this.touchAngles.push([]);
        this.getNewPieNode(true);
        XCT_AudioManager.getInstance().playLongSound("刮板");
    }


    /** 触摸移动：实时更新角度和旋转 */
    private onTouchMove(event: Touch): void {
        const touchPos = event.getUILocation(); // 触摸点世界坐标

        const currentRatio = this.calcAngleRatio(touchPos); // 当前角度（0~1.0）
        // 更新T型杆旋转角度（弧度）
        const rotationRad = currentRatio * Math.PI * 2; // 0~1.0 → 0~2π
        this.node.eulerAngles = new Vec3(0, 0, rotationRad * 180 / Math.PI);

        let lastDiff = currentRatio - this.lastAngle;
        let direction = lastDiff < 0;//正逆负顺

        let lastTransfer = this.currentTransfer;
        this.updateTotalAngle();
        //总度数超过1圈，更新预制体
        if (lastTransfer !== this.currentTransfer) {
            this.getNewPieNode();
            if (direction) {
                this.endAngle = this.startAngle;
            }
            else {
                this.startAngle = this.endAngle;
            }
        }

        //过0界了
        if (Math.abs(lastDiff) > 0.5) {
            direction = lastDiff > 0;//负逆正顺
            if (direction) {
                this.startAngle = 0;
            } else {
                this.endAngle = 1;
            }
            this.updatePieNodeSprite();

            this.getNewPieNode();
            // this.startAngle = currentRatio;
            if (direction) {
                this.endAngle = this.startAngle = 1;
            } else {
                this.startAngle = this.endAngle = 0;
            }
        }

        let diff = currentRatio - this.startAngle;
        direction = diff < 0;//正逆负顺

        if (direction) {
            this.startAngle = Math.min(currentRatio, this.startAngle);
        } else {
            this.endAngle = Math.max(currentRatio, this.endAngle);
        }
        this.lastAngle = currentRatio;
        this.updatePieNodeSprite();
    }

    /** 触摸结束：重置状态 */
    private onTouchEnd(): void {
        if(XCT_JBT_DataManager.Instance.playerData.currentDay == 1 &&!XCT_JBT_DataManager.Instance.isTutorialEnd){
            if (XCT_JBT_DataManager.Instance.tutorialIdx !== 1 && XCT_JBT_DataManager.Instance.tutorialIdx !== 3) {
                return;
            }
        }

        // if(XCT_AudioManager.getInstance().getSoundState()){
        XCT_AudioManager.getInstance().stopLongSound();
        // }
        //trans =totalAngle保留一位小数
        let trans = parseFloat(this.totalAngle.toFixed(1));
        XCT_JBT_DataManager.Instance.eggIngredientTypeTransfer[XCT_JBT_DataManager.Instance.currentEggIngredientType][this.doughNum] = trans;


        //更新步骤
        let totalRotateCount = 0;
        XCT_JBT_DataManager.Instance.eggIngredientTypeTransfer[XCT_JBT_DataManager.Instance.currentEggIngredientType].forEach(rotateCount => {
            totalRotateCount += rotateCount;
        });

        if (totalRotateCount > 0.6) {
            XCT_JBT_DataManager.Instance.currentCookedSteps.push(XCT_JBT_DataManager.Instance.currentEggIngredientType);
            if (XCT_JBT_DataManager.Instance.tutorialIdx == 1 || XCT_JBT_DataManager.Instance.tutorialIdx == 3) {
                EventManager.Scene.emit(XCT_Events.HandAnimation_End);
                XCT_JBT_DataManager.Instance.tutorialIdx++;
            }
        }
    }

    /** 计算触摸点与中心点连线的角度（转为0~1.0范围） */
    private calcAngleRatio(touchPos: Vec2): number {
        // 计算触摸点相对锅中心的偏移向量
        const dir = new Vec2(touchPos.x - this.panCenter.x, touchPos.y - this.panCenter.y);
        // 计算角度（弧度）：正右为0，逆时针增加，顺时针减小
        let rad = Math.atan2(dir.y, dir.x); // 范围：-π ~ π
        // 转换为0~2π范围
        if (rad < 0) rad += 2 * Math.PI;
        // 转为0~1.0比例
        return rad / (2 * Math.PI);
    }

    updateTotalAngle() {
        let curentAngel = this.endAngle - this.startAngle;
        this.touchAngles[this.touchIndex][this.nodeIndex] = curentAngel;
        this.totalAngle = 0;
        this.touchAngles.forEach((nodeAngles) => {
            nodeAngles.forEach((nodeAngle) => {
                this.totalAngle += nodeAngle;
            })
        })

        this.currentTransfer = Math.floor(this.totalAngle); // 圈数+1
        console.log("总角度：" + this.totalAngle, "总圈数:" + this.currentTransfer)
    }

    getNewPieNode(isNewTouch = false) {
        let minIndex = Math.min(this.currentTransfer, this.piePrefabsContainer.children.length - 1);
        let piePrefab = this.piePrefabsContainer.children[minIndex];
        let prefabNode = instantiate(piePrefab);
        prefabNode.setParent(this.pieNodesContanter);
        prefabNode.setWorldPosition(this.pieNodesContanter.worldPosition);
        prefabNode.active = true;
        this.currentPieNode = prefabNode;
        if (isNewTouch) {
            this.nodeIndex = 0;
        }
        else {
            this.nodeIndex++;
        }
        this.touchAngles[this.touchIndex].push(1);
    }

    updatePieNodeSprite() {
        let sprite = this.currentPieNode.getComponent(Sprite);
        sprite.fillStart = this.startAngle;
        sprite.fillRange = this.endAngle - this.startAngle;
    }


    // /** 点击所有食材 */
    // private onCancel_Click(){
    //     // this.isTouching = false;
    //     this.node.active = false;
    //    
    //     this.removeTouchListener();
    // }

    private initPancakeStick() {
        // this.isTouching = true;
        this.node.active = true;
        this.touchAngles = [];
        this.touchIndex = -1;
        this.nodeIndex = 0;
        this.currentTransfer = 0;
        this.totalAngle = 0;
        this.addTouchListener();
    }

    addTouchListener() {
        // 注册触摸事件
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    removeTouchListener() {
        this.node.off(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.off(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.off(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.off(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    private addListener() {
        // EventManager.on(XCT_Events.JBT_Cancel_All_Ingredients, this.onCancel_Click, this);
        // EventManager.on(XCT_Events.JBT_Show_Pancake_Stick, this.onShowPancakeStick, this);
    }

    private removeListener() {
        // EventManager.off(XCT_Events.JBT_Cancel_All_Ingredients, this.onCancel_Click, this);
    }

    onDestroy() {
        this.removeListener();
    }
}