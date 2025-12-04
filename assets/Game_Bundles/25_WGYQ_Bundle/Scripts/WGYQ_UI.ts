import { _decorator, Component, EventTouch, Label, Node, Sprite, UITransform, v3, Vec3 } from 'cc';
import { WGYQ_GameData } from './WGYQ_GameData';
import { ProjectEvent, ProjectEventManager } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
import Banner from 'db://assets/Scripts/Banner';
import { UIManager } from 'db://assets/Scripts/Framework/Managers/UIManager';
const { ccclass, property } = _decorator;

@ccclass('WGYQ_UI')
export class WGYQ_UI extends Component {

    @property(Label)
    coinLabel: Label;

    @property(Label)
    levelLabel: Label;

    @property(Label)
    talkLabel: Label;

    @property(Sprite)
    levelBar: Sprite;

    @property(Sprite)
    hpBar: Sprite;

    @property(Node)
    talkPanel: Node;

    talkNum = 0;
    tutorialTexts: string[];

    protected onLoad(): void {
        this.Init();
    }

    start() {

    }

    update(deltaTime: number) {

    }

    Init() {
        this.coinLabel.string = WGYQ_GameData.Instance.getNumberData("Coins").toString();
        let level = WGYQ_GameData.Instance.getNumberData("Level");
        this.levelLabel.string = "等级 " + level.toString();
        this.levelBar.fillRange = WGYQ_GameData.Instance.getNumberData("Experience") / (level * 100);
        this.hpBar.fillRange = WGYQ_GameData.Instance.getNumberData("Hp") / 100;
    }

    Talk() {
        this.talkPanel.active = true;
        this.talkLabel.string = this.tutorialTexts[this.talkNum];
        this.talkNum++;
    }

    GetCoin() {
        let x = this;
        Banner.Instance.ShowVideoAd(() => {
            let coins = WGYQ_GameData.Instance.getNumberData("Coins");
            coins += 10000;
            WGYQ_GameData.Instance.setNumberData("Coins", coins);
            x.Init();
            UIManager.ShowTip("获得10000金币");
        })
    }

}


