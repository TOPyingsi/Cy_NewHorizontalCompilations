import { _decorator, Component, director, EventTouch, find, Label, Node, Sprite, SpriteFrame } from 'cc';
import { BundleManager } from 'db://assets/Scripts/Framework/Managers/BundleManager';
import { GameManager } from 'db://assets/Scripts/GameManager';
import HJMWK_PlayerController from './HJMWK_PlayerController';
import { HJMWK_GameData } from './HJMWK_GameData';
const { ccclass, property } = _decorator;

@ccclass('HJMWK_ItemEquipment')
export class HJMWK_ItemEquipment extends Component {

    Icon: Sprite = null;
    Num: Label = null;
    Border: Node = null;

    Name: string = "";

    Count: number = 0;

    protected onLoad(): void {
        this.Icon = find("Icon", this.node).getComponent(Sprite);
        this.Num = find("Num", this.node).getComponent(Label);
        this.Border = find("金框边", this.node);

        this.node.on(Node.EventType.TOUCH_END, this.onClick, this);
    }

    show(name: string, num: number = 99) {
        this.Name = name;
        BundleManager.LoadSpriteFrame("43_HJMWK_Bundle", `Sprites/道具/${name}`).then((sf: SpriteFrame) => {
            this.Icon.spriteFrame = sf;
        })
        this.Num.string = num.toString();
        this.Count = num;
    }

    changeCount(change: number) {
        this.Count += change;
        this.Num.string = this.Count.toString();
    }

    onClick(event: EventTouch = null) {
        director.getScene().emit("HJMWK_HideEquipmentBorder");
        this.Border.active = true;
        HJMWK_GameData.Instance.CurProp = this.Name;
        HJMWK_PlayerController.Instance.switchPickaxe(this.Name);
        // console.error(this.node.name);
    }

    hideBorder() {
        this.Border.active = false;
    }

    showByName(name: string) {
        if (this.Name !== name) return;
        this.onClick();
    }

    protected onEnable(): void {
        director.getScene().on("HJMWK_HideEquipmentBorder", this.hideBorder, this);
        director.getScene().on("HJMWK_ShowEquipmentBorder", this.showByName, this);
    }

    protected onDisable(): void {
        director.getScene().off("HJMWK_HideEquipmentBorder", this.hideBorder, this);
        director.getScene().off("HJMWK_ShowEquipmentBorder", this.showByName, this);
    }
}


