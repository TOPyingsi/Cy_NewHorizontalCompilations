import { _decorator, Color, Component, Sprite, Vec3 } from 'cc';
const { ccclass, property } = _decorator;
const color: Color = new Color();
@ccclass('MTRNX_DSRSkillEffect')
export class MTRNX_DSRSkillEffect extends Component {
    sprite: Sprite = null;
    protected onLoad(): void {
        this.sprite = this.node.getComponent(Sprite);
    }

    Init(hex: string, scale: Vec3 = Vec3.ONE) {
        Color.fromHEX(color, hex);
        this.sprite.color = color;
        this.node.setScale(scale);
    }
}