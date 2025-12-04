import { _decorator, Component, Color, color, Collider2D, Animation, tween, BoxCollider2D, AnimationState, v3, Contact2DType, IPhysics2DContact, UIOpacity, sp, Prefab, instantiate } from 'cc';
import ZWDZJS_ZhiWu from '../植物/ZWDZJS_ZhiWu';
import ZWDZJS_GameManager from '../ZWDZJS_GameManager';
import { SkeletonManager } from '../../../../Scripts/Framework/Managers/SkeletonManager';
import ZWDZJS_GameDate from '../ZWDZJS_GameDate';
import { ZWDZJS_Incident } from '../ZWDZJS_Incident';
const { ccclass, property } = _decorator;



@ccclass('ZWDZJS_JiangShi')
export default class ZWDZJS_JiangShi extends Component {
    @property
    Hp: number = 100;//默认100
    @property
    Speed: number = 20;//速度(每秒移动像素)
    @property
    attack: number = 10;//默认伤害
    public InLine: 0;//所在行
    public ZhuanTai: number = 0;//状态0移动1碰到植物2.死亡3.进家门4.正在吃植物
    private SuoDingZhiWu: ZWDZJS_ZhiWu = null;//锁定植物

    boxcollider: Collider2D = null;
    private _speed: number = 20;//实际速度

    public AnimationName: string[] = ["Move", "Attack", "Die"];//


    public _skeleton: sp.Skeleton = null;

    onLoad() {

    }
    start() {
        this._skeleton = this.node.getChildByName("龙骨").getComponent(sp.Skeleton);
        this.Init();
    }
    Init() {
        this._speed = this.Speed;
        this.boxcollider = this.node.getComponent(BoxCollider2D);
        this.boxcollider.on(Contact2DType.BEGIN_CONTACT, (selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) => {
            this.onCollisionEnter(otherCollider, selfCollider);
        })
        this.boxcollider.on(Contact2DType.END_CONTACT, (selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) => {
            this.onCollisionExit(otherCollider, selfCollider);
        })
    }
    protected update(dt: number): void {
        if (this.ZhuanTai == 0) {
            //移动
            this.Move(dt);
        }
        if (this.ZhuanTai == 1) {
            //吃植物
            this.Attack();
        }

    }


    onCollisionEnter(other: Collider2D, self) {

        if (other.tag == 100) {//植物
            console.log("有植物");
            this.SuoDingZhiWu = other.node.getComponent(ZWDZJS_ZhiWu);
            this.ZhuanTai = 1;
        }
        if (other.tag == 4) {//家门
            this.ZhuanTai = 3;
            this.Hp = 999999;
            ZWDZJS_GameManager.Instance.JianShiPause();
            SkeletonManager.play_Animation(this._skeleton, this.AnimationName[0], true);
            ZWDZJS_GameManager.Instance.PlayAudio(14);
            tween(this.node)
                .to(1.5, { position: other.node.position })
                .by(2, { position: v3(-240, 0, 0) })
                .call(() => {
                    ZWDZJS_GameManager.Instance.hint(3, 3, null);
                })
                .start();
        }
    }
    onCollisionExit(other, self) {
        if (this.ZhuanTai == 2) return;
        if (this.SuoDingZhiWu && other.tag == 100 && other.node == this.SuoDingZhiWu.node) {//植物
            console.log("离开植物");
            SkeletonManager.play_Animation(this._skeleton, this.AnimationName[0], true);
            this.ZhuanTai = 0;
        }
    }
    //    //移动接口
    Move(dt: number) {

    }
    //    //攻击接口
    Attack() {

    }
    //    //受到伤害
    SufferHarm(Attack: number) {
        this.Hp -= Attack;
        this.node.getComponent(UIOpacity).opacity = 100;//受击特效
        this.scheduleOnce(() => {
            this.node.getComponent(UIOpacity).opacity = 255
        }, 0.1)
        if (this.Hp <= 0) {
            this.ZhuanTai = 2;
            if (ZWDZJS_GameDate.GetIsCanSkii()) {
                let num = Math.random() * 100;
                if (num <= 5) {
                    ZWDZJS_Incident.Loadprefab("PreFab/金铲铲").then((pre: Prefab) => {
                        let nd = instantiate(pre);
                        nd.setParent(ZWDZJS_GameManager.Instance.UI.getChildByName("阳光层"));
                        nd.setWorldPosition(this.node.getWorldPosition().clone());
                    })
                }
            }
            this.node.getComponent(BoxCollider2D).enabled = false;
            this._skeleton?.clearAnimation();
            if (this.AnimationName[2]) {
                this._skeleton?.setCompleteListener(null);
                SkeletonManager.play_Animation(this._skeleton, this.AnimationName[2], false, (() => {
                    this.Delete();
                }));
                this._speed = 0;
            } else {
                this.Delete();
            }

        }
    }
    //    //销毁自身
    Delete() {
        ZWDZJS_GameManager.Instance.Delet_JiangShi(this.node);
    }
    //    //造成伤害
    Harm(zhiwu: ZWDZJS_ZhiWu, attack: number) {
        zhiwu.SufferHarm(attack);
    }
    //    // update (dt) {}
    //    //通常形式的攻击
    Attack_Putong() {
        if (this.ZhuanTai == 2) return;
        SkeletonManager.play_Animation(this._skeleton, this.AnimationName[1], true, () => {
            if (this.node) {
                this.OnHarm();
            }
        });
    }
    //    //帧事件_造成伤害
    OnHarm() {
        ZWDZJS_GameManager.Instance.PlayAudio(6);
        this.Harm(this.SuoDingZhiWu, this.attack);
    }
    //    //通常形的移动方式
    Move_PuTong(dt: number) {
        this.node.position = this.node.position.subtract(v3(this._speed * dt, 0, 0));
    }
    //    //异况----------------------------------------
    //    //停止
    Stop() {
        this._speed = 0;

    }
    //    //击退
    repel(distance: number = 50, _time: number = 0.3) {
        tween(this.node)
            .by(_time, { position: v3(distance, 0, 0) })
            .start();
    }
    //    //减速
    slowdown(ratio: number = 0.5, _time: number = 1) {
        this.SetShader(color(0, 15, 255), 0.4);
        this._speed = this.Speed *= ratio;
        this.scheduleOnce(() => {
            this.SetShader(color(255, 255, 255), 1);
            this._speed = this.Speed;
        }, _time)
    }
    //    //设置基础渲染
    SetShader(color: Color, rate: number) {
        // this._color = color;
        // this._rate = rate;
        // this._material.setProperty("u_color", this._color);
        // this._material.setProperty("u_rate", this._rate);
    }
    //    //冰冻：0,15,255  - 0.4
}
