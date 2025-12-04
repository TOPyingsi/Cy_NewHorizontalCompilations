import { _decorator, Component, Node, Sprite, SpriteFrame, tween, v3, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('XCT_JP_Customer')
export class XCT_JP_Customer extends Component {
    public orderId: string = '';
    public personId: number = 1;
    private targetWorldPos: Vec3 = Vec3.ZERO;
    private speed: number = 500;

    @property(SpriteFrame)
    customerSps: SpriteFrame[] = [];

    spNode: Node = null;

    onLoad() {
        this.spNode = null;
    }

    // 行走动画（空实现）
    walk(pathNode: Node[], walkEnd: Function = null, speed: number = 500) {
        let moveSpeed = speed || this.speed;
        let targetNode = pathNode[0];
        pathNode.splice(0, 1);
        let targetPos = targetNode.worldPosition;
        let targetScale = targetNode.scale;
        let time = Vec3.distance(this.node.worldPosition, targetPos) / moveSpeed;
        // 实际项目中添加Tween动画
        let moveTween = () => {
            tween(this.node)
                .to(time, { worldPosition: targetPos }) // 2秒到达目标位置
                .call(() => {
                    if (pathNode.length > 0) {
                        targetNode = pathNode[0];
                        pathNode.splice(0, 1);
                        targetPos = targetNode.worldPosition;
                        targetScale = targetNode.scale;
                        time = Vec3.distance(this.node.worldPosition, targetPos) / moveSpeed;
                        moveTween();
                    }
                    else {
                        walkEnd && walkEnd();
                    }
                })
                .start();
            tween(this.node)
                .to(time, { scale: v3(targetScale.x, targetScale.y, 1) })
                .start();
        }

        moveTween();

    }

    // 跑步动画（空实现）
    run(target: Vec3) {
        this.targetWorldPos = target;
        console.log(`顾客${this.personId}向${target}奔跑`);
        // 实际项目中添加Tween动画
    }

    setSP(spName: string) {
        let spContainer = this.node.getChildByName("spNode");
        spContainer.children.forEach((child: Node) => {
            child.active = false;
        })
        this.spNode = spContainer.getChildByName(spName);
        if (this.spNode) {
            this.spNode.getChildByName("smile").active = true;
            this.spNode.getChildByName("angry").active = false;
            this.spNode.getChildByName("moneyNode").active = true;
            this.spNode.getChildByName("packedNode").active = false;
            this.spNode.getChildByName("hand").active = true;
        }
        this.spNode.active = true;
        this.node.active = true;
    }

    setAngry() {
        if (this.spNode) {
            this.spNode.getChildByName("smile").active = false;
            this.spNode.getChildByName("angry").active = true;
        }
    }

    setPacked() {
        if (this.spNode) {
            this.spNode.getChildByName("moneyNode").active = false;
            this.spNode.getChildByName("packedNode").active = true;
            this.spNode.getChildByName("hand").active = true;
        }
    }

    // 显示顾客
    show() {
        // this.node.getComponentInChildren(Sprite).spriteFrame = this.customerSps[this.personId]; // 假设personId从1开始，对应customerSps数组的索引
        this.node.active = true;
    }

    // 隐藏顾客
    hide() {
        this.node.active = false;
    }
}