import { _decorator, Component, JsonAsset, Label, Sprite, SpriteFrame } from 'cc';
import { SJNDGZ_PICKAXE } from './SJNDGZ_Constant';
import { SJNDGZ_Tool } from './SJNDGZ_Tool';
import { BundleManager } from 'db://assets/Scripts/Framework/Managers/BundleManager';
import { SJNDGZ_GameData } from './SJNDGZ_GameData';
import { SJNDGZ_UIController } from './SJNDGZ_UIController';
import { SJNDGZ_Equipment } from './SJNDGZ_Equipment';
import { SJNDGZ_Pickaxe } from './SJNDGZ_Pickaxe';
const { ccclass, property } = _decorator;

@ccclass('SJNDGZ_BuyPanel')
export class SJNDGZ_BuyPanel extends Component {
    @property(Label)
    Name: Label = null;

    @property(Sprite)
    Icon: Sprite = null;

    @property(Label)
    Price: Label = null;

    private _price: number = 0;
    private _pickaxeName: string = "";
    private _showType: SJNDGZ_PICKAXE = SJNDGZ_PICKAXE.木镐;

    show(type: SJNDGZ_PICKAXE) {
        this._showType = type;
        this.node.active = true;
        this._pickaxeName = SJNDGZ_Tool.GetEnumKeyByValue(SJNDGZ_PICKAXE, type);

        BundleManager.LoadJson("12_SJNDGZ_Bundle", "PickaxeData").then((jsonAsset: JsonAsset) => {
            const json = jsonAsset.json[this._pickaxeName];
            this.Name.string = json.Name;
            this.Price.string = SJNDGZ_Tool.formatNumber(json.Price);
            this._price = json.Price;
            BundleManager.LoadSpriteFrame("12_SJNDGZ_Bundle", `Sprites/镐子/${this._pickaxeName}`).then((sf: SpriteFrame) => {
                this.Icon.spriteFrame = sf;
            })
        })
    }

    close() {
        this.node.active = false;
    }

    buy() {
        if (this._showType > SJNDGZ_GameData.Instance.userData.拥有镐子最高等级 + 1) {
            const name = SJNDGZ_Tool.GetEnumKeyByValue(SJNDGZ_PICKAXE, SJNDGZ_GameData.Instance.userData.拥有镐子最高等级 + 1);
            SJNDGZ_UIController.Instance.TipsPanel.show(`请先购买${name}!`);
            return;
        }

        if (SJNDGZ_GameData.Instance.userData.奖杯 >= this._price) {
            SJNDGZ_GameData.AddPickaxeByName(this._pickaxeName);
            this.scheduleOnce(() => { SJNDGZ_Equipment.Instance.show(); }, 0.1)
            SJNDGZ_UIController.Instance.TipsPanel.show("购买成功")
            SJNDGZ_GameData.Instance.userData.奖杯 -= this._price;
            SJNDGZ_GameData.Instance.userData.拥有镐子最高等级 = this._showType;
        } else {
            SJNDGZ_UIController.Instance.TipsPanel.show("奖杯不够")
        }
        SJNDGZ_UIController.Instance.showCup();
    }
}


