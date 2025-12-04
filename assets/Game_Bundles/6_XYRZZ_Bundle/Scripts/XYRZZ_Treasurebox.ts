import { _decorator, Component, Label, Node, tween, v2, v3, Vec2 } from 'cc';
import { XYRZZ_AudioManager } from './XYRZZ_AudioManager';
import { XYRZZ_Panel, XYRZZ_UIManager } from './XYRZZ_UIManager';
const { ccclass, property } = _decorator;

@ccclass('XYRZZ_Treasurebox')
export class XYRZZ_Treasurebox extends Component {
    public Time: number = 60;//剩余时间
    public point: Vec2 = null;

    private text: Label = null;
    start() {
        this.text = this.node.getChildByName("时间").getComponent(Label);
        this.Move();
    }

    update(deltaTime: number) {
        this.Time -= deltaTime;
        this.text.string = `` + Math.floor(this.Time);
        if (this.Time <= 0) {
            this.node.destroy();
        }
    }

    //随机移动
    Move() {
        let posX = Math.random() * 2200 - 1100;
        let posY = Math.random() * 1100 - 550;
        let dis = v2(posX, posY).subtract(v2(this.node.position.x, this.node.position.y)).length();
        tween(this.node)
            .to(dis / 100, { position: v3(posX, posY) })
            .call(() => {
                this.Move();
            })
            .start();
    }

    //被单机
    OnClick() {
        XYRZZ_AudioManager.globalAudioPlay("鼠标嘟");
        XYRZZ_UIManager.Instance.ShowPanel(XYRZZ_Panel.XYRZZ_TreasureboxPanel);
        this.node.destroy();
    }
}


