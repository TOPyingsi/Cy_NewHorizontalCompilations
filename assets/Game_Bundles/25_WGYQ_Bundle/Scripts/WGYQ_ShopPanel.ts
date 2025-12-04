import { _decorator, Component, Node, Label, Sprite, clamp, randomRangeInt, Event } from 'cc';
import { WGYQ_DogName, WGYQ_DogType, WGYQ_GameData } from './WGYQ_GameData';
import { WGYQ_HomeUI } from './WGYQ_HomeUI';
import { UIManager } from 'db://assets/Scripts/Framework/Managers/UIManager';
import { WGYQ_RewardPanel } from './WGYQ_RewardPanel';
const { ccclass, property } = _decorator;

@ccclass('WGYQ_ShopPanel')
export class WGYQ_ShopPanel extends Component {

    @property(Label)
    coinLabel: Label;

    @property(Node)
    shopPanel: Node;

    @property(WGYQ_RewardPanel)
    reward: WGYQ_RewardPanel;

    coins: number;
    shop: Node;

    protected onEnable(): void {
        this.Init();
    }

    start() {
    }

    Init() {
        this.coins = WGYQ_GameData.Instance.getNumberData("Coins");
        this.coinLabel.string = this.coins.toString();
        this.shop = this.shopPanel.children[0];
        this.ShopInit(0);
    }

    update(deltaTime: number) {

    }

    ChooseShop(event: Event) {
        let target: Node = event.target;
        let num = target.getSiblingIndex();
        for (let i = 0; i < this.shopPanel.children.length; i++) {
            const element = this.shopPanel.children[i];
            element.active = num == i;
        }
        this.shop = this.shopPanel.children[num];
        this.ShopInit(num);
    }

    ShopInit(num: number) {
        if (num < 3) {
            let data = WGYQ_GameData.Instance.getArrayData("Shop")[num];
            let weapon = WGYQ_GameData.Instance.getArrayData("Weapons")[num];
            for (let i = 0; i < this.shop.children.length; i++) {
                const element = this.shop.children[i];
                element.children[0].children[0].getComponent(Label).string = data[i] + "级";
                element.children[3].children[0].getComponent(Label).string = (data[i] == 0 ? (2 * i - 1) * 10000 : data[i] * 100).toString();
                element.children[3].children[2].getComponent(Label).string = data[i] == 0 ? "购买" : "升级";
                element.children[4].active = weapon == i;
            }
        }
    }

    Buy(event: Event) {
        let target: Node = event.target;
        let shopNum = target.parent.parent.getSiblingIndex();
        let num = target.parent.getSiblingIndex();
        if (shopNum < 3) {
            let data = WGYQ_GameData.Instance.getArrayData<number[]>("Shop");
            let cost = data[shopNum][num] == 0 ? (2 * num - 1) * 10000 : data[shopNum][num] * 100;
            if (this.coins < cost) return UIManager.ShowTip("金币不足");
            this.coins -= cost;
            WGYQ_GameData.Instance.setNumberData("Coins", this.coins);
            this.coinLabel.string = this.coins.toString();
            data[shopNum][num]++;
            WGYQ_GameData.Instance.setArrayData("Shop", data);
            this.ShopInit(shopNum);
        }
        else {
            let gouliang = WGYQ_GameData.Instance.getNumberData("ZJZG");
            let costs = [500, 800, 2000];
            let glNum = [20, 50, 100];
            if (this.coins < costs[num]) return UIManager.ShowTip("金币不足");
            this.coins -= costs[num];
            WGYQ_GameData.Instance.setNumberData("Coins", this.coins);
            this.coinLabel.string = this.coins.toString();
            gouliang += glNum[num];
            WGYQ_GameData.Instance.setNumberData("ZJZG", gouliang);
            this.reward.Show(4, glNum[num]);
        }
    }

    Choose(event: Event) {
        let target: Node = event.target;
        let shopNum = target.parent.getSiblingIndex();
        let num = target.getSiblingIndex();
        let data = WGYQ_GameData.Instance.getArrayData("Shop");
        if (data[shopNum][num] == 0) return UIManager.ShowTip("尚未拥有此物品！");
        let weapon = WGYQ_GameData.Instance.getArrayData("Weapons");
        weapon[shopNum] = num;
        WGYQ_GameData.Instance.setArrayData("Weapons", weapon);
        this.ShopInit(shopNum);
    }

    Back() {
        this.node.active = false;
        WGYQ_HomeUI.Instance.Init();
    }



}


