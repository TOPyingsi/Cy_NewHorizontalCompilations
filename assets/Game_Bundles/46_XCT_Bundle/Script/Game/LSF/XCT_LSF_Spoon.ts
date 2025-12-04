import { _decorator, Component, Node, Vec2, Input, EventTouch, UITransform, math, Vec3, Sprite, Touch, v2, instantiate, Color, UIOpacity, v3, Animation } from 'cc';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { XCT_Events } from '../../Common/XCT_Events';
import { XCT_LSF_DataManager } from '../../Manager/XCT_LSF_DataManager';
const { ccclass, property } = _decorator;

@ccclass('XCT_LSF_Spoon')
export class XCT_LSF_Spoon extends Component {
    // 效果是以前（面+汤）变透明、现在（面+汤）变实体，
    // 停止移动时，若达标，则隐藏锅面，显示勺汤（锅）+ 面，移动，隐藏勺汤（锅）+ 面 ，显示汤（碗） + 面
    @property(Node)
    pan: Node = null; // 锅子节点
    @property(Node)
    beforeLayer: Node = null; // 之前的层（面+汤）
    @property(Node)
    afterLayer: Node = null; // 之后的层（汤）
    @property(Node)
    water: Node = null; // 水

    @property(Node)
    toolLayer2: Node = null; // 工具层2（勺）

    // @property(Node) 
    // piePrefabsContainer: Node = null; // 所有转圈节点

    // pieNodesContanter: Node = null;

    // currentPieNode:Node = null;

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

    protected onLoad(): void {
        this.addListener();
        // this.node.active = false;
        // 更新T型杆旋转角度（弧度）
        // this.piePrefabsContainer.children.forEach((node,index) => {
        //     node.active = false;
        //     const sprite = node.getComponent(Sprite);
        //     sprite.fillStart = 0;
        //     sprite.fillRange = 0;
        // })
        this.beforeLayer.getChildByName("Contanter").children.forEach((child) => {
            let opacityComp = child.getComponent(UIOpacity);
            opacityComp.opacity = 255;
        })
        this.afterLayer.getChildByName("Contanter").children.forEach((child) => {
            let opacityComp = child.getComponent(UIOpacity);
            opacityComp.opacity = 0;
        })
        this.water.getComponent(UIOpacity).opacity = 255;
        // 获取锅子中心点（世界坐标）
        this.panCenter = new Vec2(this.pan.worldPosition.x, this.pan.worldPosition.y);
        this.initSpoon();
    }

    // setPiePrefabs(piePrefabsContainer:Node,pieNodesContanter:Node){
    //     this.piePrefabsContainer = piePrefabsContainer;
    //     this.pieNodesContanter = pieNodesContanter;
    // }

    /** 触摸开始：初始化角度 */
    private onTouchStart(event: Touch): void {
        // if(!this.piePrefabsContainer || !this.pieNodesContanter){
        //     return;
        // }
        if(XCT_LSF_DataManager.Instance.playerData.currentDay == 1 &&!XCT_LSF_DataManager.Instance.isTutorialEnd){
            let num = [4];
            if (num.indexOf(XCT_LSF_DataManager.Instance.tutorialIdx) == -1) {
                return;
            }
        }


        const touchPos = event.getUILocation(); // 触摸点世界坐标
        this.node.setWorldPosition(new Vec3(touchPos.x, touchPos.y, 0));

        const startAngle = this.calcAngleRatio(touchPos); // 当前角度（0~1.0）
        // const rotationRad = startAngle * Math.PI * 2; // 0~1.0 → 0~2π
        // this.node.eulerAngles = new Vec3(0, 0, rotationRad * 180 / Math.PI); 
        //     this.startAngle = startAngle;
        //     this.endAngle = this.startAngle; // 初始化结束角度
        this.lastAngle = startAngle;
        //     this.touchIndex++;
        //     this.touchAngles.push([]);
        // this.getNewPieNode(true);
    }


