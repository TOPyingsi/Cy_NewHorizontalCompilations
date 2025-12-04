import { _decorator, Component, director, Enum, Label, Node, tween, Tween } from 'cc';
import { HJMWK_CURRENCY } from './HJMWK_Constant';
import { HJMWK_GameData } from './HJMWK_GameData';
import { Tools } from 'db://assets/Scripts/Framework/Utils/Tools';
const { ccclass, property } = _decorator;

@ccclass('HJMWK_Currency')
export class HJMWK_Currency extends Component {

    @property({ type: Enum(HJMWK_CURRENCY) })
    Currency: HJMWK_CURRENCY = HJMWK_CURRENCY.绿宝石;

    @property(Label)
    Count: Label = null;

    private currentValue: number = 0;   // 当前数值
    private tweenAction: Tween<{ value: number }> | null = null;

    protected onLoad(): void {
        this.changeTo();
        director.getScene().on("HJMWK_Currency", this.changeTo, this);
    }

    /**
     * 在 count 秒内，把 Label 从当前值变化到 target
     */
    public changeTo(currency: HJMWK_CURRENCY = this.Currency) {
        if (currency != this.Currency) return;
        const target: number = HJMWK_GameData.Instance.userData[Tools.GetEnumKeyByValue(HJMWK_CURRENCY, this.Currency)];
        const duration: number = 1;
        if (!this.Count) return;

        // 如果之前有 tween 动画，先停止
        if (this.tweenAction) {
            this.tweenAction.stop();
        }

        // 读取当前 Label 数值（如果为空就用缓存值）
        this.currentValue = parseFloat(this.Count.string) || this.currentValue;

        // 使用对象来承载插值
        let obj = { value: this.currentValue };

        this.tweenAction = tween(obj)
            .to(duration, { value: target }, {
                onUpdate: (val) => {
                    if (this.Count) {
                        this.Count.string = Math.floor(val.value).toString();
                    }
                }
            })
            .call(() => {
                this.currentValue = target; // 最终赋值
            })
            .start();
    }
}


