import { _decorator, Component, Label, Node, randomRangeInt } from 'cc';
import { CPMS_Lotto } from './CPMS_Lotto';
import { CPMS_GameUI } from './CPMS_GameUI';
const { ccclass, property } = _decorator;

@ccclass('CPMS_LottoLanBaoShi9')
export class CPMS_LottoLanBaoShi9 extends CPMS_Lotto {

    @property
    num: number = 0;

    moneyNumber: number[] = [150, 10, 700, 70, 180, 60, 1000, 10, 80, 250, 15, 700];
    winMoney: number = 0;

    Init() {
        this.numbers = [];
        this.trueMoneyNumber = [];
        for (let i = 0; i < this.moneyNumber.length; i++) {
            let element = this.moneyNumber[i];
            this.trueMoneyNumber.push(CPMS_GameUI.Instance.isVideo ? element * 100 : element);
        }
        for (let i = 0; i < this.num; i++) {
            let num: number = randomRangeInt(0, 100);
            this.numbers.push(num);
        }
        while (this.numbers[0] == this.numbers[1]) {
            this.numbers[1] = randomRangeInt(0, 100);
        }
        while (this.numbers[1] == this.numbers[2] || this.numbers[0] == this.numbers[2]) {
            this.numbers[2] = randomRangeInt(0, 100);
        }
        for (let i = 0; i < this.randomNumbers.children.length; i++) {
            const element = this.randomNumbers.children[i];
            let num = this.numbers[i];
            element.getComponent(Label).string = num < 10 ? ("0" + num) : num;
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
        var winArray2: number[] = [];
        for (let i = 3; i < this.numbers.length; i++) {
            const element = this.numbers[i];
            for (let j = 0; j < 3; j++) {
                const element2 = this.numbers[j];
                if (element == element2) {
                    let a = Math.floor(element / 10);
                    let b = element % 10;
                    if (a == 9 || b == 9) winArray2.push(i - 3);
                    else winArray.push(i - 3);
                    break;
                }
            }
        }
        for (let i = 0; i < winArray.length; i++) {
            const element = winArray[i];
            this.winMoney += this.trueMoneyNumber[element];
            this.moneyNumbers.children[element].children[0].active = true;
        }
        for (let i = 0; i < winArray2.length; i++) {
            const element = winArray2[i];
            this.winMoney += this.trueMoneyNumber[element] * 9;
            this.moneyNumbers.children[element].children[0].active = true;
        }
        CPMS_GameUI.Instance.CheckLotto(this.winMoney);
    }
}