    /** 触摸移动：实时更新角度和旋转 */
    private onTouchMove(event: Touch): void {
        const touchPos = event.getUILocation(); // 触摸点世界坐标
        this.node.setWorldPosition(new Vec3(touchPos.x, touchPos.y, 0));

        const currentRatio = this.calcAngleRatio(touchPos); // 当前角度（0~1.0）
        // 更新T型杆旋转角度（弧度）
        const rotationRad = currentRatio * Math.PI * 2; // 0~1.0 → 0~2π
        let rotationNodes = [...this.beforeLayer.getChildByName("Contanter").children, ...this.afterLayer.getChildByName("Contanter").children, this.water];
        rotationNodes.forEach((node) => {
            node.eulerAngles = new Vec3(0, 0, rotationRad * 180 / Math.PI);
        })

        let diff = currentRatio - this.lastAngle;

        if (Math.abs(diff) > 0.5) {
            let direction = diff > 0;//负逆正顺
            if (direction) {
                let diff1 = 1 - currentRatio;
                let diff2 = this.lastAngle;
                diff = diff1 + diff2;
            } else {
                let diff1 = 1 - this.lastAngle;
                let diff2 = currentRatio;
                diff = diff1 + diff2;
            }
        }


        let addOpacity = Math.floor(Math.abs(diff) * 255 / 2);//转2圈

        this.beforeLayer.getChildByName("Contanter").children.forEach((child) => {
            let opacityComp = child.getComponent(UIOpacity);
            let currentOpacity = opacityComp.opacity;
            opacityComp.opacity = Math.max(0, currentOpacity - addOpacity);

        })

        this.afterLayer.getChildByName("Contanter").children.forEach((child) => {
            let opacityComp = child.getComponent(UIOpacity);
            let currentOpacity = opacityComp.opacity;
            opacityComp.opacity = Math.min(255, currentOpacity + addOpacity);
        })

        this.water.getComponent(UIOpacity).opacity = Math.max(0, this.water.getComponent(UIOpacity).opacity - addOpacity);

        // let lastDiff =  currentRatio - this.lastAngle;
        // let direction = lastDiff < 0;//正逆负顺
        // // this.updateTotalAngle();

        //  //过0界了
        //  if(Math.abs(lastDiff) > 0.5){
        //     direction = lastDiff > 0;//负逆正顺
        //     if(direction){
        //         this.startAngle = 0;
        //     }else{
        //         this.endAngle = 1;
        //     }
        //     if(direction){
        //         this.endAngle = this.startAngle = 1;
        //     }else{
        //         this.startAngle = this.endAngle = 0;
        //     }
        // }

        // let diff = currentRatio - this.startAngle;
        // direction = diff < 0;//正逆负顺

        // if(direction){
        //     this.startAngle = Math.min(currentRatio,this.startAngle);
        // }else{
        //     this.endAngle= Math.max(currentRatio,this.endAngle);
        // }
        this.lastAngle = currentRatio;

    }

    /** 触摸结束：重置状态 */
    private onTouchEnd(): void {

        if (this.water.getComponent(UIOpacity).opacity == 0) {
            this.afterLayer.getChildByName("Contanter").getChildByName("Noodle").active = false;
            // this.node.active = false;
            this.node.setParent(this.toolLayer2.getChildByName("Contanter"));
            let spoonMaskNode = this.node.getChildByName("spoonMask");
            spoonMaskNode.active = true;
            this.playSpoonAnimation();

            if (XCT_LSF_DataManager.Instance.tutorialIdx == 4) {
                EventManager.Scene.emit(XCT_Events.HandAnimation_Start);
                XCT_LSF_DataManager.Instance.tutorialIdx++;
            }
        }
        else {
            this.node.active = true;
            this.node.setPosition(v3(0, 0, 0));
        }
    }

    private playSpoonAnimation() {
        this.node.getComponent(Animation).play("spoon_1");
        this.scheduleOnce(() => {
            let spoonMaskNode = this.node.getChildByName("spoonMask");
            spoonMaskNode.active = false;
            EventManager.Scene.emit(XCT_Events.LSF_Change_CookArea);
            this.node.getComponent(Animation).play("spoon_2");
        }, 0.27);
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

    // private updateTotalAngle(){
    //     let curentAngel = this.endAngle - this.startAngle;
    //     this.touchAngles[this.touchIndex][this.nodeIndex] = curentAngel;
    //     this.totalAngle = 0;
    //     this.touchAngles.forEach((nodeAngles)=>{
    //         nodeAngles.forEach((nodeAngle)=>{
    //             this.totalAngle += nodeAngle;
    //         })
    //     })

    //     this.currentTransfer = Math.floor(this.totalAngle); // 圈数+1
    //     console.log("总角度："+this.totalAngle,"总圈数:"+ this.currentTransfer)

    // }



    // private getNewPieNode(isNewTouch = false){
    //     let minIndex = Math.min(this.currentTransfer, this.piePrefabsContainer.children.length - 1);
    //     let piePrefab = this.piePrefabsContainer.children[minIndex];
    //     let prefabNode = instantiate(piePrefab);
    //     prefabNode.setParent(this.pieNodesContanter);
    //     prefabNode.setWorldPosition(this.pieNodesContanter.worldPosition);
    //     prefabNode.active = true;
    //     this.currentPieNode = prefabNode;
    //     if(isNewTouch){
    //         this.nodeIndex = 0;
    //     }
    //     else{
    //         this.nodeIndex++;
    //     }
    //     this.touchAngles[this.touchIndex].push(1);
    // }

    // private updatePieNodeSprite(){
    //     let sprite = this.currentPieNode.getComponent(Sprite);
    //     sprite.fillStart = this.startAngle;
    //     sprite.fillRange = this.endAngle - this.startAngle;
    // }



    private initSpoon() {
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