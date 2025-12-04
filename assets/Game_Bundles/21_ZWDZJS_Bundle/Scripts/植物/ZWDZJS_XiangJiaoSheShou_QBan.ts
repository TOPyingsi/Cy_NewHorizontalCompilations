import { _decorator, Node } from 'cc';
import ZWDZJS_ZhiWu from './ZWDZJS_ZhiWu';
import ZWDZJS_Bulletpond from '../ZWDZJS_Bulletpond';
import ZWDZJS_GameManager from '../ZWDZJS_GameManager';
import ZWDZJS_Bullet from '../ZWDZJS_Bullet';
import { SkeletonManager } from '../../../../Scripts/Framework/Managers/SkeletonManager';
const { ccclass, property } = _decorator;



@ccclass('ZWDZJS_XiangJiaoSheShou_QBan')
export default class ZWDZJS_XiangJiaoSheShou_QBan extends ZWDZJS_ZhiWu {
    @property(Node)//子弹发射点
    FaSheDian: Node | null = null;

    public SkillNumber: number = 0;//大招香蕉剩余次数
    protected onLoad(): void {
        this.Hp = 100;
        this.Speed = 2;
        this.Id = 0;
    }
    start() {
        super.start();
    }
    AttaCk(): void {
        this.audioPlay_Attack(4);
        if (this._skeleton) {
            SkeletonManager.play_Animation(this._skeleton, "gongji", false, () => {
                if (!this.node) return;
                SkeletonManager.play_Animation(this._skeleton, "daiji", true);
            }, () => {
                if (!this.node) return;
                if (this.SkillNumber > 0) {
                    let BulletPre: Node = ZWDZJS_Bulletpond.Instance.Getbullet(3);
                    BulletPre.setParent(ZWDZJS_GameManager.Instance.CaoChang.getChildByName("子弹"));
                    BulletPre.setWorldPosition(this.FaSheDian.getWorldPosition().clone());
                    this.scheduleOnce(() => {
                        if (BulletPre) BulletPre.active = true;
                    })
                    BulletPre.getComponent(ZWDZJS_Bullet).Right_Move(1000);//设置运动状态
                    BulletPre.getComponent(ZWDZJS_Bullet).Attack = this.attack * 3;//赋予伤害
                    this.SkillNumber--;
                    if (this.SkillNumber == 0) {
                        this.node.getChildByName("技能特效").active = false;
                    }
                } else {
                    let BulletPre: Node = ZWDZJS_Bulletpond.Instance.Getbullet(2);
                    BulletPre.setParent(ZWDZJS_GameManager.Instance.CaoChang.getChildByName("子弹"));
                    BulletPre.setWorldPosition(this.FaSheDian.getWorldPosition().clone());
                    BulletPre.getComponent(ZWDZJS_Bullet).Right_Move(1000);//设置运动状态
                    BulletPre.getComponent(ZWDZJS_Bullet).Attack = this.attack;//赋予伤害
                }

            }, 0.8);
        }
    }
    //技能
    Skill() {
        this.SkillNumber += 3;
        this.node.getChildByName("技能特效").active = true;
    }
}

