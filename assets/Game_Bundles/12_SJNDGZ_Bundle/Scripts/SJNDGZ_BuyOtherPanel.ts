import { _decorator, Component, Enum, JsonAsset } from 'cc';
import { SJNDGZ_PICKAXE, SJNDGZ_PROP } from './SJNDGZ_Constant';
import { SJNDGZ_Tool } from './SJNDGZ_Tool';
import { BundleManager } from 'db://assets/Scripts/Framework/Managers/BundleManager';
import { SJNDGZ_GameData } from './SJNDGZ_GameData';
import { SJNDGZ_UIController } from './SJNDGZ_UIController';
import { SJNDGZ_Equipment } from './SJNDGZ_Equipment';
const { ccclass, property } = _decorator;



@ccclass('SJNDGZ_BuyOtherPanel')
export class SJNDGZ_BuyOtherPanel extends Component {
    @property({ type: Enum(SJNDGZ_PICKAXE) })
    Type: SJNDGZ_PICKAXE = SJNDGZ_PICKAXE.木镐;

    @property({ type: [Enum(SJNDGZ_PROP)] })
    NeedProps: SJNDGZ_PROP[] = [];

    @property({ type: [Number] })
    NeedPropNumber: number[] = [];

    @property({ type: [Enum(SJNDGZ_PICKAXE)] })
    NeedPickaxe: SJNDGZ_PICKAXE[] = [];

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
        this._pickaxeName = SJNDGZ_Tool.GetEnumKeyByValue(SJNDGZ_PICKAXE, this.Type);
        BundleManager.LoadJson("12_SJNDGZ_Bundle", "PickaxeData").then((jsonAsset: JsonAsset) => {
            const json = jsonAsset.json[this._pickaxeName];
            this.Name = json.Name;
        })
    }

    close() {
        this.node.active = false;
    }

    IsCanBuy() {
        for (let index = 0; index < this.NeedProps.length; index++) {
            const name: string = SJNDGZ_Tool.GetEnumKeyByValue(SJNDGZ_PROP, this.NeedProps[index]);
            if (SJNDGZ_GameData.Instance.userData[name] < this.NeedPropNumber[index]) {
            }
        }

        for (let index = 0; index < this.NeedPickaxe.length; index++) {
            const name: string = SJNDGZ_Tool.GetEnumKeyByValue(SJNDGZ_PICKAXE, this.NeedPickaxe[index]);
            if (!SJNDGZ_GameData.Instance.Pickaxe[name] || SJNDGZ_GameData.Instance.Pickaxe[name].Num < this.NeedPropNumber[index]) {
            }
        }

        return true

    }

    buy() {
        if (!this.IsCanBuy()) {
            SJNDGZ_UIController.Instance.TipsPanel.show("缺少相应的材料");
            return;
        }

        for (let index = 0; index < this.NeedProps.length; index++) {
            const name: string = SJNDGZ_Tool.GetEnumKeyByValue(SJNDGZ_PROP, this.NeedProps[index]);
            SJNDGZ_GameData.Instance.userData[name] -= this.NeedPropNumber[index];
        }

        for (let index = 0; index < this.NeedPickaxe.length; index++) {
            const name: string = SJNDGZ_Tool.GetEnumKeyByValue(SJNDGZ_PICKAXE, this.NeedPickaxe[index]);
            SJNDGZ_GameData.LosePickaxeByName(name, this.NeedPickaxeNumber[index]);
        }
        SJNDGZ_GameData.AddPickaxeByName(this._pickaxeName);
        this.scheduleOnce(() => { SJNDGZ_Equipment.Instance.show(); }, 0.1)
        SJNDGZ_UIController.Instance.showCup();
    }
}


