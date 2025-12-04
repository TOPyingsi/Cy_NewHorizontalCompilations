import { _decorator, Node, Collider2D, tween, v3, Animation } from 'cc';
import ZWDZJS_ZhiWu from './ZWDZJS_ZhiWu';
import { Collider } from '../../../../../extensions/plugin-import-2x/creator/components/Collider';
import ZWDZJS_GameManager from '../ZWDZJS_GameManager';
import ZWDZJS_JiangShi from '../僵尸/ZWDZJS_JiangShi';
const { ccclass, property } = _decorator;


@ccclass('ZWDZJS_ShuangZiXing')
export default class ZWDZJS_ShuangZiXing extends ZWDZJS_ZhiWu {
    @property(Node)//子弹发射点
    FaSheDian: Node | null = null;
    protected onLoad(): void {
        this.Hp = 100;
        this.Id = 2;
        this.attack = 1000;
    }
    start() {
        super.start();
        tween(this.node)
            .to(0.25, { scale: v3(1.25, 1.25, 1.25) })
            .to(0.25, { scale: v3(1, 1, 1) })
            .to(0.25, { scale: v3(2, 2, 2) })
            .call(() => {
                this.node.getComponent(Collider2D).enabled = true;
                this.node.getChildByName("龙骨").active = false;
            })
            .delay(0.05)
            .call(() => {
                this.AttaCk();
            })
            .start();
    }
    //    //樱桃炸弹特殊受击
    SufferHarm(Attack: number) {
        return;
    }
    AttaCk(): void {
        ZWDZJS_GameManager.Instance.PlayAudio(0);
        this.node.getComponent(Collider2D).enabled = false;
        this.node.getComponent(Animation).play("YingTaoZhaDan");
        this.scheduleOnce(() => {
            ZWDZJS_GameManager.Instance.Delet_ZhiWu(this.node);
        }, 1.2)
    }
    onCollisionEnter(other: Collider2D, self) {//碰到僵尸造成巨量伤害
        if (other.tag == 1) {//僵尸
            other.node.getComponent(ZWDZJS_JiangShi).SufferHarm(this.attack);
        }
    }
}

