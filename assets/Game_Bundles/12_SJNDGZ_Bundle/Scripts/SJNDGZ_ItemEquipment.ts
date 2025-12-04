import { _decorator, Component, EventTouch, find, Label, Node, Sprite, SpriteFrame, tween, Tween, UIOpacity } from 'cc';
import { BundleManager } from 'db://assets/Scripts/Framework/Managers/BundleManager';
import { SJNDGZ_EventManager, SJNDGZ_MyEvent } from './SJNDGZ_EventManager';
import { SJNDGZ_UIController } from './SJNDGZ_UIController';
import SJNDGZ_PlayerController from './SJNDGZ_PlayerController';
const { ccclass, property } = _decorator;

@ccclass('SJNDGZ_ItemEquipment')
export class SJNDGZ_ItemEquipment extends Component {

    Icon: Sprite = null;
    Num: Label = null;
    Border: Node = null;

    Name: string = "";

    protected onLoad(): void {
        this.Icon = find("Icon", this.node).getComponent(Sprite);
        this.Num = find("Num", this.node).getComponent(Label);
        this.Border = find("金框边", this.node);

        this.node.on(Node.EventType.TOUCH_END, this.onClick, this);
        SJNDGZ_EventManager.on(SJNDGZ_MyEvent.SJNDGZ_HIDEBORDER, this.hideBorder, this);
    }

    show(name: string, num: number = 99) {
        this.Name = name;
        BundleManager.LoadSpriteFrame("12_SJNDGZ_Bundle", `Sprites/镐子/${name}`).then((sf: SpriteFrame) => {
            this.Icon.spriteFrame = sf;
        })
        this.Num.string = num.toString();
    }

    showProp(name: string, num: number = 99) {
        this.Name = name;
        console.log(name);

        BundleManager.LoadSpriteFrame("12_SJNDGZ_Bundle", `Sprites/Prop/${name}`).then((sf: SpriteFrame) => {
            this.Icon.spriteFrame = sf;
        })
        this.Num.string = num.toString();
    }

    /**隐藏金框 */
    hideBorder() {
        this.Border.active = false;
    }

    onClick(event: EventTouch) {
        SJNDGZ_EventManager.Scene.emit(SJNDGZ_MyEvent.SJNDGZ_HIDEBORDER);
        this.Border.active = true;
        SJNDGZ_UIController.Instance.TipsPanel.show(`装备了${this.Name}`)
        SJNDGZ_PlayerController.Instance.SwitchSkin(this.Name);
    }
}


