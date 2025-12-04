import { _decorator, Component, Node, Sprite, SpriteFrame, UIOpacity } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('TKJWL_RandomSnow')
export class TKJWL_RandomSnow extends Component {
    @property(SpriteFrame)
    sprites: SpriteFrame[] = [];


    start() {
        let opacity = this.node.getComponent(UIOpacity);
        let spriteComp = this.node.getComponent(Sprite);
        this.schedule(() => {
            let sprite = this.sprites[Math.floor(Math.random() * this.sprites.length)];
            spriteComp.spriteFrame = sprite;
            opacity.opacity = Math.floor(Math.random() * 255);
        }, 0.05);
    }
}


