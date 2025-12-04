import { _decorator, Component, EventTouch, find, Label, Node, Sprite, SpriteFrame, tween, Tween, UIOpacity, UITransform, v3 } from 'cc';
import { BundleManager } from 'db://assets/Scripts/Framework/Managers/BundleManager';
import { CDXX_EventManager, CDXX_MyEvent } from './CDXX_EventManager';
import { CDXX_UIController } from './CDXX_UIController';
import CDXX_PlayerController from './CDXX_PlayerController';
import { CDXX_GameData } from './CDXX_GameData';
import { CDXX_Equipment } from './CDXX_Equipment';
import { CDXX_ELIXIR } from './CDXX_Constant';
const { ccclass, property } = _decorator;

@ccclass('CDXX_ItemEquipment')
export class CDXX_ItemEquipment extends Component {

    Icon: Sprite = null;
    Num: Label = null;
    Border: Node = null;

    Name: string = "";
    Count: number = 0;

    // private _width: number = 100;
    IsPickaxe: boolean = false;

    protected onLoad(): void {
        this.Icon = find("Icon", this.node).getComponent(Sprite);
        this.Num = find("Num", this.node).getComponent(Label);
        this.Border = find("金框边", this.node);

        this.node.on(Node.EventType.TOUCH_END, this.onClick, this);
    }

    protected onEnable(): void {
        CDXX_EventManager.on(CDXX_MyEvent.CDXX_HIDEBORDER, this.hideBorder, this);
        CDXX_EventManager.on(CDXX_MyEvent.CDXX_SHOW_EQUIPMENT_BORDER, this.showByName, this);
    }

    protected onDisable(): void {
        CDXX_EventManager.off(CDXX_MyEvent.CDXX_HIDEBORDER, this.hideBorder, this);
        CDXX_EventManager.off(CDXX_MyEvent.CDXX_SHOW_EQUIPMENT_BORDER, this.showByName, this);
    }

    show(name: string, num: number = 99) {
        this.Name = name;
        this.IsPickaxe = true;
        if (CDXX_PlayerController.Instance.GunName == name) {
            this.Border.active = true;
        }
        BundleManager.LoadSpriteFrame("52_CDXX_Bundle", `Sprites/枪/${name}`).then((sf: SpriteFrame) => {
            console.log(sf);

            this.Icon.spriteFrame = sf;
        })
        this.Num.string = num.toString();
        this.Count = num;
    }

    showElixir(name: string, num: number = 99) {
        this.Name = name;
        this.IsPickaxe = false;
        BundleManager.LoadSpriteFrame("52_CDXX_Bundle", `Sprites/UI/丹药/${name}`).then((sf: SpriteFrame) => {
            this.Icon.spriteFrame = sf;
        })
        this.Num.string = num.toString();
        this.Count = num;
    }

    showProp(name: string, num: number = 99) {
        this.Name = name;
        BundleManager.LoadSpriteFrame("52_CDXX_Bundle", `Sprites/Prop/${name}`).then((sf: SpriteFrame) => {
            this.Icon.spriteFrame = sf;
        })
        this.Num.string = num.toString();
    }

    changeCount(change: number) {
        this.Count += change;
        this.Num.string = this.Count.toString();
    }

    /**隐藏金框 */
    hideBorder() {
        this.Border.active = false;
    }

    showByName(name: string) {
        if (this.Name !== name) return;
        this.onClick();
    }


    onClick() {
        if (!this.IsPickaxe) {
            // CDXX_UIController.Instance.TipsPanel.show(`这个是${this.Name}，不可装备！`);
            const elixir: CDXX_ELIXIR = CDXX_GameData.Instance.Elixir[this.Name];
            CDXX_Equipment.Instance.ShowTips(`${elixir.Name}增加${elixir.Amp_JY}点经验值、${elixir.Amp_HP}点血量、${elixir.Amp_HARM}点攻击力、${elixir.Amp_ZL}点战力`);
            return;
        }
        CDXX_EventManager.Scene.emit(CDXX_MyEvent.CDXX_HIDEBORDER);
        this.Border.active = true;
        CDXX_GameData.Instance.CurHold = this.Name;
        CDXX_UIController.Instance.TipsPanel.show(`装备了${this.Name}`)
        CDXX_PlayerController.Instance.SwitchSkin(this.Name);
    }
}


