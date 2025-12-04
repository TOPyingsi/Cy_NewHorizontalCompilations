import { _decorator, Node, Collider2D, tween, v3, Animation, Prefab, instantiate, v2 } from 'cc';
import ZWDZJS_ZhiWu from './ZWDZJS_ZhiWu';
import { Collider } from '../../../../../extensions/plugin-import-2x/creator/components/Collider';
import ZWDZJS_GameManager from '../ZWDZJS_GameManager';
import ZWDZJS_JiangShi from '../僵尸/ZWDZJS_JiangShi';
import { ZWDZJS_Incident } from '../ZWDZJS_Incident';
import { ZWDZJS_TimeDie } from '../ZWDZJS_TimeDie';
const { ccclass, property } = _decorator;


@ccclass('ZWDZJS_YingTaoZhaDan_Qban')
export default class ZWDZJS_YingTaoZhaDan_Qban extends ZWDZJS_ZhiWu {
    public IsCanSkill: boolean = true;//能否使用技能
    @property(Node)//子弹发射点
    FaSheDian: Node | null = null;
    public IsBoom: boolean = false;
    protected onLoad(): void {
        this.Hp = 100;
        this.Id = 2;
        this.attack = 1000;
    }
    start() {
        super.start();

    }
    //    //樱桃炸弹特殊受击
    SufferHarm(Attack: number) {
        return;
    }
    AttaCk(): void {
        ZWDZJS_GameManager.Instance.PlayAudio(0);
        this.node.getComponent(Collider2D).enabled = false;
        this.scheduleOnce(() => {
            ZWDZJS_GameManager.Instance.Delet_ZhiWu(this.node);
        }, 0.5)
    }
    onCollisionEnter(other: Collider2D, self) {//碰到僵尸造成巨量伤害
        if (other.tag == 1 && self.tag == 105) {//僵尸
            other.node.getComponent(ZWDZJS_JiangShi).SufferHarm(this.attack);
        }
        if (other.tag == 1 && self.tag == 101) {//触发
            this.Boom();
        }
    }

    Boom() {
        if (this.IsBoom == false) {
            this.IsCanSkill = false;
            this.IsBoom = true;
            tween(this.node)
                .to(0.2, { scale: v3(1.2, 1.2, 1.2) })
                .to(0.2, { scale: v3(1, 1, 1) })
                .to(0.2, { scale: v3(1.4, 1.4, 1.4) })
                .to(0.2, { scale: v3(1.2, 1.2, 1.2) })
                .call(() => {
                    this.node.getComponent(Collider2D).enabled = true;
                    this.node.getChildByName("龙骨").active = false;
                    this.node.getComponent(Animation).play();
                })
                .delay(0.05)
                .call(() => {
                    this.AttaCk();
                })
                .start();
        }
    }

    //释放技能
    Skill() {
        this.Boom();
        this.scheduleOnce(() => {
            //生成火焰
            //获取自身所在位置
            let posY = this.InLine;
            let posX = ZWDZJS_GameManager.Instance.ZhiWuArray[posY].indexOf(this.node);
            ZWDZJS_Incident.Loadprefab("PreFab/子弹/樱桃炸弹火焰").then((pre: Prefab) => {
                for (let i = 0; i < 9; i++) {
                    let nd = instantiate(pre);
                    nd.setParent(ZWDZJS_GameManager.Instance.CaoChang.getChildByName("子弹"));
                    nd.setWorldPosition(ZWDZJS_GameManager.Instance.GetGroundPos(v2(posY, i)));
                    nd.getComponent(ZWDZJS_TimeDie).Init(1.4 + i * 0.1);
                }
                for (let i = 0; i < 5; i++) {
                    let nd = instantiate(pre);
                    nd.setParent(ZWDZJS_GameManager.Instance.CaoChang.getChildByName("子弹"));
                    nd.setWorldPosition(ZWDZJS_GameManager.Instance.GetGroundPos(v2(i, posX)));
                    nd.getComponent(ZWDZJS_TimeDie).Init(1.4 + i * 0.1);
                }
            })

        }, 0.7)
    }
}

