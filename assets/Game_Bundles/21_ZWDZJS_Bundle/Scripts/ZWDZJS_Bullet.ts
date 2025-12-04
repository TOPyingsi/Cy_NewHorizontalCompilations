import { _decorator, Component, Tween, Node, Collider2D, UIOpacity, tween, v3, BoxCollider2D, Contact2DType, IPhysics2DContact, Sprite } from 'cc';
const { ccclass, property } = _decorator;

import ZWDZJS_GameManager from './ZWDZJS_GameManager';
import ZWDZJS_JiangShi from './僵尸/ZWDZJS_JiangShi';

@ccclass('ZWDZJS_Bullet')
export default class ZWDZJS_Bullet extends Component {
    @property
    Id: number = 0;//Id对应植物，666是小推车
    @property
    Attack: number = 0;//伤害
    @property
    isOnce: boolean = true;//是否一次伤害后就销毁(单次伤害)
    private state: number = 0;//状态(小车未激活0，激活1)
    Tweens: Tween<Node>;
    Tweens2: Tween<UIOpacity>;
    boxcollider: Collider2D = null;
    start() {
        this.Init();
    }
    Init() {
        if (this.Id == 1) {//阳光
            //初始化图像
            ZWDZJS_GameManager.Instance.SetSpriteSum(this.node.getChildByName("太阳阴影").getComponent(Sprite));
            ZWDZJS_GameManager.Instance.SetSpriteSum(this.node.getChildByName("太阳").getComponent(Sprite));
            this.node.setParent(ZWDZJS_GameManager.Instance.UI.getChildByName("阳光层"));
            this.node.getComponent(UIOpacity).opacity = 255;

        } else {
            this.boxcollider = this.node.getComponent(BoxCollider2D);
            this.boxcollider.on(Contact2DType.BEGIN_CONTACT, (selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) => {
                this.onCollisionEnter(otherCollider, selfCollider);
            })
        }



    }
    update(dt) {
        if (this.node.position.x > 3000) {
            this.scheduleOnce(() => {
                this.node.active = false;
            })

        }
    }
    onCollisionEnter(other: Collider2D, self) {
        if (other.tag == 1) {//僵尸
            other.node.getComponent(ZWDZJS_JiangShi).SufferHarm(this.Attack);
            if (this.isOnce) {
                this.scheduleOnce(() => {
                    this.node.active = false;
                })
            }
            if (this.Id == 666 && this.state == 0) {//小推车
                this.state = 1;
                this.Right_Move(1000);
            }
            if (this.Id == 0) {//激光子弹
                ZWDZJS_GameManager.Instance.PlayAudio(8);
            }
        }
    }
    //    //阳光点击事件
    YanGuanOnClick() {
        this.Tweens.stop();
        if (this.Tweens2) {
            this.Tweens2.stop();
        }
        this.node.off(Node.EventType.TOUCH_START);
        ZWDZJS_GameManager.Instance.PlayAudio(7);
        this.unschedule(this.YanGuan_Die);//注销阳光延迟消失的事件
        this.unschedule(this.YanGuan_RuoYingRuoXian);//注销阳光若隐若现
        this.node.getComponent(UIOpacity).opacity = 255;
        this.Tweens = tween(this.node)
            .to(0.5, { position: ZWDZJS_GameManager.Instance.YanGuanText.node.parent.position })
            .call(() => {
                this.node.active = false;
                ZWDZJS_GameManager.Instance.Changge_YanGuang(25);
            })
            .start();
    }
    //    //向右平移运动
    Right_Move(speed: number) {
        tween(this.node)
            .by(1, { position: v3(speed, 0, 0) })
            .repeatForever()
            .start();
    }
    //    //阳光若隐若现
    YanGuan_RuoYingRuoXian() {
        this.Tweens2 = tween(this.node.getComponent(UIOpacity))
            .to(0.3, { opacity: 110 })
            .to(0.3, { opacity: 255 })
            .union()
            .repeat(3)
            .to(0.15, { opacity: 0 })
            .start();
    }
    //    //阳光掉落运动
    YanGuan_DiaoLuo() {
        let K = Math.random() * 100 - 50;
        this.Tweens = tween(this.node)
            .by(0.3, { position: v3(K, 60) }, { easing: "quadOut" })
            .by(0.3, { position: v3(0, -150) }, { easing: "quadInOut" })
            .call(() => {
                if (ZWDZJS_GameManager.Instance.Dates[1] == 1) this.YanGuanOnClick();//自动拾取
                this.scheduleOnce(this.YanGuan_Die, 5)
            })
            .start();
    }
    //    //阳光消失
    YanGuan_Die() {
        this.node.off(Node.EventType.TOUCH_START);
        this.node.active = false;
    }
}


