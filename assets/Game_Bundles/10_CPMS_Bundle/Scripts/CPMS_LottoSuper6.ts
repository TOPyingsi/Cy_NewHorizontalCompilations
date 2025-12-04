import { _decorator, Component, Label, Node, randomRangeInt, v3 } from 'cc';
import { CPMS_Lotto } from './CPMS_Lotto';
import { CPMS_GameUI } from './CPMS_GameUI';
const { ccclass, property } = _decorator;

@ccclass('CPMS_LottoSuper6')
export class CPMS_LottoSuper6 extends CPMS_Lotto {

    @property(Node)
    randomNumbers2: Node;

    @property(Node)
    moneyNumbers2: Node;

    @property(Node)
    randomNumbers3: Node;

    @property(Node)
    moneyNumbers3: Node;

    @property
    num2: number = 0;

    @property
    num3: number = 0;

    numbers2: number[] = [];
    numbers3: number[] = [];
    moneyNumber: number[] = [250, 70, 400];
    moneyNumber2: number[] = [850, 10, 300, 60, 700, 90, 80, 200, 20, 700, 80, 70];
    moneyNumber3: number[] = [600, 50, 650, 70, 800, 45, 80, 85, 900, 70, 800, 30, 550, 40, 700, 50, 1000, 20, 950, 80, 400, 50, 90, 250, 30];
    trueMoneyNumber2: number[];
    trueMoneyNumber3: number[];
    winMoney: number = 0;
    clearLimit: number = 0.7;

    protected onEnable(): void {
        super.onEnable();
        this.node.setPosition(v3(0, 100));
    }

    Init() {
        this.numbers = [];
        this.numbers2 = [];
        this.numbers3 = [];
        this.trueMoneyNumber = [];
        this.trueMoneyNumber2 = [];
        this.trueMoneyNumber3 = [];
        for (let i = 0; i < this.moneyNumber.length; i++) {
            let element = this.moneyNumber[i];
            this.trueMoneyNumber.push(CPMS_GameUI.Instance.isVideo ? element * 100 : element);
        }
        for (let i = 0; i < this.moneyNumber2.length; i++) {
            let element = this.moneyNumber2[i];
            this.trueMoneyNumber2.push(CPMS_GameUI.Instance.isVideo ? element * 100 : element);
        }
        for (let i = 0; i < this.moneyNumber3.length; i++) {
            let element = this.moneyNumber3[i];
            this.trueMoneyNumber3.push(CPMS_GameUI.Instance.isVideo ? element * 100 : element);
        }
        for (let i = 0; i < this.numX; i++) {
            let num: number[] = [];
            this.numbers.push(num);
            for (let j = 0; j < this.numY; j++) {
                let num2 = randomRangeInt(0, 10);
                num.push(num2);
            }
        }
        for (let i = 0; i < this.randomNumbers.children.length; i++) {
            const element = this.randomNumbers.children[i];
            let x = Math.floor(i / this.numY);
            let y = i % this.numY;
            let num = this.numbers[x][y];
            element.getComponent(Label).string = num;
        }
        for (let i = 0; i < this.moneyNumbers.children.length; i++) {
            const element = this.moneyNumbers.children[i];
            element.getComponent(Label).string = this.trueMoneyNumber[i] + "币";
            element.children[0].active = false;
        }
        for (let i = 0; i < this.num2; i++) {
            let num: number = randomRangeInt(0, 200);
            this.numbers2.push(num);
        }
        for (let i = 0; i < this.randomNumbers2.children.length; i++) {
            const element = this.randomNumbers2.children[i];
            let num = this.numbers2[i];
            while (num >= 10 || num == 6) {
                num = randomRangeInt(0, 9);
            }
            element.getComponent(Label).string = num.toString();
        }
        for (let i = 0; i < this.moneyNumbers2.children.length; i++) {
            const element = this.moneyNumbers2.children[i];
            element.getComponent(Label).string = this.trueMoneyNumber2[i] + "币";
            element.children[0].active = false;
        }
        for (let i = 0; i < this.num3; i++) {
            let num: number = randomRangeInt(0, 100);
            this.numbers3.push(num);
        }
        while (this.numbers3[0] == this.numbers3[1]) {
            this.numbers3[0] = randomRangeInt(0, 100);
        }
        for (let i = 0; i < this.randomNumbers3.children.length; i++) {
            const element = this.randomNumbers3.children[i];
            let num = this.numbers3[i];
            element.getComponent(Label).string = num == 101 ? (666).toString() : (num < 10 ? ("0" + num) : num.toString());
        }
        for (let i = 0; i < this.moneyNumbers3.children.length; i++) {
            const element = this.moneyNumbers3.children[i];
            element.getComponent(Label).string = this.trueMoneyNumber3[i] + "币";
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
        for (let i = 0; i < this.numbers.length; i++) {
            const element = this.numbers[i];
            if (element[0] + element[1] == 6) winArray.push(i);
        }
        for (let i = 0; i < this.numbers2.length; i++) {
            const element = this.numbers2[i];
            if (element == 6) winArray2.push(i);
        }
        for (let i = 2; i < this.numbers3.length; i++) {
            const element = this.numbers3[i];
            if (element == this.numbers3[0] || element == this.numbers3[1]) {
                if (element == 101) winArray4.push(i - 2);
                else winArray3.push(i - 2);
            }
        }
        for (let i = 0; i < winArray.length; i++) {
            const element = winArray[i];
            this.winMoney += this.trueMoneyNumber[element];
            this.moneyNumbers.children[element].children[0].active = true;
        }
        for (let i = 0; i < winArray2.length; i++) {
            const element = winArray2[i];
            this.winMoney += this.trueMoneyNumber2[element];
            this.moneyNumbers2.children[element].children[0].active = true;
        }
        for (let i = 0; i < winArray3.length; i++) {
            const element = winArray3[i];
            this.winMoney += this.trueMoneyNumber3[element];
            this.moneyNumbers3.children[element].children[0].active = true;
        }
        for (let i = 0; i < winArray4.length; i++) {
            const element = winArray4[i];
            this.winMoney += this.trueMoneyNumber3[element] * 6;
            this.moneyNumbers3.children[element].children[0].active = true;
        }
        CPMS_GameUI.Instance.CheckLotto(this.winMoney);
    }
}


