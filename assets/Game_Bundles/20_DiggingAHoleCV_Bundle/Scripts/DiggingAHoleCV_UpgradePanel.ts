import { _decorator, clamp, Component, Event, EventTouch, Label, Node, Sprite, UITransform, v3, Vec2, Vec3 } from 'cc';
import { DiggingAHoleCV_Audio } from './DiggingAHoleCV_Audio';
import { DiggingAHoleCV_GameUI } from './DiggingAHoleCV_GameUI';
import { DiggingAHoleCV_PlayerController } from './DiggingAHoleCV_PlayerController';
import Banner from 'db://assets/Scripts/Banner';
import { UIManager } from 'db://assets/Scripts/Framework/Managers/UIManager';
const { ccclass, property } = _decorator;

@ccclass('DiggingAHoleCV_UpgradePanel')
export class DiggingAHoleCV_UpgradePanel extends Component {

    @property(Label)
    coinLabel: Label;

    @property(Node)
    layout: Node;

    @property(Node)
    video: Node;

    needCoins: number[];

    protected onEnable(): void {
        this.Init();
    }

    start() {
    }

    update(deltaTime: number) {

    }

    Init() {
        this.needCoins = [];
        let coins = localStorage.getItem("DAHCV_Coins");
        if (coins != "" && coins != null) this.coinLabel.string = coins;
        else this.coinLabel.string = "0";
        let upgrades: number[] = [parseInt(localStorage.getItem("DAHCV_Dig")), parseInt(localStorage.getItem("DAHCV_Fill")), parseInt(localStorage.getItem("DAHCV_Elc")), parseInt(localStorage.getItem("DAHCV_Fly"))];
        for (let i = 0; i < this.layout.children.length; i++) {
            const element = this.layout.children[i];
            element.children[2].getComponent(Sprite).fillRange = upgrades[i] / 10;
            element.children[4].children[1].getComponent(Label).string = (100 * (upgrades[i] + 1)).toString();
            this.needCoins.push(100 * (upgrades[i] + 1));
            element.children[4].active = upgrades[i] != 10;
        }
        let videoStr = localStorage.getItem("DAHCV_Video");
        this.video.children[0].active = videoStr == "0";
        this.video.children[1].getComponent(Label).string = "免费X" + videoStr;
    }

    Upgrade(event: Event) {
        let node = event.target as Node;
        let num = node.parent.getSiblingIndex();
        let need = this.needCoins[num];
        let coin = parseInt(localStorage.getItem("DAHCV_Coins"));
        let dataName = ["Dig", "Fill", "Elc", "Fly"];
        if (coin >= need) {
            coin -= need;
            localStorage.setItem("DAHCV_Coins", coin.toString());
            let data = parseInt(localStorage.getItem("DAHCV_" + dataName[num]));
            data++;
            localStorage.setItem("DAHCV_" + dataName[num], data.toString());
            this.Init();
            DiggingAHoleCV_Audio.Instance.PlayAudio("sell");
            if (num == 2) this.Charge();
        }
        else UIManager.ShowTip("金币不足");
    }

    Back() {
        this.node.active = false;
    }

    Charge() {
        let coin = parseInt(localStorage.getItem("DAHCV_Coins"));
        if (coin >= 1) {
            coin -= 1;
            localStorage.setItem("DAHCV_Coins", coin.toString());
            DiggingAHoleCV_PlayerController.Instance.elc = 10 * (1 + parseInt(localStorage.getItem("DAHCV_Elc")));
            DiggingAHoleCV_GameUI.Instance.ShowElc();
            DiggingAHoleCV_Audio.Instance.PlayAudio("sell");
            this.Init();
        }
        else UIManager.ShowTip("金币不足");
    }

    ChargeVideo() {
        let videoNum = parseInt(localStorage.getItem("DAHCV_Video"));
        if (videoNum > 0) {
            videoNum--;
            DiggingAHoleCV_PlayerController.Instance.elc = 10 * (1 + parseInt(localStorage.getItem("DAHCV_Elc")));
            DiggingAHoleCV_GameUI.Instance.ShowElc();
            DiggingAHoleCV_Audio.Instance.PlayAudio("sell");
            localStorage.setItem("DAHCV_Video", videoNum.toString());
            this.Init();
        }
        else {
            let x = this;
            Banner.Instance.ShowVideoAd(() => {
                videoNum = 2;
                DiggingAHoleCV_PlayerController.Instance.elc = 10 * (1 + parseInt(localStorage.getItem("DAHCV_Elc")));
                DiggingAHoleCV_GameUI.Instance.ShowElc();
                DiggingAHoleCV_Audio.Instance.PlayAudio("sell");
                localStorage.setItem("DAHCV_Video", videoNum.toString());
                x.Init();
            })
        }
    }
}


