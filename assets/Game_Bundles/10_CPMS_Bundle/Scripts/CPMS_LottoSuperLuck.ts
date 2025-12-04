import { _decorator, Component, Label, Node, randomRangeInt } from 'cc';
import { CPMS_Lotto } from './CPMS_Lotto';
import { CPMS_GameUI } from './CPMS_GameUI';
const { ccclass, property } = _decorator;

@ccclass('CPMS_LottoSuperLuck')
export class CPMS_LottoSuperLuck extends CPMS_Lotto {

    @property(Label)
    winLabel: Label;

    numbers2: number[] = [];
    clearLimit: number = 0.5;
    winNum: number = 0;
    moneyNumber: number[] = [700, 25, 500, 20, 10, 600, 30, 600, 30, 500];
    winMoney: number = 0;

    Init() {
        this.winNum = randomRangeInt(0, 100);
        this.winLabel.string = this.winNum < 10 ? ("0" + this.winNum) : this.winNum.toString();
        this.numbers = [];
        this.numbers2 = [];
        this.trueMoneyNumber = [];
        for (let i = 0; i < this.moneyNumber.length; i++) {
            let element = this.moneyNumber[i];
            this.trueMoneyNumber.push(CPMS_GameUI.Instance.isVideo ? element * 100 : element);
        }
        for (let i = 0; i < 10; i++) {
            let nums: number[] = [];
            this.numbers.push(nums);
            for (let j = 0; j < i + 1; j++) {
                const element = randomRangeInt(0, 100);
                nums.push(element);
                this.numbers2.push(element);
            }
        }
        for (let i = 0; i < this.randomNumbers.children.length; i++) {
            const element = this.randomNumbers.children[i];
            let num = this.numbers2[i];
            element.getComponent(Label).string = num < 10 ? ("0" + num) : num.toString();
        }
        for (let i = 0; i < this.moneyNumbers.children.length; i++) {
            const element = this.moneyNumbers.children[i];
            element.getComponent(Label).string = this.trueMoneyNumber[i] + "币";
            element.children[0].active = false;
        }
        this.takeOnTouch();
    }

    Check() {
        this.winMoney = 0;
        var winArray: number[] = [];
        for (let i = 0; i < this.numbers.length; i++) {
            const element = this.numbers[i];
            for (let j = 0; j < element.length; j++) {
                const element2 = element[j];
                if (element2 == this.winNum) {
                    winArray.push(i);
                    break;
                }
            }
        }
        for (let i = 0; i < winArray.length; i++) {
            const element = winArray[i];
            this.winMoney += this.trueMoneyNumber[element];
            this.moneyNumbers.children[element].children[0].active = true;
        }
        CPMS_GameUI.Instance.CheckLotto(this.winMoney);
    }
}


