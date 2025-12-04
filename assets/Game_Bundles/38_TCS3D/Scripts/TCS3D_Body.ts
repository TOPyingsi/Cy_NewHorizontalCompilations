import { _decorator, Component, Node, v3, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('TCS3D_Body')
export class TCS3D_Body extends Component {
    public preNode: Node = null;
    public lastPosition: Vec3 = new Vec3();

    start() {
        // 初始化上一帧位置
        // Vec3.copy(this.lastPosition, this.node.worldPosition);
    }

    update(deltaTime: number) {
        // 保存当前位置作为下一帧的上一帧位置
        if (this.isInit) {
            Vec3.copy(this.lastPosition, this.node.worldPosition);
        }
    }

    isInit: boolean = false;
    init(node: Node) {
        //初始化偏移
        this.preNode = node;
        this.node.worldPosition = this.preNode.worldPosition.clone().add(v3(-0.3, 0, -0.3));

        Vec3.copy(this.lastPosition, this.node.worldPosition);

        this.isInit = true;
    }
    // 跟随目标位置
    followTarget(targetPos: Vec3) {
        this.node.worldPosition = targetPos;
    }
}


