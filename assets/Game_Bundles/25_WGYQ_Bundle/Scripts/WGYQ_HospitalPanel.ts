import { _decorator, Component, Node, Label, Sprite, clamp } from 'cc';
import { WGYQ_GameData } from './WGYQ_GameData';
import { UIManager } from 'db://assets/Scripts/Framework/Managers/UIManager';
import { WGYQ_HomeUI } from './WGYQ_HomeUI';
const { ccclass, property } = _decorator;

@ccclass('WGYQ_HospitalPanel')
export class WGYQ_HospitalPanel extends Component {

    @property(Label)
    coinLabel: Label;

    @property(Sprite)
    hpBar: Sprite;

    coins: number;
    hp: number;

    protected onEnable(): void {
        this.coins = WGYQ_GameData.Instance.getNumberData("Coins");
        this.hp = WGYQ_GameData.Instance.getNumberData("Hp");
        this.Init();
    }

    start() {
    }

    Init() {
        this.coinLabel.string = this.coins.toString();
        this.hpBar.fillRange = this.hp / 100;
    }

    update(deltaTime: number) {

    }

    Serum() {
        if (this.coins >= 800) {
            this.coins -= 800;
            WGYQ_GameData.Instance.setNumberData("Coins", this.coins);
            this.hp = clamp(this.hp + 50, 0, 100);
            this.Init();
        }
        else UIManager.ShowTip("金币不足");
    }

    Vaccine() {
        if (this.coins >= 1000) {
            this.coins -= 1000;
            WGYQ_GameData.Instance.setNumberData("Coins", this.coins);
            this.Init();
        }
        else UIManager.ShowTip("金币不足");
    }

    Back() {
        this.node.active = false;
        WGYQ_HomeUI.Instance.Init();
    }

}


