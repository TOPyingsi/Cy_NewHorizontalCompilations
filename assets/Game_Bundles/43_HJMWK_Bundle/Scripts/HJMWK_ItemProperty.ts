import { _decorator, Component, director, Enum, EventTouch, Label, Node, Sprite, SpriteFrame } from 'cc';
import { HJMWK_CURRENCY, HJMWK_GradePrice, HJMWK_PROPERTY, HJMWK_Upgrade } from './HJMWK_Constant';
import { HJMWK_GameData } from './HJMWK_GameData';
import { Tools } from 'db://assets/Scripts/Framework/Utils/Tools';
import Banner from 'db://assets/Scripts/Banner';
import { HJMWK_GameManager } from './HJMWK_GameManager';
const { ccclass, property } = _decorator;

@ccclass('HJMWK_ItemProperty')
export class HJMWK_ItemProperty extends Component {
    @property({ type: Enum(HJMWK_PROPERTY) })
    Property: HJMWK_PROPERTY = HJMWK_PROPERTY.挖矿伤害;

    @property(SpriteFrame)
    SFs: SpriteFrame[] = [];

    @property(Sprite)
    Sprite: Sprite = null;

    @property(Sprite)
    IconSprite: Sprite = null;

    @property(Label)
    CurNum: Label = null;

    @property(Label)
    NextNum: Label = null;

    @property(Label)
    PriceNum: Label = null;

    @property(Node)
    MaxGrade: Node[] = [];

    private _needCurrency: HJMWK_CURRENCY = HJMWK_CURRENCY.红宝石;
    private _needPrice: number = 0;

    protected onLoad(): void {
        this.show();
    }

    show() {
        const grade: number = HJMWK_GameData.Instance.userData[Tools.GetEnumKeyByValue(HJMWK_PROPERTY, this.Property)];
        if (grade >= 9) {
            this.NextNum.string = "100%";
            this.Sprite.fillRange = 1;
            this.MaxGrade.forEach(e => e.active = false);
            return;
        }
        this.Sprite.fillRange = grade / 10;
        this.CurNum.string = grade * 10 + "%";
        this.NextNum.string = (grade + 1) * 10 + "%";
        const upgrade: HJMWK_Upgrade = HJMWK_GradePrice[grade];
        this.IconSprite.spriteFrame = this.SFs[upgrade.currency];
        this.PriceNum.string = upgrade.need.toString();
        this._needCurrency = upgrade.currency;
        this._needPrice = upgrade.need;
    }

    Click(target: EventTouch) {
        switch (target.getCurrentTarget().name) {
            case "升级":
                if (HJMWK_GameData.Instance.userData[Tools.GetEnumKeyByValue(HJMWK_CURRENCY, this._needCurrency)] < this._needPrice) {
                    HJMWK_GameManager.Instance.showTips("货币不足！");
                    return;
                } else {
                    HJMWK_GameData.Instance.userData[Tools.GetEnumKeyByValue(HJMWK_CURRENCY, this._needCurrency)] -= this._needPrice;
                    HJMWK_GameData.Instance.userData[Tools.GetEnumKeyByValue(HJMWK_PROPERTY, this.Property)]++;
                    director.getScene().emit("HJMWK_Currency", this._needCurrency);
                    this.show();
                    HJMWK_GameData.DateSave();
                }
                break;
            case "免费升级":
                Banner.Instance.ShowVideoAd(() => {
                    HJMWK_GameData.Instance.userData[Tools.GetEnumKeyByValue(HJMWK_PROPERTY, this.Property)]++;
                    this.show();
                    HJMWK_GameData.DateSave();
                })
                break;
        }
    }

}


