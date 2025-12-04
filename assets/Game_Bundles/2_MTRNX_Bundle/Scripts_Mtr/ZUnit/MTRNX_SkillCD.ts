import { _decorator, Component, director, game, Label, Node, Sprite, tween } from 'cc';
import { MTRNX_Constant } from '../Data/MTRNX_Constant';
import { MTRNX_GameDate } from '../MTRNX_GameDate';

const { ccclass, property } = _decorator;

@ccclass('MTRNX_SkillCD')
export class MTRNX_SkillCD extends Component {

    IsEnterCD: boolean = false;
    duration: number = 0;

    Init(index: number) {
        this.duration = MTRNX_Constant.PlayerSkillCD[MTRNX_GameDate.Instance.CurrentSelect][index];
        this.node.getComponentInChildren(Sprite).fillRange = -1;
        this.node.getComponentInChildren(Label).string = this.duration.toString();
        this.node.active = true;
        this.IsEnterCD = true;
        tween(this.node.getComponentInChildren(Sprite))
            .to(this.duration, { fillRange: 0 })
            .call(() => {
                this.node.active = false;
                this.IsEnterCD = false;
            })
            .start()

    }

    update(deltaTime: number) {
        if (this.IsEnterCD) {
            this.node.getComponentInChildren(Label).string = ((0 - this.node.getComponentInChildren(Sprite).fillRange) * this.duration).toFixed(1);
        }
    }
}


