import { _decorator, Component, Label, Node, randomRangeInt } from 'cc';
import { CPMS_Lotto } from './CPMS_Lotto';
import { CPMS_GameUI } from './CPMS_GameUI';
const { ccclass, property } = _decorator;

@ccclass('CPMS_LottoDaGuanLan')
export class CPMS_LottoDaGuanLan extends CPMS_Lotto {

    @property
    num: number = 0;

    words: string[] = ["🏀", "🤿", "⚽", "⚾", "🎾", "🎿", "🏈", "🏏", "🏒", "🏸"];
    moneyNumber: number[] = [200, 60, 60, 500, 60, 10, 200, 10];
    winMoney: number = 0;

    Init() {
        this.numbers = [];
        this.trueMoneyNumber = [];
        for (let i = 0; i < this.moneyNumber.length; i++) {
            let element = this.moneyNumber[i];
            this.trueMoneyNumber.push(CPMS_GameUI.Instance.isVideo ? element * 100 : element);
        }
        for (let i = 0; i < this.num; i++) {
            let num: number = randomRangeInt(0, this.words.length);
            this.numbers.push(num);
        }
        for (let i = 0; i < this.randomNumbers.children.length; i++) {
            const element = this.randomNumbers.children[i];
            let num = this.numbers[i];
            element.getComponent(Label).string = this.words[num];
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
            if (element == 0) winArray.push(i);
        }
        for (let i = 0; i < winArray.length; i++) {
            const element = winArray[i];
            this.winMoney += this.trueMoneyNumber[element];
            this.moneyNumbers.children[element].children[0].active = true;
        }
        CPMS_GameUI.Instance.CheckLotto(this.winMoney);
    }
}


