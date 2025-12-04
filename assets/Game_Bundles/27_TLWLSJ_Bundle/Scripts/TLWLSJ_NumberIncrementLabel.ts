import { _decorator, clamp, Component, Label, math, Node, Tween, tween, TweenSystem, v3, Vec2 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('TLWLSJ_NumberIncrementLabel')
export class TLWLSJ_NumberIncrementLabel extends Component {
    @property(Label)
    private numberLabel: Label = null!;

    @property
    private duration: number = 1.0;

    @property
    private useThousandsSeparator: boolean = false;

    @property
    public currentNumber: number = 0;

    @property
    AddStr: string = "";

    @property
    Clamp: Vec2 = new Vec2();

    private _activeTween: Tween<any> | null = null;

    public playNumberIncrementTo(targetNumber: number, duration?: number) {
        // 停止之前可能正在进行的动画
        if (this._activeTween) {
            this._activeTween.stop();
            this._activeTween = null;
        }

        const animDuration = duration || this.duration;

        // 使用类型断言来解决类型检查问题
        const tweenObj = {
            currentNumber: this.currentNumber
        };

        this._activeTween = tween(tweenObj)
            .call(() => {
                this.node.scale = v3(1.2, 1.2, 1.2);
            })
            .to(animDuration, {
                currentNumber: targetNumber
            }, {
                onUpdate: () => {
                    const currentValue = Math.floor(tweenObj.currentNumber);
                    this.currentNumber = currentValue;
                    this.updateLabelText(currentValue);
                },
                easing: 'quadOut'
            })
            .call(() => {
                this.node.scale = v3(1, 1, 1);
            })
            .start();
    }

    private formatNumber(number: number): string {
        if (this.useThousandsSeparator) {
            return number.toLocaleString('en-US');
        }
        number = math.clamp(number, this.Clamp.x, this.Clamp.y);
        return number.toString() + this.AddStr;
    }

    private updateLabelText(value: number) {
        if (this.numberLabel) {
            this.numberLabel.string = this.formatNumber(value);
        }
    }

    public setNumberDirectly(number: number) {
        // 如果有正在进行的动画，停止它
        if (this._activeTween) {
            this._activeTween.stop();
            this._activeTween = null;
        }
        this.currentNumber = number;
        this.updateLabelText(number);
    }

    public getCurrentNumber(): number {
        return this.currentNumber;
    }

    protected onDestroy() {
        // 确保在节点销毁时停止动画
        if (this._activeTween) {
            this._activeTween.stop();
            this._activeTween = null;
        }
    }
}


