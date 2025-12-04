import { _decorator, Component, Enum, find, JsonAsset, Label, Sprite, SpriteFrame } from 'cc';
import { CDXX_PICKAXE, CDXX_PROP } from './CDXX_Constant';
import { CDXX_Tool } from './CDXX_Tool';
import { BundleManager } from 'db://assets/Scripts/Framework/Managers/BundleManager';
import { CDXX_GameData } from './CDXX_GameData';
import { CDXX_UIController } from './CDXX_UIController';
import { CDXX_Equipment } from './CDXX_Equipment';
const { ccclass, property } = _decorator;



@ccclass('CDXX_BuyOtherPanel')
export class CDXX_BuyOtherPanel extends Component {
    @property({ type: Enum(CDXX_PICKAXE) })
    Type: CDXX_PICKAXE = CDXX_PICKAXE.丛林魅影;

    @property({ type: [Enum(CDXX_PROP)] })
    NeedProps: CDXX_PROP[] = [];

    @property({ type: [Number] })
    NeedPropNumber: number[] = [];

    @property({ type: [Enum(CDXX_PICKAXE)] })
    NeedPickaxe: CDXX_PICKAXE[] = [];

    @property({ type: [Number] })
    NeedPickaxeNumber: number[] = [];

    // @property(Label)
    // Name: Label = null;

    // @property(Label)
    // NumberLabel: Label = null;

    // @property(Label)
    // NumberLabel: Label[] = [];

    Name: string = "";

    private _price: number = 0;
    private _pickaxeName: string = "";

    protected onLoad(): void {
        // this.show();
    }

    show() {
        this.node.active = true;
        this._pickaxeName = CDXX_Tool.GetEnumKeyByValue(CDXX_PICKAXE, this.Type);
        BundleManager.LoadJson("52_CDXX_Bundle", "PickaxeData").then((jsonAsset: JsonAsset) => {
            const json = jsonAsset.json[this._pickaxeName];
            this.Name = json.Name;
        })
        find("Panel/内容/提示/Name", this.node).getComponent(Label).string = this._pickaxeName;

        BundleManager.LoadSpriteFrame("52_CDXX_Bundle", `Sprites/枪/${this._pickaxeName}`).then((sf: SpriteFrame) => {
            find("Panel/内容/提示/Icon", this.node).getComponent(Sprite).spriteFrame = sf;
        })
    }

    close() {
        this.node.active = false;
    }

    IsCanBuy() {
        for (let index = 0; index < this.NeedProps.length; index++) {
            const name: string = CDXX_Tool.GetEnumKeyByValue(CDXX_PROP, this.NeedProps[index]);
            if (CDXX_GameData.Instance.userData[name] < this.NeedPropNumber[index]) {
                return false;
                console.error(name);
            }
            // console.error(`购买${this.Name}所需的有${name}：${this.NeedPropNumber[index]}`);
        }

        for (let index = 0; index < this.NeedPickaxe.length; index++) {
            const name: string = CDXX_Tool.GetEnumKeyByValue(CDXX_PICKAXE, this.NeedPickaxe[index]);
            if (!CDXX_GameData.Instance.Pickaxe[name] || CDXX_GameData.Instance.Pickaxe[name].Num < this.NeedPropNumber[index]) {
                console.error(name);
                return false;
            }
            // console.error(`购买${this.Name}所需的有${name}：${this.NeedPickaxeNumber[index]}`);
        }

        return true

    }

    buy() {
        if (!this.IsCanBuy()) {
            CDXX_UIController.Instance.TipsPanel.show("缺少相应的材料");
            return;
        }

        for (let index = 0; index < this.NeedProps.length; index++) {
            const name: string = CDXX_Tool.GetEnumKeyByValue(CDXX_PROP, this.NeedProps[index]);
            CDXX_GameData.Instance.userData[name] -= this.NeedPropNumber[index];
        }

        for (let index = 0; index < this.NeedPickaxe.length; index++) {
            const name: string = CDXX_Tool.GetEnumKeyByValue(CDXX_PICKAXE, this.NeedPickaxe[index]);
            CDXX_GameData.LosePickaxeByName(name, this.NeedPickaxeNumber[index]);
        }
        CDXX_GameData.AddPickaxeByName(this._pickaxeName);
        // this.scheduleOnce(() => { CDXX_Equipment.Instance.show(); }, 0.1)
        CDXX_UIController.Instance.showCup();
    }
}


