import { _decorator, Component, Node, Sprite, SpriteFrame } from 'cc';
import { SMTZMNQ_EventManager, SMTZMNQ_MyEvent } from './SMTZMNQ_EventManager';
const { ccclass, property } = _decorator;

@ccclass('SMTZMNQ_Body')
export class SMTZMNQ_Body extends Component {
    @property(SpriteFrame)
    SF: SpriteFrame[] = [];

    Sprite: Sprite = null;

    protected onLoad(): void {
        this.Sprite = this.getComponent(Sprite);

        SMTZMNQ_EventManager.on(SMTZMNQ_MyEvent.SMTZMNQ_HIDEBODY, this.Hide, this);
    }

    Hide() {
        this.Sprite.spriteFrame = this.SF[0];
    }

    Show() {
        this.Sprite.spriteFrame = this.SF[1];
    }

}


