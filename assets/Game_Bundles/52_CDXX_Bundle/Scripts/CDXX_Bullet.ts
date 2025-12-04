import { _decorator, Color, Component, director, error, Node, RigidBody2D, Sprite, v2, v3, Vec3 } from 'cc';
import { CDXX_PoolManager } from './CDXX_PoolManager';
const { ccclass, property } = _decorator;

@ccclass('CDXX_Bullet')
export class CDXX_Bullet extends Component {

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
        this.node.setParent(CDXX_PoolManager.Instance.node);
        this.node.setWorldPosition(pos);
        this.Harm = harm;
        this.Icon.color = color;
        this._dirX = dirX;
        this._lifetime = 5;
        this.Node.scale = v3(dirX / Math.abs(dirX), 1, 1);

    }

    RemoveSelf() {
        this.scheduleOnce(() => {
            CDXX_PoolManager.Instance.put(this.node);
        })
    }

    protected update(dt: number): void {
        this._lifetime -= dt;
        if (this._lifetime < 0) {
            CDXX_PoolManager.Instance.put(this.node);
        }

        if (this.RigidBody2D) {
            this.RigidBody2D.linearVelocity = v2(this._dirX * dt, 0);
        }
    }
}


