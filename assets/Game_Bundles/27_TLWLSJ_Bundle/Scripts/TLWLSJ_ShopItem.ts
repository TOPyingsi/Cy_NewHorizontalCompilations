import { _decorator, Component, Enum, Node, Sprite, SpriteFrame } from 'cc';
import { TLWLSJ_SHOPITEM } from './TLWLSJ_Constant';
import { TLWLSJ_Shop } from './TLWLSJ_Shop';
import { Audios, TLWLSJ_AudioManager } from './TLWLSJ_AudioManager';
import { TLWLSJ_EventManager, TLWLSJ_MyEvent } from './TLWLSJ_EventManager';

const { ccclass, property } = _decorator;

@ccclass('TLWLSJ_ShopItem')
export class TLWLSJ_ShopItem extends Component {

    @property({ type: Enum(TLWLSJ_SHOPITEM) })
    Type: TLWLSJ_SHOPITEM = TLWLSJ_SHOPITEM.AMMO;

    @property(SpriteFrame)
    NormalSF: SpriteFrame = null;

    @property(SpriteFrame)
    CheckedSF: SpriteFrame = null;

    @property
    IsChecked: boolean = false;

    Sprite: Sprite = null;

    protected onLoad(): void {
        this.Sprite = this.getComponent(Sprite);
        this.node.on(Node.EventType.TOUCH_END, this.click, this);
        TLWLSJ_EventManager.on(TLWLSJ_MyEvent.TLWLSJ_SHOPITEM, this.unChecked, this);
    }

    protected start(): void {
        this.showSF();
    }

    showSF() {
        if (this.IsChecked) {
            this.Sprite.spriteFrame = this.CheckedSF;
        } else {
            this.Sprite.spriteFrame = this.NormalSF;
        }
    }

    click() {
        if (this.IsChecked) return;
        TLWLSJ_AudioManager.PlaySound(Audios.ButtonClick);
        TLWLSJ_EventManager.Scene.emit(TLWLSJ_MyEvent.TLWLSJ_SHOPITEM);
        this.IsChecked = true;
        this.showSF();
        TLWLSJ_Shop.Instance.switchPanel(this.Type);
    }

    unChecked() {
        this.IsChecked = false;
        this.showSF();
    }
}


