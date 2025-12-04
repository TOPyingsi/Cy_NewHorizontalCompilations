import { _decorator, Component, EventTouch, Input, instantiate, Node, Prefab, UITransform, v3, Vec2, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('XCT_KLM_SauceLayer2')
export class XCT_KLM_SauceLayer2 extends Component {
    pan: Node = null; // 锅子节点
    breshPrefab: Prefab = null; // 刷子节点
    breshNode: Node = null; // 刷子节点实例
    toolsLayer: Node = null; // 工具层节点

    @property(Prefab)
    maskPointPrefab: Prefab = null; // 遮罩点预制体

    @property(Node)
    maskPointContainer: Node = null; // 遮罩点容器节点




    isTouching: boolean = false; // 是否正在触摸
    daubInterval: number = 0.1; // 每次点击间隔时间（秒）
    daubTimer: number = 0; // 上次点击时间（秒）

    isCanDaub: boolean = true; // 是否可以点击

    count: number = 0; // 点击次数

    protected onLoad(): void {
        // 获取锅子中心点（世界坐标）
        // const panUITrans = this.pan.getComponent(UITransform);
        // this.panCenter = new Vec2(this.pan.worldPosition.x, this.pan.worldPosition.y);

        // 注册触摸事件
        this.node.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(Input.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    init(pan: Node, breshNode: Prefab, toolsLayer: Node) {
        this.pan = pan;
        this.breshPrefab = breshNode;
        this.toolsLayer = toolsLayer;
    }

    /** 触摸开始：初始化角度 */
    private onTouchStart(event: EventTouch): void {
        this.isTouching = false;
        this.daubTimer = 0;
        // if(!this.isCanDaub)return;
        const touchPos = event.getLocation(); // 触摸点世界坐标
        this.breshNode = instantiate(this.breshPrefab);
        this.breshNode.parent = this.toolsLayer;
        this.breshNode.setWorldPosition(v3(touchPos.x, touchPos.y, 0));

        const uiTrans = this.pan.getComponent(UITransform);
        const localPos = uiTrans.convertToNodeSpaceAR(new Vec3(touchPos.x, touchPos.y, 0));
        const width = uiTrans.width;
        const height = uiTrans.height;
        const isInside = Math.abs(localPos.x) <= width / 2 && Math.abs(localPos.y) <= height / 2;

        if (!isInside) return;
        this.isCanDaub = false;
        this.createMaskPoint(touchPos);
        // const panWorldPos = this.pan.getWorldPosition();
        // const distance = touchPos.subtract(new Vec2(panWorldPos.x, panWorldPos.y)).length();
        // if (distance <= panUITrans.width / 2) { // 锅
        //     this.isTouching = true;
        //     // 计算初始角度（0~1.0）
        //     this.startAngle = this.calcAngleRatio(touchPos);
        //     this.endAngle = this.startAngle; // 初始化结束角度
        // }
    }

    /** 触摸移动：实时更新角度和旋转 */
    private onTouchMove(event: EventTouch): void {
        if (!this.isCanDaub) return;
        const touchPos = event.getLocation();
        if (!this.breshNode) return;
        this.breshNode.setWorldPosition(v3(touchPos.x, touchPos.y, 0));

        const uiTrans = this.pan.getComponent(UITransform);
        const localPos = uiTrans.convertToNodeSpaceAR(new Vec3(touchPos.x, touchPos.y, 0));
        const width = uiTrans.width;
        const height = uiTrans.height;
        const isInside = Math.abs(localPos.x) <= width / 2 && Math.abs(localPos.y) <= height / 2;

        if (!isInside) return;
        this.isCanDaub = false;
        this.createMaskPoint(touchPos);

        // const currentRatio = this.calcAngleRatio(touchPos); // 当前角度（0~1.0）

        // // 更新T型杆旋转角度（弧度）
        // const rotationRad = currentRatio * Math.PI * 2; // 0~1.0 → 0~2π
        // this.node.eulerAngles = new Vec3(0, 0, rotationRad * 180 / Math.PI); 

        // // 处理角度范围逻辑
        // if (currentRatio > 0 && currentRatio < this.startAngle) {
        //     // 更新起始角度为当前值
        //     const oldStart = this.startAngle;
        //     this.startAngle = currentRatio;
        //     // 结束角度取最大值
        //     this.endAngle = Math.max(this.endAngle, oldStart);
        //     // 计算角度差，判断是否完成一圈
        //     const angleDiff = this.endAngle - this.startAngle;
        //     if (angleDiff <= 0) {
        //         this.currentTransfer++; // 圈数+1
        //         this.startAngle = currentRatio; // 重置起始角度
        //         this.endAngle = 0; // 重置结束角度
        //     }
        // } else {
        //     // 未跨0点，直接更新结束角度
        //     this.endAngle = currentRatio;
        // }
    }


    /** 触摸结束：重置状态 */
    private onTouchEnd(): void {
        this.isTouching = false;
        console.log('点击次数:', this.count);
        this.breshNode.destroy();
    }

    private createMaskPoint(touchPos: Vec2) {
        this.count++;
        const maskPoint = instantiate(this.maskPointPrefab);
        maskPoint.parent = this.maskPointContainer;
        let sourcePos = maskPoint.getChildByName('SourceSp');
        sourcePos.setParent(this.maskPointContainer);
        sourcePos.setPosition(v3(0, 0, 0));
        maskPoint.setPosition(v3(touchPos.x, touchPos.y, 0));
        let sourceWorldPos = sourcePos.getWorldPosition();
        sourcePos.setParent(maskPoint);
        sourcePos.setPosition(v3(sourceWorldPos.x, sourceWorldPos.y, 0));
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


