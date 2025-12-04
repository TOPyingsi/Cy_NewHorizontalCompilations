import { _decorator, Component, JsonAsset, Label, Sprite, SpriteFrame } from 'cc';
import { CDXX_PICKAXE } from './CDXX_Constant';
import { CDXX_Tool } from './CDXX_Tool';
import { BundleManager } from 'db://assets/Scripts/Framework/Managers/BundleManager';
import { CDXX_GameData } from './CDXX_GameData';
import { CDXX_UIController } from './CDXX_UIController';
import { CDXX_Equipment } from './CDXX_Equipment';
const { ccclass, property } = _decorator;

@ccclass('CDXX_BuyPanel')
export class CDXX_BuyPanel extends Component {
    @property(Label)
    Name: Label = null;

    @property(Sprite)
    Icon: Sprite = null;

    @property(Label)
    Price: Label = null;

    private _price: number = 0;
    private _pickaxeName: string = "";

    show(type: CDXX_PICKAXE) {
        this.node.active = true;
        this._pickaxeName = CDXX_Tool.GetEnumKeyByValue(CDXX_PICKAXE, type);
        console.error(this._pickaxeName);

        BundleManager.LoadJson("52_CDXX_Bundle", "PickaxeData").then((jsonAsset: JsonAsset) => {
            const json = jsonAsset.json[this._pickaxeName];
            this.Name.string = json.Name;
            this.Price.string = CDXX_Tool.formatNumber(json.Price);
            this._price = json.Price;
            BundleManager.LoadSpriteFrame("52_CDXX_Bundle", `Sprites/枪/${this._pickaxeName}`).then((sf: SpriteFrame) => {
                this.Icon.spriteFrame = sf;
            })
        })
    }

    close() {
        this.node.active = false;
    }

    buy() {
        console.log(CDXX_GameData.Instance.userData.奖杯);

        if (CDXX_GameData.Instance.userData.奖杯 >= this._price) {
            CDXX_GameData.AddPickaxeByName(this._pickaxeName);
            // this.scheduleOnce(() => { CDXX_Equipment.Instance.show(); }, 0.1)
            CDXX_UIController.Instance.TipsPanel.show("购买成功")
            CDXX_GameData.Instance.userData.奖杯 -= this._price;
        } else {
            CDXX_UIController.Instance.TipsPanel.show("奖杯不够")
        }

        CDXX_UIController.Instance.showCup();
    }
}


