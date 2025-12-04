import { _decorator, Component, Node, Label, Sprite, clamp, randomRangeInt, Event } from 'cc';
import { WGYQ_DogName, WGYQ_DogType, WGYQ_GameData } from './WGYQ_GameData';
import { WGYQ_HomeUI } from './WGYQ_HomeUI';
import { UIManager } from 'db://assets/Scripts/Framework/Managers/UIManager';
import { WGYQ_RewardPanel } from './WGYQ_RewardPanel';
const { ccclass, property } = _decorator;

@ccclass('WGYQ_GachaPanel')
export class WGYQ_GachaPanel extends Component {

    @property(Label)
    coinLabel: Label;

    @property(Node)
    gachaPanel: Node;

    @property(WGYQ_RewardPanel)
    reward: WGYQ_RewardPanel;

    coins: number;

    protected onEnable(): void {
        this.Init();
        this.GachaInit();
    }

    start() {
    }

    Init() {
        this.coins = WGYQ_GameData.Instance.getNumberData("Coins");
        this.coinLabel.string = this.coins.toString();
    }

    update(deltaTime: number) {

    }

    GachaInit() {
        let date = WGYQ_GameData.Instance.getArrayData<number[]>("Date");
        let time = new Date();
        let strs = ["首次免费", "抽金币", "抽小狗", "抽兑换卷"];
        for (let i = 0; i < this.gachaPanel.children.length; i++) {
            const element = this.gachaPanel.children[i];
            if (i > 0) {
                let label = element.children[element.children.length - 1].children[0].getComponent(Label);
                label.string = date[i].length == 0 || date[i][0] != time.getMonth() || date[i][1] != time.getDate() ? strs[i] : "已抽奖";
            }
            else {
                let label = element.children[6].getComponent(Label);
                label.string = date[i].length == 0 || date[i][0] != time.getMonth() || date[i][1] != time.getDate() ? strs[i] : "300/每次";
            }
        }
    }

    Gacha(event: Event) {
        let target: Node = event.target;
        let num = target.parent.getSiblingIndex();
        let date = WGYQ_GameData.Instance.getArrayData<number[]>("Date");
        let time = new Date();
        let day = [time.getMonth(), time.getDate()];
        if (num > 0 && date[num].length > 0 && date[num][0] == day[0] && date[num][1] == day[1]) return UIManager.ShowTip("今日已抽过奖");
        switch (num) {
            case 0:
                if (date[num].length > 0 && date[num][0] == day[0] && date[num][1] == day[1]) {
                    if (this.coins < 300) return UIManager.ShowTip("金币不足");
                    this.coins -= 300;
                }
                this.coinLabel.string = this.coins.toString();
                WGYQ_GameData.Instance.setNumberData("Coins", this.coins);
                let random = randomRangeInt(0, 100);
                if (random < 10) {
                    random = Math.min(8, random);
                    let dogNum = WGYQ_GameData.Instance.getNumberData("DogNumber");
                    dogNum++;
                    WGYQ_GameData.Instance.setNumberData("DogNumber", dogNum);
                    let dog = { dogNumber: dogNum, dogName: WGYQ_DogName[random], dogType: WGYQ_DogType[random], hp: 1000, coinTime: 30 };
                    let dogData = WGYQ_GameData.Instance.getArrayData("Dog");
                    dogData.push(dog);
                    WGYQ_GameData.Instance.setArrayData("Dog", dogData);
                    this.reward.Show(5, random);
                }
                else if (random < 30) {
                    let voucher = WGYQ_GameData.Instance.getArrayData<number>("Voucher");
                    let vouNum = randomRangeInt(0, 3);
                    let vouReward = randomRangeInt(1, 9);
                    voucher[vouNum] += vouReward;
                    this.reward.Show(vouNum + 1, vouReward);
                    WGYQ_GameData.Instance.setArrayData<number>("Voucher", voucher);
                }
                else if (random < 60) {
                    let zjzg = WGYQ_GameData.Instance.getNumberData("ZJZG");
                    let zjzgReward = randomRangeInt(10, 101);
                    zjzg += zjzgReward;
                    WGYQ_GameData.Instance.setNumberData("ZJZG", zjzg);
                    this.reward.Show(4, zjzgReward);
                }
                else {
                    let coinReward = randomRangeInt(100, 5001);
                    this.coins += coinReward;
                    this.coinLabel.string = this.coins.toString();
                    WGYQ_GameData.Instance.setNumberData("Coins", this.coins);
                    this.reward.Show(0, coinReward);
                }
                break;
            case 1:
                let coinReward = randomRangeInt(1, 501);
                this.coins += coinReward;
                this.coinLabel.string = this.coins.toString();
                WGYQ_GameData.Instance.setNumberData("Coins", this.coins);
                this.reward.Show(0, coinReward);
                break;
            case 2:
                let dogReward = randomRangeInt(0, 9);
                if (dogReward > 8) { UIManager.ShowTip("很遗憾，没中奖"); break; }
                let dogNum = WGYQ_GameData.Instance.getNumberData("DogNumber");
                dogNum++;
                WGYQ_GameData.Instance.setNumberData("DogNumber", dogNum);
                let dog = { dogNumber: dogNum, dogName: WGYQ_DogName[dogReward], dogType: WGYQ_DogType[dogReward], hp: 1000, coinTime: 30 };
                let dogData = WGYQ_GameData.Instance.getArrayData("Dog");
                dogData.push(dog);
                WGYQ_GameData.Instance.setArrayData("Dog", dogData);
                this.reward.Show(5, dogReward);
                break;
            case 3:
                let voucher = WGYQ_GameData.Instance.getArrayData<number>("Voucher");
                let vouNum = randomRangeInt(0, 3);
                let vouReward = randomRangeInt(0, 4);
                if (vouReward == 0) { UIManager.ShowTip("很遗憾，没中奖"); break; }
                voucher[vouNum] += vouReward;
                this.reward.Show(vouNum + 1, vouReward);
                WGYQ_GameData.Instance.setArrayData<number>("Voucher", voucher);
                break;
        }
        date[num] = day;
        WGYQ_GameData.Instance.setArrayData("Date", date);
        this.GachaInit();
    }

    Back() {
        this.node.active = false;
        WGYQ_HomeUI.Instance.Init();
    }



}


