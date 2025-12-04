import { _decorator, Component, Node, Label, Color } from 'cc';
import GameData2 from './SWMCQ_GameData';
import { Panel, UIManager } from 'db://assets/Scripts/Framework/Managers/UIManager';
import SWMCQ_Audio from './SWMCQ_Audio';
import Banner from 'db://assets/Scripts/Banner';
import { ProjectEventManager, ProjectEvent } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
const { ccclass, property } = _decorator;

@ccclass('UpgradeScene')
export default class UpgradeScene extends Component {

    private static instance: UpgradeScene;

    public static get Instance(): UpgradeScene {
        return this.instance;
    }


    @property(Node)
    mainPanel: Node;
    @property(Label)
    coinLabel: Label;
    @property(Label)
    needLabel: Label;
    @property(Label)
    mainLabel: Label;
    choose: string;
    // LIFE-CYCLE CALLBACKS:
    onLoad() { UpgradeScene.instance = this; }
    start() {
        this.coinLabel.string = GameData2.Instance.Datas[0].toString();
        ProjectEventManager.emit(ProjectEvent.弹出窗口, "沙威玛传奇");
    }
    // update (dt) {}
    CheckUpgrade(event, upgrade: string) {
        this.choose = upgrade;
        var datas = GameData2.Instance.Upgrades.get(this.choose);
        if (datas[1]) this.ShowUpgraded();
        else this.ShowText(datas);
    }
    private ShowText(datas: Array<number | boolean | string>) {
        this.mainPanel.active = true;
        this.mainPanel.children[1].active = true;
        this.mainPanel.children[2].active = true;
        this.mainLabel.string = datas[2].toString();
        this.needLabel.string = datas[0].toString();
        if (GameData2.Instance.Datas[0] > parseInt(this.needLabel.string)) this.needLabel.color = Color.WHITE;
        else this.needLabel.color = Color.RED;
    }
    private ShowUpgraded() {
        this.mainPanel.active = true;
        this.mainPanel.children[1].active = false;
        this.mainPanel.children[2].active = false;
        this.needLabel.string = "";
        this.mainLabel.string = "已升级";
    }
    UpgradeCoin() {
        var datas = GameData2.Instance.Datas;
        if (datas[0] > parseInt(this.needLabel.string)) {
            datas[0] -= parseInt(this.needLabel.string);
            GameData2.Instance.Datas = datas;
            this.Upgrade();
        }
    }
    Back() {
        SWMCQ_Audio.Instance.ButtonAudio();
        UIManager.ShowPanel(Panel.LoadingPanel, "SWM_MainScene");
    }

    UpgradeVideo() {
        Banner.Instance.ShowVideoAd(() => {
            this.Upgrade();
        });
    }

    Upgrade() {
        var datas = GameData2.Instance.Datas;
        var upgrades = GameData2.Instance.Upgrades;
        datas[2]++;
        switch (UpgradeScene.Instance.choose) {
            case "sandwich":
                datas[4] += 3;
                break;
            case "cake":
                datas[4] += 5;
                break;
            case "price":
                datas[4] += 5;
                break;
            case "wall":
                datas[4] += 2;
                break;
        }
        upgrades.get(UpgradeScene.Instance.choose)[1] = true;
        GameData2.Instance.Datas = datas;
        GameData2.Instance.Upgrades = upgrades;
        UpgradeScene.Instance.ShowUpgraded();
    }
}
