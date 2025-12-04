import { _decorator, Animation, BoxCollider2D, Node } from 'cc';
const { ccclass, property } = _decorator;


import ZWDZJS_ZhiWu from './ZWDZJS_ZhiWu';
import ZWDZJS_GameManager from '../ZWDZJS_GameManager';
import ZWDZJS_JiangShi from '../僵尸/ZWDZJS_JiangShi';
import { SkeletonManager } from '../../../../Scripts/Framework/Managers/SkeletonManager';

@ccclass('ZWDZJS_JuanXinCai_QBan')
export default class ZWDZJS_JuanXinCai_QBan extends ZWDZJS_ZhiWu {
    @property(Node)//子弹发射点
    FaSheDian: Node | null = null;
    private JianShiNum: number = 0;//范围内僵尸
    protected onLoad(): void {
        this.Hp = 200;
        this.Id = 4;
        this.attack = 10;
        this.Speed = 1.5;
    }
    start() {
        super.start();
    }

    AttaCk(): void {
        if (!this.IsCanSkill) return;
        ZWDZJS_GameManager.Instance.PlayAudio(15);
        SkeletonManager.play_Animation(this._skeleton, "gongji", false, null, (() => {
            if (!this.node) return;
            this.node.getComponents(BoxCollider2D)[2].enabled = true;
            this.scheduleOnce(() => {
                this.node.getComponents(BoxCollider2D)[2].enabled = false;
            })
        }), 0.5);
    }
    onCollisionEnter(other, self) {//伤害范围
        if (other.tag == 1 && self.tag == 1001) {//攻击范围碰撞遇到僵尸
            this.JianShiNum++;
            this.triggering_condition = true;
        }

    }
    onCollisionExit(other, self) {
        if (other.tag == 1 && self.tag == 1001) {//攻击范围僵尸离开
            this.JianShiNum--;
            if (this.JianShiNum == 0) {
                this.triggering_condition = false;
            }
        }
        if (other.tag == 1 && self.tag == 1002) {//攻击范围碰撞遇到僵尸
            other.node.getComponent(ZWDZJS_JiangShi).SufferHarm(this.attack);//普通攻击
        }
    }

    Skill() {
        this.IsCanSkill = false;
        SkeletonManager.play_Animation(this._skeleton, "dazhao", true, () => {
            if (!this.node) return;
            ZWDZJS_GameManager.Instance.PlayAudio(15);
            this.attack = 200;
            this.node.getComponents(BoxCollider2D)[2].enabled = true;
            this.scheduleOnce(() => {
                this.node.getComponents(BoxCollider2D)[2].enabled = false;
            })
        }, () => {
            if (!this.node) return;
            this._skeleton.clearAnimations();
            this._skeleton.setCompleteListener(null);
            SkeletonManager.play_Animation(this._skeleton, "daiji", true);
            this.IsCanSkill = true;
            this.attack = 10;
        }, 3);
    }
}

