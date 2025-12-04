import { _decorator, Component, Label, Node, randomRangeInt } from 'cc';
import { CPMS_Lotto } from './CPMS_Lotto';
import { CPMS_GameUI } from './CPMS_GameUI';
const { ccclass, property } = _decorator;

@ccclass('CPMS_LottoFaDaCai')
export class CPMS_LottoFaDaCai extends CPMS_Lotto {

    @property
    num: number = 0;

    words: string[] = ["慧", "泰", "昌", "余", "正", "强", "祥", "吉", "寿", "明", "运", "安", "隆", "和"];
    winWords: string[] = ["运", "幸运", "超幸运"];
    moneyNumber: number[] = [800, 40, 600, 35, 50, 100, 90, 600, 70, 80, 600, 60, 80, 300, 70, 850, 10, 80, 90, 800];
    winMoney: number = 0;

    Init() {
        this.numbers = [];
        this.trueMoneyNumber = [];
        for (let i = 0; i < this.moneyNumber.length; i++) {
            let element = this.moneyNumber[i];
            this.trueMoneyNumber.push(CPMS_GameUI.Instance.isVideo ? element * 100 : element);
        }
        for (let i = 0; i < this.num; i++) {
            let num: number = randomRangeInt(0, 200);
            this.numbers.push(num);
        }
        console.log(this.numbers);
        for (let i = 0; i < this.randomNumbers.children.length; i++) {
            const element = this.randomNumbers.children[i];
            let num = this.numbers[i];
            let str = this.words[num % this.words.length];
            if (num == 0) str = this.winWords[2];
            else if (num == 1) str = this.winWords[1];
            else if (num == 2) str = this.winWords[0];
            element.getComponent(Label).string = str;
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
        var winArray3: number[] = [];
        for (let i = 0; i < this.numbers.length; i++) {
            const element = this.numbers[i];
            if (element == 0) winArray.push(i);
            else if (element == 1) winArray2.push(i);
            else if (element == 2) winArray3.push(i);
        }
        for (let i = 0; i < winArray.length; i++) {
            const element = winArray[i];
            this.winMoney += this.trueMoneyNumber[element] * 10;
            this.moneyNumbers.children[element].children[0].active = true;
        }
        for (let i = 0; i < winArray2.length; i++) {
            const element = winArray2[i];
            this.winMoney += this.trueMoneyNumber[element] * 5;
            this.moneyNumbers.children[element].children[0].active = true;
        }
        for (let i = 0; i < winArray3.length; i++) {
            const element = winArray3[i];
            this.winMoney += this.trueMoneyNumber[element];
            this.moneyNumbers.children[element].children[0].active = true;
        }
        CPMS_GameUI.Instance.CheckLotto(this.winMoney);
    }
}


