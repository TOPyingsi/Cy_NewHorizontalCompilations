import { _decorator, Component, Node, Sprite, tween } from 'cc';
import { SJZGMMT_Unit } from './SJZGMMT_Unit';
const { ccclass, property } = _decorator;

@ccclass('SJZGMMT_BulletBar')
export class SJZGMMT_BulletBar extends Component {
    public FindUnit: SJZGMMT_Unit = null;
    private bulletindex: number = 1;//子弹进度

    private bulletsprite: Sprite = null;//子弹图
    private bulletShadowsprite: Sprite = null;//子弹阴影图
    start() {
        this.bulletsprite = this.node.getChildByName("子弹条").getComponent(Sprite);
        this.bulletShadowsprite = this.node.getChildByName("阴影子弹条").getComponent(Sprite);
        this.FindUnit = this.node.parent?.getComponent(SJZGMMT_Unit);
    }
    protected update(dt: number): void {
        if (this.FindUnit && this.FindUnit.isValid && this.FindUnit.Weapon) {
            // 分母不能为0
            let bullet = this.FindUnit.Weapon._Maxbulletnum === 0 ? 0 : this.FindUnit.Weapon._bulletnum / this.FindUnit.Weapon._Maxbulletnum;
            if (bullet != this.bulletindex) {
                this.bulletindex = bullet;
                this.Show();
            }
        }
        this.node.scale = this.node.parent.scale;
    }


    //刷新子弹条
    Show() {
        this.bulletsprite.fillRange = this.bulletindex;
        tween(this.bulletShadowsprite)
            .to(0.5, { fillRange: this.bulletindex })
            .start();
    }
}


