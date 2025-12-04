import { _decorator, Component, Label, Node, randomRangeInt } from 'cc';
import { CPMS_Lotto } from './CPMS_Lotto';
import { CPMS_GameUI } from './CPMS_GameUI';
const { ccclass, property } = _decorator;

@ccclass('CPMS_LottoMiJingDuoBao')
export class CPMS_LottoMiJingDuoBao extends CPMS_Lotto {

    @property
    num: number = 0;

    words: string[] = ["★", "❤", "🏶"];
    moneyNumber: number[] = [400, 10, 700, 20, 400, 30, 250, 10, 800, 50, 600, 10, 450, 60, 50, 800, 70, 60, 30, 700];
    winMoney: number = 0;
    clearLimit: number = 0.7;

    Init() {
        this.numbers = [];
        this.trueMoneyNumber = [];
        for (let i = 0; i < this.moneyNumber.length; i++) {
            let element = this.moneyNumber[i];
            this.trueMoneyNumber.push(CPMS_GameUI.Instance.isVideo ? element * 100 : element);
        }
        for (let i = 0; i < this.num; i++) {
            let num: number = randomRangeInt(0, i < 5 ? 200 : 203);
            this.numbers.push(num);
        }
        for (let i = 0; i < 5; i++) {
            let element = this.numbers[i];
            for (let j = 0; j < i; j++) {
                let element2 = this.numbers[0][j];
                while (element == element2) {
                    element = randomRangeInt(0, 200);
                }
            }
        }
        for (let i = 0; i < this.randomNumbers.children.length; i++) {
            const element = this.randomNumbers.children[i];
            let num = this.numbers[i];
            let str: string = num > 199 ? this.words[num - 200] : (num < 20 ? ("0" + Math.floor(num / 2)) : Math.floor(num / 2).toString());
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
        var winArray4: number[] = [];
        for (let i = 5; i < this.numbers.length; i++) {
            const element = this.numbers[i];
            if (element > 199) {
                let num = element - 200;
                switch (num) {
                    case 0:
                        winArray3.push(i - 5);
                        break;
                    case 1:
                        winArray2.push(i - 5);
                        break;
                    case 2:
                        winArray.push(i - 5);
                        break;
                }
                continue;
            }
            for (let j = 0; j < 5; j++) {
                const element2 = this.numbers[j];
                if (Math.floor(element / 2) == Math.floor(element2 / 2)) {
                    winArray4.push(i - 5);
                    break;
                }
            }
        }
        for (let i = 0; i < winArray.length; i++) {
            for (let j = 0; j < this.trueMoneyNumber.length; j++) {
                const element = this.trueMoneyNumber[j];
                this.winMoney += element;
            }
            this.moneyNumbers.children[winArray[i]].children[0].active = true;
        }
        for (let i = 0; i < winArray2.length; i++) {
            const element = winArray2[i];
            this.winMoney += this.trueMoneyNumber[element] * 5;
            this.moneyNumbers.children[element].children[0].active = true;
        }
        for (let i = 0; i < winArray3.length; i++) {
            const element = winArray3[i];
            this.winMoney += this.trueMoneyNumber[element] * 2;
            this.moneyNumbers.children[element].children[0].active = true;
        }
        for (let i = 0; i < winArray4.length; i++) {
            const element = winArray4[i];
            this.winMoney += this.trueMoneyNumber[element];
            this.moneyNumbers.children[element].children[0].active = true;
        }
        CPMS_GameUI.Instance.CheckLotto(this.winMoney);
    }
}


