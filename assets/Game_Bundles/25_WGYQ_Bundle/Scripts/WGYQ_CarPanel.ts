import { _decorator, Component, Node, Label, Sprite, clamp, Event, SpriteFrame } from 'cc';
import { WGYQ_GameData } from './WGYQ_GameData';
import { UIManager } from 'db://assets/Scripts/Framework/Managers/UIManager';
import { WGYQ_Player } from './WGYQ_Player';
import { WGYQ_HomeUI } from './WGYQ_HomeUI';
const { ccclass, property } = _decorator;

@ccclass('WGYQ_CarPanel')
export class WGYQ_CarPanel extends Component {

    @property(Node)
    panel: Node;

    @property(Node)
    vouchers: Node;

    @property(Node)
    readyPanel: Node;

    @property(Sprite)
    player: Sprite;

    @property(Label)
    coinLabel: Label;

    @property([SpriteFrame])
    playerSfs: SpriteFrame[] = [];

    coins: number;
    currentCar: number;
    buyNum: number;
    carData: number[] = [];
    voucherData: number[] = [];
    carPrice = [
        [20000, [15, 2000]],
        [250000, [30, 100000]],
        [400000, [40, 180000]]
    ]

    carUpgrade = [
        [5, 10],
        [10, 20],
        [20, 40]
    ]

    protected onEnable(): void {
        this.coins = WGYQ_GameData.Instance.getNumberData("Coins");
        this.currentCar = WGYQ_GameData.Instance.getNumberData("CurrentCar");
        this.carData = WGYQ_GameData.Instance.getArrayData<number>("Car");
        this.voucherData = WGYQ_GameData.Instance.getArrayData("Voucher");
        this.Init();
    }

    start() {
    }

    Init() {
        this.coinLabel.string = this.coins.toString();
        for (let i = 0; i < this.panel.children.length; i++) {
            const element = this.panel.children[i];
            let level = this.carData[i];
            element.children[2].active = level == 0;
            // element.children[3].active = level != 0;
            // element.children[3].children[1].getComponent(Label).string = "X" + 15 * level;
            element.children[4].children[0].getComponent(Label).string = "等级" + (level == 0 ? 1 : level);
            element.children[5].active = this.carData[i] == 0;
            element.children[6].children[0].getComponent(Label).string = this.currentCar == i ? "卸下" : "装备";
        }
        for (let i = 0; i < this.vouchers.children.length; i++) {
            const element = this.vouchers.children[i];
            element.children[0].getComponent(Label).string = this.voucherData[i].toString();
        }
        this.player.spriteFrame = this.playerSfs[this.currentCar + 1];
        WGYQ_GameData.Instance.setNumberData("CurrentCar", this.currentCar);
    }

    update(deltaTime: number) {

    }

    ReadyBuy(event: Event) {
        let target: Node = event.target;
        this.buyNum = target.parent.getSiblingIndex();
        this.readyPanel.active = true;
    }

    Buy(event: Event) {
        let target: Node = event.target;
        let num = target.getSiblingIndex();
        if (num == 0) {
            let cost = this.carPrice[this.buyNum][num] as number;
            if (this.coins >= cost) {
                this.coins -= cost;
                WGYQ_GameData.Instance.setNumberData("Coins", this.coins);
                this.carData[this.buyNum] = 1;
                WGYQ_GameData.Instance.setArrayData("Car", this.carData);
            }
            else UIManager.ShowTip("金币不足");
        }
        else {
            let costs = this.carPrice[this.buyNum][num] as number[];
            if (this.coins >= costs[1] && this.voucherData[this.buyNum] >= costs[0]) {
                this.coins -= costs[1];
                WGYQ_GameData.Instance.setNumberData("Coins", this.coins);
                this.voucherData[this.buyNum] -= costs[0];
                WGYQ_GameData.Instance.setArrayData("Voucher", this.voucherData);
                this.carData[this.buyNum] = 1;
                WGYQ_GameData.Instance.setArrayData("Car", this.carData);
            }
            else UIManager.ShowTip("资源不足");
        }
        this.Init();
        this.Cancel();
    }

    Cancel() {
        this.readyPanel.active = false;
    }

    Equip(event: Event) {
        let target: Node = event.target;
        let num = target.parent.getSiblingIndex();
        if (this.carData[num] == 0) return UIManager.ShowTip("尚未拥有此物品！");
        if (this.currentCar != num) this.currentCar = num;
        else this.currentCar = -1;
        this.Init();
        WGYQ_Player.Instance.InitCar();
    }

    Back() {
        this.node.active = false;
        WGYQ_HomeUI.Instance.Init();
    }

}


