import { _decorator, color, Component, Label, Node, ParticleSystem2D, Sprite, SpriteFrame, tween, UITransform, v3 } from 'cc';
import { QSSZG_GameManager } from './QSSZG_GameManager';
import { FishData } from '../QSSZG_GameData';
import { QSSZG_Incident } from '../QSSZG_Incident';
import { QSSZG_Constant } from '../Data/QSSZG_Constant';
import { QSSZG_AudioManager } from '../QSSZG_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('QSSZG_FishBag')
export class QSSZG_FishBag extends Component {
    public FishID: number = 0;
    start() {
        this.node.on(Node.EventType.TOUCH_START, () => { this.TOUCH_START(); })
    }

    TOUCH_START() {
        tween(this.node)
            .to(0.2, { angle: 40 })
            .to(0.4, { angle: -480, scale: v3(0, 0, 0) })
            .call(() => {
                //生成鱼
                QSSZG_GameManager.Instance.LoadFish(new FishData(this.FishID, 0, QSSZG_GameManager.Instance.aquariumID));
                if (QSSZG_GameManager.Instance.UI.getChildByPath("鱼包界面/content").children.length == 1) {
                    QSSZG_GameManager.Instance.UI.getChildByPath("鱼包界面").active = false;
                }
                this.node.destroy();
            })
            .start();
        QSSZG_AudioManager.AudioPlay("点击", 0);
    }


    Init() {
        QSSZG_Incident.LoadSprite("FishSprite/" + this.FishID + "_fish").then((data: SpriteFrame) => {
            this.node.getChildByName("鱼图").getComponent(Sprite).spriteFrame = data;
            this.node.getChildByName("名字").getComponent(Label).string = QSSZG_Constant.GetDataFromID(this.FishID).Name;
            if (QSSZG_Constant.GetDataFromID(this.FishID).Name.charAt(0) == "稀") {
                this.node.getChildByName("特效").getComponent(ParticleSystem2D).startColor = color(255, 204, 0);
                this.node.getChildByName("名字").getComponent(Label).color = color(255, 196, 92);
                this.node.getChildByName("特殊1").active = true;
                this.node.getChildByName("特殊2").active = true;
            }
        })

    }
}


