import { _decorator, Component, Node, sp } from 'cc';
import { SJZXD_AttackBox } from '../SJZXD_AttackBox';
import { SJZXD_AudioManager } from '../SJZXD_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('SJZXD_Skill_WuDiHuoPao')
export class SJZXD_Skill_WuDiHuoPao extends Component {
    Show(camp: number, attack: number) {
        this.node.getChildByName("AttakckBox").getComponent(SJZXD_AttackBox)._camp = camp;
        this.node.getChildByName("AttakckBox").getComponent(SJZXD_AttackBox)._attack = attack;
        this.node.getChildByName("图").getComponent(sp.Skeleton).setStartListener((trackEntry) => {
            SJZXD_AudioManager.globalAudioPlay("炼狱犬技能音效");
            this.scheduleOnce(() => {
                this.node.getChildByName("AttakckBox").active = true;
                this.scheduleOnce(() => {
                    this.node.getChildByName("AttakckBox").active = false;
                    this.node.active = false;
                }, 0.1)
            }, (trackEntry.animationEnd - trackEntry.animationStart) * 0.8); // 在动画60%处触发攻击

        });
        this.node.getChildByName("图").getComponent(sp.Skeleton).setAnimation(0, "animation", false);
    }
}


