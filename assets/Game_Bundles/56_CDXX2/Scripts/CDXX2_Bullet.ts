import { _decorator, Color, Component, director, error, Node, RigidBody2D, Sprite, v2, v3, Vec3 } from 'cc';
import { CDXX2_PoolManager } from './CDXX2_PoolManager';
const { ccclass, property } = _decorator;

//“子弹”组件从对象池取出后设定初始位置、伤害值、颜色与飞行方向（X 轴），每帧用 RigidBody2D 驱动匀速直线运动，5 秒超时或手动调用即自动回池。

@ccclass('CDXX2_Bullet')
export class CDXX2_Bullet extends Component {

    @property(Sprite)
    Icon: Sprite = null;

    @property(RigidBody2D)
    RigidBody2D: RigidBody2D = null;

    @property(Node)
    Node: Node = null;

    public Harm: number = 0;
    private _dirX: number = 0;
    private _lifetime: number = 5;

    init(pos: Vec3, harm: number, color: Color, dirX: number) {
        this.node.setParent(CDXX2_PoolManager.Instance.node);
        this.node.setWorldPosition(pos);
        this.Harm = harm;
        this.Icon.color = color;
        this._dirX = dirX;
        this._lifetime = 5;
        this.Node.scale = v3(dirX / Math.abs(dirX), 1, 1);

    }

    RemoveSelf() {
        this.scheduleOnce(() => {
            CDXX2_PoolManager.Instance.put(this.node);
        })
    }

    protected update(dt: number): void {
        this._lifetime -= dt;
        if (this._lifetime < 0) {
            CDXX2_PoolManager.Instance.put(this.node);
        }

        if (this.RigidBody2D) {
            this.RigidBody2D.linearVelocity = v2(this._dirX * dt, 0);
        }
    }
}


