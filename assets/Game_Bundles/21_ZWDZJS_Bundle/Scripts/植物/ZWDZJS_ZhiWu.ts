import { _decorator, Animation, Collider2D, Component, Contact2DType, IPhysics2DContact, sp, UIOpacity } from 'cc';
import ZWDZJS_GameManager from '../ZWDZJS_GameManager';
import { SkeletonManager } from '../../../../Scripts/Framework/Managers/SkeletonManager';
const { ccclass, property } = _decorator;



@ccclass('ZWDZJS_ZhiWu')
export default class ZWDZJS_ZhiWu extends Component {
    public Hp: number = 100;//生命值
    public Speed: number = 3;//攻击间隔
    public attack: number = 10;//默认攻击
    public InLine: number = 0;//当前所在行
    public Id: number = 0;//植物ID
    public IsCanSkill: boolean = true;//能否使用技能
    public AttackTime: number = 0.5;

    public triggering_condition: boolean = false;//触发攻击条件成立
    public _skeleton: sp.Skeleton = null;
    public AttackNumber: number = 0;//攻击次数
    start() {
        this._skeleton = this.node.getChildByName("龙骨")?.getComponent(sp.Skeleton);
        this.schedule(() => {
            this.PanDuanGongJi();
        }, this.Speed)
        this.node.getComponents(Collider2D).forEach((boxcollider: Collider2D) => {
            boxcollider.on(Contact2DType.BEGIN_CONTACT, (selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) => {
                this.onCollisionEnter(otherCollider, selfCollider);
            })
            boxcollider.on(Contact2DType.END_CONTACT, (selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) => {
                this.onCollisionExit(otherCollider, selfCollider);
            })
        })

    }
    //进入碰撞
    onCollisionEnter(other, self) {


    }
    //离开碰撞
    onCollisionExit(other, self) {

    }




    protected update(dt: number): void {

    }
    //    //判断攻击
    PanDuanGongJi() {
        if (this.Id == 3 || this.Id == 2) {//坚果墙与樱桃炸弹
            return;
        }
        if (this.Id == 1) {//向日葵
            this.AttaCk();
            return;
        }
        if (this.Id == 4 || this.Id == 5) {//卷心菜，高坚果
            if (this.triggering_condition) {
                this.AttaCk();
            }
            return;
        }
        //攻击条件
        if (ZWDZJS_GameManager.Instance.JuLiZhuanTai[this.InLine] > 0) {
            this.AttaCk();
        }

    }
    //    //攻击
    AttaCk() {
        ++this.AttackNumber;
        if (this._skeleton) {
            SkeletonManager.play_Animation(this._skeleton, "gongji", false, () => {
                SkeletonManager.play_Animation(this._skeleton, "daiji", true);
            });
        }

    }
    //    //受到伤害
    SufferHarm(Attack: number) {
        if (!this.node) return;
        this.Hp -= Attack;
        this.node.getComponent(UIOpacity).opacity = 100;//受击特效
        this.scheduleOnce(() => {
            if (!this.node) return;
            this.node.getComponent(UIOpacity).opacity = 255
        }, 0.1)
        if (this.Hp <= 0) {
            ZWDZJS_GameManager.Instance.Delet_ZhiWu(this.node);
        }
    }




    //    //播放攻击音效
    audioPlay_Attack(id: number) {

        // audioEngine.playEffect(ZwdzjjGame.Instance.AudioClips[id], false);
    }

    //释放技能
    Skill() {

    }
}

