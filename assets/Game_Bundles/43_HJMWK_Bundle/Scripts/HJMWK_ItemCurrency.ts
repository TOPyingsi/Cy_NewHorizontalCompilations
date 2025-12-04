import { _decorator, Component, director, Enum, EventTouch, JsonAsset, Node } from 'cc';
import { HJMWK_CURRENCY, HJMWK_PROP } from './HJMWK_Constant';
import { HJMWK_GameData } from './HJMWK_GameData';
import { Tools } from 'db://assets/Scripts/Framework/Utils/Tools';
import { HJMWK_GameManager } from './HJMWK_GameManager';
import { HJMWK_Equipment } from './HJMWK_Equipment';
const { ccclass, property } = _decorator;

@ccclass('HJMWK_ItemCurrency')
export class HJMWK_ItemCurrency extends Component {

    @property({ type: Enum(HJMWK_CURRENCY) })
    Currency: HJMWK_CURRENCY = HJMWK_CURRENCY.红宝石;

    @property({ type: Enum(HJMWK_CURRENCY) })
    NeedCurrency: HJMWK_CURRENCY = HJMWK_CURRENCY.红宝石;

    @property
    NeedCount: number = 10000;

    Click(target: EventTouch) {
        if (!target.getCurrentTarget()) return;

        if (HJMWK_GameData.Instance.userData[Tools.GetEnumKeyByValue(HJMWK_CURRENCY, this.NeedCurrency)] < this.NeedCount) {
            HJMWK_GameManager.Instance.showTips("货币不足！");
            return;
        }
        const max: number = Math.floor(HJMWK_GameData.Instance.userData[Tools.GetEnumKeyByValue(HJMWK_CURRENCY, this.NeedCurrency)] / this.NeedCount);
        HJMWK_GameData.Instance.userData[Tools.GetEnumKeyByValue(HJMWK_CURRENCY, this.NeedCurrency)] -= this.NeedCount * max;
        HJMWK_GameData.Instance.userData[Tools.GetEnumKeyByValue(HJMWK_CURRENCY, this.Currency)] += max;
        director.getScene().emit("HJMWK_Currency", this.NeedCurrency);
        director.getScene().emit("HJMWK_Currency", this.Currency);
        HJMWK_GameData.DateSave();
    }

    Click2() {
        let flag: boolean = false;
        for (const key in HJMWK_GameData.Instance.Prop) {
            if (Tools.hasKey(HJMWK_GameManager.Instance.CubeData, key)) {
                flag = true;
                HJMWK_GameData.Instance.userData["红宝石"] += HJMWK_GameManager.Instance.CubeData.json[key]["Price"] * HJMWK_GameData.Instance.Prop[key].Num;
                delete HJMWK_GameData.Instance.Prop[key];
            }
        }
        if (flag) {
            director.getScene().emit("HJMWK_Currency", HJMWK_CURRENCY.红宝石);
            HJMWK_GameData.DateSave();
            HJMWK_Equipment.Instance.showAllProp();
        } else {
            HJMWK_GameManager.Instance.showTips("没有方块可卖！");
        }
    }

}


