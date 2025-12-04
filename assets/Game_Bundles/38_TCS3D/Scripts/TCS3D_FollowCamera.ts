import { _decorator, Component, director, Node, Quat, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('TCS3D_FollowCamera')
export class TCS3D_FollowCamera extends Component {

    private startPos: Vec3 = null;
    private startRot: Quat = null;

    private _target: Node = null;
    set target(value: Node) {
        this._target = value;
    }

    private _sub: Vec3 = Vec3.ZERO;
    get sub(): Vec3 {
        return this._sub;
    }

    start() {
        this.startPos = this.node.position.clone();
        this.startRot = this.node.rotation.clone();

        director.getScene().on("贪吃蛇3D_相机跟随玩家", this.SetTarget, this);
    }

    protected update(dt: number): void {

        if (this._target) {
            let pos: Vec3 = this._target.position.clone().add(this._sub);
            this.node.parent.position = pos;
        }
    }

    SetTarget(target: Node) {
        //初始化摄像机
        this.node.position = this.startPos;
        this.node.rotation = this.startRot;

        this._target = target;
        //算出摄像机跟玩家这时候两个点的差值
        this._sub = this.node.worldPosition.clone().subtract(this._target.worldPosition);
    }
}


