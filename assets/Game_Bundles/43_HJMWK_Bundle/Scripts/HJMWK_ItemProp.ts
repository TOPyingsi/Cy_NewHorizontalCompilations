import { _decorator, Component, director, Enum, JsonAsset, Label, labelAssembler, Node, Sprite, SpriteFrame } from 'cc';
import { HJMWK_CURRENCY, HJMWK_PROP } from './HJMWK_Constant';
import { Tools } from 'db://assets/Scripts/Framework/Utils/Tools';
import { HJMWK_GameData } from './HJMWK_GameData';
import { BundleManager } from 'db://assets/Scripts/Framework/Managers/BundleManager';
import { GameManager } from 'db://assets/Scripts/GameManager';
import { HJMWK_Equipment } from './HJMWK_Equipment';
import { HJMWK_GameManager } from './HJMWK_GameManager';
const { ccclass, property } = _decorator;

@ccclass('HJMWK_ItemProp')
export class HJMWK_ItemProp extends Component {

    @property({ type: Enum(HJMWK_PROP) })
    Prop: HJMWK_PROP = HJMWK_PROP.木镐;

    @property({ type: Enum(HJMWK_CURRENCY) })
    NeedCurrency: HJMWK_CURRENCY = HJMWK_CURRENCY.红宝石;

    @property
    NeedCurrencyNum: number = 100;

    @property(SpriteFrame)
    SFs: SpriteFrame[] = [];

    @property(Sprite)
    IconSprite: Sprite = null;

    @property(Label)
    Name: Label = null;

    @property(Sprite)
    CurrencySprite: Sprite = null;

    @property(Label)
    CurrencyLabel: Label = null;

    @property(Label)
    HarmLabel: Label = null;

    @property(Node)
    Buttons: Node[] = [];

    private _propName: string = "";
    private _isHave: boolean = false;

    protected start(): void {
        this.show();
    }

    show() {
        this._propName = Tools.GetEnumKeyByValue(HJMWK_PROP, this.Prop);
        this.Name.string = this._propName;
        this.CurrencySprite.spriteFrame = this.SFs[this.NeedCurrency];
        this.CurrencyLabel.string = this.NeedCurrencyNum.toString();
        BundleManager.LoadJson("43_HJMWK_Bundle", "Data").then((jsonAsset: JsonAsset) => {
            this.HarmLabel.string = jsonAsset.json[this._propName]["Gain"];
        })
        this._isHave = HJMWK_GameData.Instance.Prop[this._propName] && HJMWK_GameData.Instance.Prop[this._propName].Num > 0;
        BundleManager.LoadSpriteFrame("43_HJMWK_Bundle", `Sprites/道具/${this._propName}`).then((sf: SpriteFrame) => {
            this.IconSprite.spriteFrame = sf;
        })
        this.showButton();
    }

    showButton() {
        this.Buttons[0].active = this._isHave;
        this.Buttons[1].active = !this._isHave;
    }

    buy() {
        if (this._isHave) return;

        if (HJMWK_GameData.Instance.userData[Tools.GetEnumKeyByValue(HJMWK_CURRENCY, this.NeedCurrency)] < this.NeedCurrencyNum) {
            HJMWK_GameManager.Instance.showTips("货币不足！");
            return;
        }
        HJMWK_GameData.Instance.userData[Tools.GetEnumKeyByValue(HJMWK_CURRENCY, this.NeedCurrency)] -= this.NeedCurrencyNum;
        HJMWK_Equipment.Instance.addProp(this._propName);
        director.getScene().emit("HJMWK_Currency", this.NeedCurrency);
        this._isHave = true;
        this.showButton();
    }

}


