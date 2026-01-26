import { _decorator, Component, log, Node, v3, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('SJZXD_FollowCamera')
export class SJZXD_FollowCamera extends Component {
    public FindNode: Node = null;


    @property
    public followSpeed: number = 1.0; // 跟随速度，值越小越快



    start() {

    }

    update(deltaTime: number) {
        if (this.FindNode && this.FindNode.isValid) {
            // 使用插值平滑移动相机到目标位置
            const pos: Vec3 = v3();
            Vec3.lerp(pos, this.node.worldPosition.clone(), this.FindNode.worldPosition.clone(), this.followSpeed * deltaTime);
            // 限制X轴范
            pos.x = Math.max(-100, Math.min(2500, pos.x));
            // 限制Y轴范围
            pos.y = Math.max(-1410, Math.min(2500, pos.y));
            this.node.worldPosition = v3(pos.x, pos.y, 1000)
        }
    }
}


