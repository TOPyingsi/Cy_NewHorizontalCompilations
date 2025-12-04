import { _decorator, Component, Node } from 'cc';
import { CPMS_Lotto } from './CPMS_Lotto';
import { CPMS_GameUI } from './CPMS_GameUI';
const { ccclass, property } = _decorator;

@ccclass('CPMS_Lotto888')
export class CPMS_Lotto888 extends CPMS_Lotto {

    moneyNumber: number[] = [30, 5, 250, 20, 800, 10, 900, 40];
    winMoney: number = 0;

    Check() {
        this.winMoney = 0;
        var winArray: number[] = [];
        var winArray2: number[] = [];
        for (let i = 0; i < this.numbers.length; i++) {
            const element = this.numbers[i];
            var array: number[] = [];
            for (let j = 0; j < element.length; j++) {
                const element2 = element[j];
                array.push(element2);
            }
            if (array[0] == array[1] && array[1] == array[2]) {
                if (array[0] == 8) winArray2.push(i);
                else winArray.push(i);
                console.log(array);
            }
        }
        for (let i = 0; i < winArray.length; i++) {
            const element = winArray[i];
            this.winMoney += this.trueMoneyNumber[element];
            this.moneyNumbers.children[element].children[0].active = true;
        }
        for (let i = 0; i < winArray2.length; i++) {
            const element = winArray2[i];
            this.winMoney += this.trueMoneyNumber[element] * 8;
            this.moneyNumbers.children[element].children[0].active = true;
        }
        CPMS_GameUI.Instance.CheckLotto(this.winMoney);
    }
}


