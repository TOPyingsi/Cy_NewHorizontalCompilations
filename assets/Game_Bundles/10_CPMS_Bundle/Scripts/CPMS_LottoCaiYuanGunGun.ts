import { _decorator, Component, Label, Node, randomRangeInt, Vec3 } from 'cc';
import { CPMS_Lotto } from './CPMS_Lotto';
import { CPMS_GameUI } from './CPMS_GameUI';
const { ccclass, property } = _decorator;

@ccclass('CPMS_LottoCaiYuanGunGun')
export class CPMS_LottoCaiYuanGunGun extends CPMS_Lotto {

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
    words: string[] = ["🍎", "🍅", "🍆", "🍇", "🍈", "🍉", "🍊", "🍋", "🍌", "🍍", "🍐", "🍑", "🍒", "🍓"];
    moneyNumber: number[] = [300, 60, 550, 65, 100];
    moneyNumber2: number[] = [950, 50, 300, 50, 800, 80, 900, 15, 300, 45, 100, 80, 600, 60, 300];
    moneyNumber3: number[] = [250, 10, 100, 20, 400, 20, 350, 90, 500, 40];
    trueMoneyNumber2: number[];
    trueMoneyNumber3: number[];
    winMoney: number = 0;

    protected onEnable(): void {
        super.onEnable();
        var v: Vec3 = new Vec3;
        this.node.setScale(Vec3.multiplyScalar(v, Vec3.ONE, 1.5));
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
                let num2 = randomRangeInt(0, 100);
                num.push(num2);
            }
        }
        for (let i = 0; i < this.randomNumbers.children.length; i++) {
            const element = this.randomNumbers.children[i];
            let x = Math.floor(i / this.numY);
            let y = i % this.numY;
            let num = this.numbers[x][y];
            element.getComponent(Label).string = num < 10 ? ("0" + num) : num;
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
        for (let i = 0; i < 3; i++) {
            let element = this.numbers2[i];
            for (let j = 0; j < i; j++) {
                let element2 = this.numbers2[j];
                while (element == element2) {
                    element = randomRangeInt(0, 100);
                }
            }
        }
        for (let i = 0; i < this.randomNumbers2.children.length; i++) {
            const element = this.randomNumbers2.children[i];
            let num = this.numbers2[i];
            element.getComponent(Label).string = num < 10 ? ("0" + num) : num.toString();
        }
        for (let i = 0; i < this.moneyNumbers2.children.length; i++) {
            const element = this.moneyNumbers2.children[i];
            element.getComponent(Label).string = this.trueMoneyNumber2[i] + "币";
            element.children[0].active = false;
        }
        for (let i = 0; i < this.num3; i++) {
            let num: number = randomRangeInt(0, 200);
            this.numbers3.push(num);
        }
        console.log(this.numbers3);
        for (let i = 0; i < this.randomNumbers3.children.length; i++) {
            const element = this.randomNumbers3.children[i];
            let num = this.numbers3[i];
            num = num == 0 ? num : randomRangeInt(1, this.words.length);
            element.getComponent(Label).string = this.words[num];
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
        for (let i = 0; i < this.numbers.length; i++) {
            const element = this.numbers[i];
            if (element[0] == element[1]) winArray.push(i);
        }
        for (let i = 3; i < this.numbers2.length; i++) {
            const element = this.numbers2[i];
            for (let j = 0; j < 3; j++) {
                const element2 = this.numbers2[j];
                if (element == element2) {
                    winArray2.push(i - 3);
                    break;
                }
            }
        }
        for (let i = 0; i < this.numbers3.length; i++) {
            const element = this.numbers3[i];
            if (element == 0) winArray3.push(i);
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
        CPMS_GameUI.Instance.CheckLotto(this.winMoney);
    }
}


