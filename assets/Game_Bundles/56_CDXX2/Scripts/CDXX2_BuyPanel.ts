import { _decorator, Component, JsonAsset, Label, Sprite, SpriteFrame } from 'cc';
import { CDXX2_PICKAXE } from './CDXX2_Constant';
import { CDXX2_Tool } from './CDXX2_Tool';
import { BundleManager } from 'db://assets/Scripts/Framework/Managers/BundleManager';
import { CDXX2_GameData } from './CDXX2_GameData';
import { CDXX2_UIController } from './CDXX2_UIController';
import { CDXX2_Equipment } from './CDXX2_Equipment';
const { ccclass, property } = _decorator;

//“奖杯直购镐子”面板，把指定镐子的名字、价格、图标拉取并显示，玩家点击购买时直接扣奖杯发镐子，奖杯不足弹提示。

@ccclass('CDXX2_BuyPanel')
export class CDXX2_BuyPanel extends Component {
    @property(Label)
    Name: Label = null;

    @property(Sprite)
    Icon: Sprite = null;

    @property(Label)
    Price: Label = null;

    private _price: number = 0;
    private _pickaxeName: string = "";

    show(type: CDXX2_PICKAXE) {
        this.node.active = true;
        this._pickaxeName = CDXX2_Tool.GetEnumKeyByValue(CDXX2_PICKAXE, type);
        console.error(this._pickaxeName);

        BundleManager.LoadJson("56_CDXX2", "PickaxeData").then((jsonAsset: JsonAsset) => {
            const json = jsonAsset.json[this._pickaxeName];
            this.Name.string = json.Name;
            this.Price.string = CDXX2_Tool.formatNumber(json.Price);
            this._price = json.Price;
            BundleManager.LoadSpriteFrame("56_CDXX2", `Sprites/刀/${this._pickaxeName}`).then((sf: SpriteFrame) => {
                this.Icon.spriteFrame = sf;
            })
        })
    }

    close() {
        this.node.active = false;
    }

    buy() {
        console.log(CDXX2_GameData.Instance.userData.奖杯);

        if (CDXX2_GameData.Instance.userData.奖杯 >= this._price) {
            CDXX2_GameData.AddPickaxeByName(this._pickaxeName);
            // this.scheduleOnce(() => { CDXX2_Equipment.Instance.show(); }, 0.1)
            CDXX2_UIController.Instance.TipsPanel.show("购买成功")
            CDXX2_GameData.Instance.userData.奖杯 -= this._price;
        } else {
            CDXX2_UIController.Instance.TipsPanel.show("奖杯不够")
        }

        CDXX2_UIController.Instance.showCup();
    }
}


