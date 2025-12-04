import { _decorator, Component, director, error, EventTouch, find, Label, Node, Sprite, SpriteFrame } from 'cc';
import { BundleManager } from 'db://assets/Scripts/Framework/Managers/BundleManager';
import { HJMWK_GameData } from './HJMWK_GameData';
const { ccclass, property } = _decorator;

@ccclass('HJMWK_ItemBackpack')
export class HJMWK_ItemBackpack extends Component {

    Icon: Sprite = null;
    Num: Label = null;
    Border: Node = null;

    Name: string = "";

    protected onLoad(): void {
        this.Icon = find("Icon", this.node).getComponent(Sprite);
        this.Num = find("Num", this.node).getComponent(Label);
        this.Border = find("背包框金", this.node);

        this.node.on(Node.EventType.TOUCH_END, this.onClick, this);
    }

    show(name: string, num: number) {
        this.Name = name;
        BundleManager.LoadSpriteFrame("43_HJMWK_Bundle", `Sprites/道具/${name}`).then((sf: SpriteFrame) => {
            this.Icon.spriteFrame = sf;
        })
        this.Num.string = "x" + num.toString();
    }

    onClick(event: EventTouch = null) {
        director.getScene().emit("HJMWK_HideBackpackBorder");
        this.Border.active = true;
        if (HJMWK_GameData.Instance.CurProp !== this.Name) {
            HJMWK_GameData.Instance.CurProp = this.Name;
            director.getScene().emit("HJMWK_ShowEquipmentBorder", this.Name);
        }
    }

    hideBorder() {
        this.Border.active = false;
    }

    protected onEnable(): void {
        director.getScene().on("HJMWK_HideBackpackBorder", this.hideBorder, this);
    }
}


