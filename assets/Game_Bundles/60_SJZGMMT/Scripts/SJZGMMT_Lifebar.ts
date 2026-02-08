import { _decorator, Component, Node, Sprite, tween } from 'cc';
import { SJZGMMT_Unit } from './SJZGMMT_Unit';
const { ccclass, property } = _decorator;

@ccclass('SJZGMMT_Lifebar')
export class SJZGMMT_Lifebar extends Component {
    public FindUnit: SJZGMMT_Unit = null;
    private hpindex: number = 1;//血量进度

    private Hpsprite: Sprite = null;//血量图
    private HpShadowsprite: Sprite = null;//血量阴影图
    start() {
        this.Hpsprite = this.node.getChildByName("血条").getComponent(Sprite);
        this.HpShadowsprite = this.node.getChildByName("阴影血条").getComponent(Sprite);
        this.FindUnit = this.node.parent?.getComponent(SJZGMMT_Unit);
    }
    protected update(dt: number): void {
        if (this.FindUnit && this.FindUnit.isValid) {
            let hp = this.FindUnit.Hp / this.FindUnit.MaxHp;
            if (hp != this.hpindex) {
                this.hpindex = hp;
                this.Show();
            }
        }
        this.node.scale = this.node.parent.scale;
    }

    //刷新血条
    Show() {
        this.Hpsprite.fillRange = this.hpindex;
        tween(this.HpShadowsprite)
            .to(0.5, { fillRange: this.hpindex })
            .start();
    }
}


