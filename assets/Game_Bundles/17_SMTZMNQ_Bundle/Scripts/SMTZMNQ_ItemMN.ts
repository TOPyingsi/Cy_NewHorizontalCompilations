import { _decorator, color, Component, find, Label, Node, Sprite, SpriteFrame } from 'cc';
import { SMTZMNQ_EventManager, SMTZMNQ_MyEvent } from './SMTZMNQ_EventManager';
import { SMTZMNQ_UIPanel } from './SMTZMNQ_UIPanel';
const { ccclass, property } = _decorator;

@ccclass('SMTZMNQ_ItemMN')
export class SMTZMNQ_ItemMN extends Component {
    @property
    Name: string = "";

    @property(SpriteFrame)
    SF: SpriteFrame[] = [];

    Sprite: Sprite = null;
    NameLabel: Label = null;

    IsClick: boolean = false;

    protected onLoad(): void {
        this.Sprite = this.getComponent(Sprite);
        this.NameLabel = find("Num", this.node).getComponent(Label);

        SMTZMNQ_EventManager.on(SMTZMNQ_MyEvent.SMTZMNQ_HIDEITEMMN, this.hide, this);
    }

    protected start(): void {
        this.NameLabel.string = this.Name;
    }

    click() {
        if (this.IsClick) {
            this.hide();
            SMTZMNQ_UIPanel.Instance.showMNIcon();
            return;
        }
        SMTZMNQ_EventManager.Scene.emit(SMTZMNQ_MyEvent.SMTZMNQ_HIDEITEMMN);
        this.IsClick = true;
        this.Sprite.spriteFrame = this.SF[1];
        SMTZMNQ_UIPanel.Instance.showMNIcon(this.SF[1]);
        this.NameLabel.color = color(0, 0, 0, 255);
    }

    hide() {
        this.IsClick = false;
        this.Sprite.spriteFrame = this.SF[0];
        this.NameLabel.color = color(255, 255, 255, 255);
    }
}


