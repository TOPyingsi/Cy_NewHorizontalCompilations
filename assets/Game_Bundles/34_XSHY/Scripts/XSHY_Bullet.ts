import { _decorator, Animation, Collider2D, Component, Contact2DType, IPhysics2DContact, Node, v3 } from 'cc';
import { XSHY_Unit } from './XSHY_Unit';
import { XSHY_AudioManager } from './XSHY_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('XSHY_Bullet')
export class XSHY_Bullet extends Component {
    @property()
    MaxTime: number = 10;//最大生命周期
    @property()
    Speed: number = 100;//移动速度
    @property()
    AudioName: string = "";//命中的时候声音
    public AttackNode: Node = null;//释放者
    public Attack: number = 0;//伤害
    public IsRight: boolean = true;//是否朝右
    private IsBoom: boolean = false;
    start() {
        this.node.getComponents(Collider2D).forEach((boxcollider: Collider2D) => {
            boxcollider.on(Contact2DType.BEGIN_CONTACT, this.AttackHurt, this)
        })
        this.scheduleOnce(() => {
            this.node.destroy();
        }, this.MaxTime)
    }
    //初始化属性
    Init(AttackNode: Node, attack: number, IsRight: boolean) {
        this.AttackNode = AttackNode;
        this.Attack = attack;
        this.IsRight = IsRight;
        this.node.scale = v3(this.IsRight ? this.node.scale.x : -this.node.scale.x, this.node.scale.y, this.node.scale.z);
    }
    AttackHurt(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (otherCollider && otherCollider.node != this.AttackNode) {//是敌人
            if (this.AudioName != "") {
                XSHY_AudioManager.globalAudioPlay(this.AudioName);
            }
            otherCollider.node.getComponent(XSHY_Unit).Hurt(this.Attack)
            this.IsBoom = true;
            this.scheduleOnce(() => {
                this.PlayAnimation();
                selfCollider.enabled = false;
            })
        }
    }
    protected update(dt: number): void {
        if (this.IsBoom) return;
        if (this.IsRight) {
            this.node.x += this.Speed * dt;
        } else {
            this.node.x -= this.Speed * dt;
        }
    }
    //触发动画
    PlayAnimation() {
        if (this.node.getComponent(Animation)?.getState("Boom")) {
            this.node.getComponent(Animation).play("Boom");
        }
    }
    //动画结束帧事件
    AnimationStop() {
        this.node.destroy();
    }
}


