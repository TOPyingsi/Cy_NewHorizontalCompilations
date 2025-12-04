import { _decorator, Component, Label, Node, randomRangeInt } from 'cc';
import { CPMS_Lotto } from './CPMS_Lotto';
import { CPMS_GameUI } from './CPMS_GameUI';
const { ccclass, property } = _decorator;

@ccclass('CPMS_LottoDaJinLong')
export class CPMS_LottoDaJinLong extends CPMS_Lotto {

    @property(Node)
    specialLabels: Node;

    @property
    num: number = 0;

    specialNums: number[] = [];
    specialMoney: number[] = [100, 15, 600, 80];
    moneyNumber: number[] = [400, 60, 50, 1000, 10, 70, 60, 900, 10, 900, 75, 500, 40, 100, 10, 50, 500, 10, 150, 10, 80, 250, 95, 700, 10, 300, 10, 900, 65, 300, 60, 400, 60, 100, 90];
    winMoney: number = 0;
    clearLimit: number = 0.85;

    Init() {
        this.specialNums = [];
        this.numbers = [];
        this.trueMoneyNumber = [];
        for (let i = 0; i < this.moneyNumber.length; i++) {
            let element = this.moneyNumber[i];
            this.trueMoneyNumber.push(CPMS_GameUI.Instance.isVideo ? element * 100 : element);
        }
        for (let i = 0; i < 4; i++) {
            let element = randomRangeInt(0, 200);
            this.specialNums.push(element);
            let str = element == 0 ? (this.specialMoney[i]).toString() : "谢谢参与";
            this.specialLabels.children[i].getComponent(Label).string = str;
            this.specialLabels.children[i].children[0].active = false;
        }
        for (let i = 0; i < this.num; i++) {
            let num: number = randomRangeInt(0, 100);
            this.numbers.push(num);
        }
        while (this.numbers[0] == this.numbers[1]) {
            this.numbers[0] = randomRangeInt(0, 100);
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
        for (let i = 0; i < this.specialNums.length; i++) {
            const element = this.specialNums[i];
            if (element == 0) {
                this.winMoney += this.specialMoney[i];
                this.specialLabels.children[i].children[0].active = true;
            }
        }
        for (let i = 2; i < this.numbers.length; i++) {
            const element = this.numbers[i];
            if (element == this.numbers[0]) winArray.push(i - 2);
            else if (element == this.numbers[1]) winArray2.push(i - 2);
        }
        for (let i = 0; i < winArray.length; i++) {
            const element = winArray[i];
            this.winMoney += this.trueMoneyNumber[element];
            this.moneyNumbers.children[element].children[0].active = true;
        }
        for (let i = 0; i < winArray2.length; i++) {
            const element = winArray2[i];
            this.winMoney += this.trueMoneyNumber[element] * 2;
            this.moneyNumbers.children[element].children[0].active = true;
        }
        CPMS_GameUI.Instance.CheckLotto(this.winMoney);
    }
}


