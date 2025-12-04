import { _decorator, Component, Node, tween, v3, Vec3 } from 'cc';
import ZWDZJS_GameManager from './ZWDZJS_GameManager';
import { UIManager } from '../../../Scripts/Framework/Managers/UIManager';
const { ccclass, property } = _decorator;

@ccclass('ZWDZJS_GoldShovel')
export class ZWDZJS_GoldShovel extends Component {
    public MuBiaoPoint: Vec3 = v3(500, 500);
    start() {
        this.SetMuBiaoPoint();
        this.node.on(Node.EventType.TOUCH_START, (even) => { this.OnMouseDown(even); });
    }

    //设定新目标  
    SetMuBiaoPoint() {
        this.MuBiaoPoint = v3(Math.random() * 2308, Math.random() * 1080);
        let leng = (this.node.getWorldPosition().clone().subtract(this.MuBiaoPoint)).length();
        tween(this.node)
            .to(leng / 100, { worldPosition: this.MuBiaoPoint })
            .call(() => {
                this.SetMuBiaoPoint();
            })
            .start();
    }
    OnMouseDown(even: TouchEvent) {
        if (ZWDZJS_GameManager.Instance.SkillColumnMenu) {
            if (ZWDZJS_GameManager.Instance.SkillColumnMenu.SkiiBeans < 3) {
                this.node.off(Node.EventType.TOUCH_START);
                tween(this.node)
                    .to(0.6, { worldPosition: ZWDZJS_GameManager.Instance.SkillColumnMenu.node.getWorldPosition() }, { easing: "backIn" })
                    .call(() => {
                        ZWDZJS_GameManager.Instance.SkillColumnMenu?.Add_SkiiBeans(1);
                        this.node.destroy();
                    })
                    .start()
            } else {
                UIManager.ShowTip("当前可存储的金铲铲已经达到上限！");
            }
        }
    }
}


