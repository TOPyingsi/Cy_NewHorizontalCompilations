import { _decorator, Collider2D, Component, Contact2DType, IPhysics2DContact, Node, v3 } from 'cc';
import { XSHZ_Unit } from './XSHZ_Unit';
import { XSHZ_AudioManager } from './XSHZ_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('XSHZ_TongLing')
export class XSHZ_TongLing extends Component {
    @property()
    public Attack: number = 0;//基础伤害倍率
    @property()
    AudioName: string = "";//命中的时候声音
    public AttackNode: Node = null;//释放者

    public IsRight: boolean = true;//是否朝右
    start() {
        this.node.getChildByName("碰撞").getComponents(Collider2D).forEach((boxcollider: Collider2D) => {
            boxcollider.on(Contact2DType.BEGIN_CONTACT, this.AttackHurt, this)
        })

    }
    //初始化属性
    Init(AttackNode: Node, attack: number, IsRight: boolean) {
        this.AttackNode = AttackNode;
        this.Attack *= attack;
        this.IsRight = IsRight;
        this.node.scale = v3(this.IsRight ? this.node.scale.x : -this.node.scale.x, this.node.scale.y, this.node.scale.z);
    }
    AttackHurt(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (otherCollider && otherCollider.node != this.AttackNode) {//是敌人
            if (this.AudioName != "") {
                XSHZ_AudioManager.globalAudioPlay(this.AudioName);
            }
            otherCollider.node.getComponent(XSHZ_Unit).Hurt(this.Attack);
        }
    }

    //动画结束帧事件
    AnimationStop() {
        this.node.destroy();
    }
}


