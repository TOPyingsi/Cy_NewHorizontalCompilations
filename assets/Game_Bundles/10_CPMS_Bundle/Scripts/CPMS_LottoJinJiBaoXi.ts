import { _decorator, Component, Label, Node, randomRangeInt } from 'cc';
import { CPMS_Lotto } from './CPMS_Lotto';
import { CPMS_GameUI } from './CPMS_GameUI';
const { ccclass, property } = _decorator;

@ccclass('CPMS_LottoJinJiBaoXi')
export class CPMS_LottoJinJiBaoXi extends CPMS_Lotto {

    @property(Node)
    randomNumbers2: Node;

    @property(Node)
    moneyNumbers2: Node;

    @property
    num: number = 0;

    @property
    num2: number = 0;

    numbers2: number[] = [];
    words: string[] = ["🥚", "🥛", "🌭", "🧀", "🍡", "🌮", "🍟", "🍦", "🍗", "🍤"];
    moneyNumber: number[] = [40, 600, 40, 80, 800, 40, 70, 700, 60, 100, 70, 500, 75, 200, 10, 900, 15, 700];
    moneyNumber2: number[] = [800, 45, 90, 500, 60, 900, 80, 850, 50, 1000, 30, 70, 400, 70, 40, 850, 10, 85];
    trueMoneyNumber2: number[];
    winMoney: number = 0;
    clearLimit: number = 0.8;

    Init() {
        this.numbers = [];
        this.numbers2 = [];
        this.trueMoneyNumber = [];
        this.trueMoneyNumber2 = [];
        for (let i = 0; i < this.moneyNumber.length; i++) {
            let element = this.moneyNumber[i];
            this.trueMoneyNumber.push(CPMS_GameUI.Instance.isVideo ? element * 100 : element);
        }
        for (let i = 0; i < this.moneyNumber2.length; i++) {
            let element = this.moneyNumber2[i];
            this.trueMoneyNumber2.push(CPMS_GameUI.Instance.isVideo ? element * 100 : element);
        }
        for (let i = 0; i < this.num; i++) {
            let num: number = randomRangeInt(0, 200);
            this.numbers.push(num);
        }
        for (let i = 0; i < this.randomNumbers.children.length; i++) {
            const element = this.randomNumbers.children[i];
            let num = this.numbers[i];
            num = num == 0 ? num : randomRangeInt(1, this.words.length);
            element.getComponent(Label).string = this.words[num];
        }
        for (let i = 0; i < this.moneyNumbers.children.length; i++) {
            const element = this.moneyNumbers.children[i];
            element.getComponent(Label).string = this.trueMoneyNumber[i] + "币";
            element.children[0].active = false;
        }
        for (let i = 0; i < this.num2; i++) {
            let num: number = randomRangeInt(0, 100);
            this.numbers2.push(num);
        }
        while (this.numbers2[0] == this.numbers2[1]) {
            this.numbers2[0] = randomRangeInt(0, 100);
        }
        for (let i = 0; i < this.randomNumbers2.children.length; i++) {
            console.log(i);
            const element = this.randomNumbers2.children[i];
            let num = this.numbers2[i];
            element.getComponent(Label).string = num.toString();
        }
        for (let i = 0; i < this.moneyNumbers2.children.length; i++) {
            const element = this.moneyNumbers2.children[i];
            element.getComponent(Label).string = this.trueMoneyNumber2[i] + "币";
            element.children[0].active = false;
        }
        this.takeOnTouch();
    }

    Check() {
        this.winMoney = 0;
        var winArray: number[] = [];
        var winArray2: number[] = [];
        for (let i = 0; i < this.numbers.length; i++) {
            const element = this.numbers[i];
            if (element == 0) winArray.push(i);
        }
        for (let i = 2; i < this.numbers2.length; i++) {
            const element = this.numbers2[i];
            for (let j = 0; j < 2; j++) {
                const element2 = this.numbers2[j];
                if (element == element2) winArray2.push(i - 2);
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
        CPMS_GameUI.Instance.CheckLotto(this.winMoney);
    }
}


