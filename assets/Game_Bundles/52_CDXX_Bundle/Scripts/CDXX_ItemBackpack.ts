import { _decorator, Component, director, error, EventTouch, find, Label, Node, Sprite, SpriteFrame } from 'cc';
import { BundleManager } from 'db://assets/Scripts/Framework/Managers/BundleManager';
import { CDXX_GameData } from './CDXX_GameData';
import { CDXX_EventManager, CDXX_MyEvent } from './CDXX_EventManager';
import { CDXX_Equipment } from './CDXX_Equipment';
import { CDXX_ELIXIR, CDXX_INTRODUCE } from './CDXX_Constant';
const { ccclass, property } = _decorator;

@ccclass('CDXX_ItemBackpack')
export class CDXX_ItemBackpack extends Component {

    Icon: Sprite = null;
    Num: Label = null;
    Border: Node = null;

    Name: string = "";

    IsPickaxe: boolean = false;

    protected onLoad(): void {
        this.Icon = find("Icon/Icon", this.node).getComponent(Sprite);
        this.Num = find("Num", this.node).getComponent(Label);
        this.Border = find("背包框金", this.node);

        this.node.on(Node.EventType.TOUCH_END, this.onClick, this);
    }

    show(name: string, num: number, sf: SpriteFrame, _isClick: boolean) {
        this.Name = name;
        this.Icon.spriteFrame = sf;
        this.IsPickaxe = _isClick;
        this.Num.string = "x" + num.toString();
        this.hideBorder();
        if (this.Name == CDXX_GameData.Instance.CurHold) this.Border.active = true;
    }

    onClick(event: EventTouch = null) {
        // director.getScene().emit("CDXX_HideBackpackBorder");
        CDXX_EventManager.Scene.emit(CDXX_MyEvent.CDXX_HIDE_BACKPACK_BORDER);
        this.Border.active = true;
        let introduce: string = "";
        if (this.IsPickaxe) {
            introduce = CDXX_INTRODUCE.has(this.Name) ? CDXX_INTRODUCE.get(this.Name) : "";
        } else {
            const elixir: CDXX_ELIXIR = CDXX_GameData.Instance.Elixir[this.Name];
            introduce = `${elixir.Name}增加${elixir.Amp_JY}点经验值、${elixir.Amp_HP}点血量、${elixir.Amp_HARM}点攻击力、${elixir.Amp_ZL}点战力`;
        }
        CDXX_Equipment.Instance.showBackpackParticulars(this.Icon.spriteFrame, this.Name, introduce);

        if (this.IsPickaxe) {
            if (CDXX_GameData.Instance.CurHold !== this.Name) {
                CDXX_GameData.Instance.CurHold = this.Name;
                CDXX_EventManager.Scene.emit(CDXX_MyEvent.CDXX_SHOW_EQUIPMENT_BORDER, this.Name);
            }
        }

    }

    hideBorder() {
        this.Border.active = false;
    }

    protected onEnable(): void {
        // director.getScene().on("CDXX_HideBackpackBorder", this.hideBorder, this);
        CDXX_EventManager.on(CDXX_MyEvent.CDXX_HIDE_BACKPACK_BORDER, this.hideBorder, this);
    }
}


