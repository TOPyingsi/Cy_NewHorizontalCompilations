import { _decorator, Component, Node, sp } from 'cc';
import { SJZXD_AttackBox } from '../SJZXD_AttackBox';
const { ccclass, property } = _decorator;

@ccclass('SJZXD_Skill_LieHuoFengTian')
export class SJZXD_Skill_LieHuoFengTian extends Component {
    Show(camp: number, attack: number) {
        this.node.getChildByName("AttakckBox").getComponent(SJZXD_AttackBox)._camp = camp;
        this.node.getChildByName("AttakckBox").getComponent(SJZXD_AttackBox)._attack = attack;
        this.node.getChildByName("图").getComponent(sp.Skeleton).setStartListener((trackEntry) => {
            for (let index = 0; index < 8; index++) {
                this.scheduleOnce(() => {
                    this.attack();
                }, (trackEntry.animationEnd - trackEntry.animationStart) * (index * 0.1 + 0.1)); // 在动画10%处触发攻击
            }
            this.scheduleOnce(() => {
                this.node.active = false;
            }, (trackEntry.animationEnd - trackEntry.animationStart));
        });
        this.node.getChildByName("图").getComponent(sp.Skeleton).setAnimation(0, "animation", false);
    }

    attack() {
        this.node.getChildByName("AttakckBox").active = true;
        this.scheduleOnce(() => {
            this.node.getChildByName("AttakckBox").active = false;
        })
    }
}


