import { _decorator, Component, Enum, find, JsonAsset, Label, Sprite, SpriteFrame } from 'cc';
import { CDXX2_PICKAXE, CDXX2_PROP } from './CDXX2_Constant';
import { CDXX2_Tool } from './CDXX2_Tool';
import { BundleManager } from 'db://assets/Scripts/Framework/Managers/BundleManager';
import { CDXX2_GameData } from './CDXX2_GameData';
import { CDXX2_UIController } from './CDXX2_UIController';
import { CDXX2_Equipment } from './CDXX2_Equipment';
const { ccclass, property } = _decorator;

//“购买其他镐子”面板，先检查玩家背包里的指定素材与低级镐子数量是否足够
//够则一次性扣除并发放新镐子，不够弹提示；同时负责把对应图标、名字拉取并显示到界面上。

@ccclass('CDXX2_BuyOtherPanel')
export class CDXX2_BuyOtherPanel extends Component {
    @property({ type: Enum(CDXX2_PICKAXE) })
    Type: CDXX2_PICKAXE = CDXX2_PICKAXE.良品影刀;

    @property({ type: [Enum(CDXX2_PROP)] })
    NeedProps: CDXX2_PROP[] = [];

    @property({ type: [Number] })
    NeedPropNumber: number[] = [];

    @property({ type: [Enum(CDXX2_PICKAXE)] })
    NeedPickaxe: CDXX2_PICKAXE[] = [];

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
        this._pickaxeName = CDXX2_Tool.GetEnumKeyByValue(CDXX2_PICKAXE, this.Type);
        BundleManager.LoadJson("56_CDXX2", "PickaxeData").then((jsonAsset: JsonAsset) => {
            const json = jsonAsset.json[this._pickaxeName];
            this.Name = json.Name;
        })
        find("Panel/内容/提示/Name", this.node).getComponent(Label).string = this._pickaxeName;

        BundleManager.LoadSpriteFrame("56_CDXX2", `Sprites/刀/${this._pickaxeName}`).then((sf: SpriteFrame) => {
            find("Panel/内容/提示/Icon", this.node).getComponent(Sprite).spriteFrame = sf;
        })
    }

    close() {
        this.node.active = false;
    }

    IsCanBuy() {
        for (let index = 0; index < this.NeedProps.length; index++) {
            const name: string = CDXX2_Tool.GetEnumKeyByValue(CDXX2_PROP, this.NeedProps[index]);
            if (CDXX2_GameData.Instance.userData[name] < this.NeedPropNumber[index]) {
                return false;
                console.error(name);
            }
            // console.error(`购买${this.Name}所需的有${name}：${this.NeedPropNumber[index]}`);
        }

        for (let index = 0; index < this.NeedPickaxe.length; index++) {
            const name: string = CDXX2_Tool.GetEnumKeyByValue(CDXX2_PICKAXE, this.NeedPickaxe[index]);
            if (!CDXX2_GameData.Instance.Pickaxe[name] || CDXX2_GameData.Instance.Pickaxe[name].Num < this.NeedPropNumber[index]) {
                console.error(name);
                return false;
            }
            // console.error(`购买${this.Name}所需的有${name}：${this.NeedPickaxeNumber[index]}`);
        }

        return true

    }

    buy() {
        if (!this.IsCanBuy()) {
            CDXX2_UIController.Instance.TipsPanel.show("缺少相应的材料");
            return;
        }

        for (let index = 0; index < this.NeedProps.length; index++) {
            const name: string = CDXX2_Tool.GetEnumKeyByValue(CDXX2_PROP, this.NeedProps[index]);
            CDXX2_GameData.Instance.userData[name] -= this.NeedPropNumber[index];
        }

        for (let index = 0; index < this.NeedPickaxe.length; index++) {
            const name: string = CDXX2_Tool.GetEnumKeyByValue(CDXX2_PICKAXE, this.NeedPickaxe[index]);
            CDXX2_GameData.LosePickaxeByName(name, this.NeedPickaxeNumber[index]);
        }
        CDXX2_GameData.AddPickaxeByName(this._pickaxeName);
        // this.scheduleOnce(() => { CDXX2_Equipment.Instance.show(); }, 0.1)
        CDXX2_UIController.Instance.showCup();
    }
}


