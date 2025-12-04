import { _decorator, Component, EventTouch, Label, Node, randomRangeInt, Sprite, SpriteFrame, UITransform, v3, Vec3 } from 'cc';
import { WGYQ_BattlePanel } from './WGYQ_BattlePanel';
import { WGYQ_DogName, WGYQ_DogType, WGYQ_GameData } from './WGYQ_GameData';
import { ProjectEventManager, ProjectEvent } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
const { ccclass, property } = _decorator;

@ccclass('WGYQ_RewardPanel')
export class WGYQ_RewardPanel extends Component {

    @property(Label)
    nameLabel: Label;

    @property(Label)
    numLabel: Label;

    @property(Node)
    rewards: Node;

    @property([SpriteFrame])
    dogsfs: SpriteFrame[] = [];

    isWin = false;

    protected onLoad(): void {
        if (this.node.scene.name == "WGYQ_Battle") this.Init();
        ProjectEventManager.emit(ProjectEvent.弹出窗口, "玩狗园区");
    }

    start() {

    }

    update(deltaTime: number) {

    }

    Init() {
        // let num = randomRangeInt(0, 4);
        let num = 0
        if (!this.isWin) num = 0;
        // let dhj = WGYQ_GameData.Instance.getArrayData
        switch (num) {
            case 0:
                this.nameLabel.string = "金币";
                let up = WGYQ_BattlePanel.Instance.level * (this.isWin ? 100 : 50);
                this.numLabel.string = "x" + up;
                let data = WGYQ_GameData.Instance.getNumberData("Coins");
                data += up;
                WGYQ_GameData.Instance.setNumberData("Coins", data);
                break;
            case 1:
                this.nameLabel.string = "小电驴兑换卷";
                this.numLabel.string = "x" + WGYQ_BattlePanel.Instance.level;
                break;
            case 2:
                this.nameLabel.string = "小跑车兑换卷";
                this.numLabel.string = "x" + WGYQ_BattlePanel.Instance.level;
                break;
            case 3:
                this.nameLabel.string = "越野车兑换卷";
                this.numLabel.string = "x" + WGYQ_BattlePanel.Instance.level;
                break;

            default:
                break;
        }
        this.rewards.children[num].active = true;
        this.node.active = true;
    }

    Show(type: number, num: number) {
        switch (type) {
            case 0:
                this.nameLabel.string = "金币";
                let up = num;
                this.numLabel.string = "x" + up;
                let data = WGYQ_GameData.Instance.getNumberData("Coins");
                data += up;
                WGYQ_GameData.Instance.setNumberData("Coins", data);
                break;
            case 1:
                this.nameLabel.string = "小电驴兑换卷";
                this.numLabel.string = "x" + num;
                break;
            case 2:
                this.nameLabel.string = "小跑车兑换卷";
                this.numLabel.string = "x" + num;
                break;
            case 3:
                this.nameLabel.string = "越野车兑换卷";
                this.numLabel.string = "x" + num;
                break;
            case 4:
                this.nameLabel.string = "增肌壮骨";
                this.numLabel.string = "x" + num;
                break;
            case 5:
                this.rewards.children[type].getComponent(Sprite).spriteFrame = this.dogsfs[num];
                this.nameLabel.string = WGYQ_DogType[num];
                this.numLabel.string = "";
                break;
        }
        this.rewards.children[type].active = true;
        this.node.active = true;
    }

    Close() {
        for (let i = 0; i < this.rewards.children.length; i++) {
            const element = this.rewards.children[i];
            element.active = false;
        }
        this.node.active = false;
    }

}


