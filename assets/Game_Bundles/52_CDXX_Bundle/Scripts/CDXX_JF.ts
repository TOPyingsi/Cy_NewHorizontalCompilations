import { _decorator, Component, EventTouch, Label, Node } from 'cc';
import { CDXX_GameData } from './CDXX_GameData';
import { CDXX_UIController } from './CDXX_UIController';
import Banner from 'db://assets/Scripts/Banner';
const { ccclass, property } = _decorator;

@ccclass('CDXX_JF')
export class CDXX_JF extends Component {
    public static _instance: CDXX_JF = null;

    public static get Instance() {
        if (!CDXX_JF._instance) {
            CDXX_JF._instance = new CDXX_JF();
        }
        return CDXX_JF._instance;
    }

    @property(Label)
    CurLabel: Label = null;

    protected onLoad(): void {
        CDXX_JF._instance = this;
        // this.node.active = false;
    }

    protected start(): void {
        this.showCurJF();
    }

    showCurJF() {
        if (this.CurLabel) this.CurLabel.string = CDXX_GameData.Instance.userData.当日积分.toString();
    }

    addJF(number: number) {
        if (CDXX_GameData.Instance.userData.当日积分 + number >= 10000) {
            CDXX_GameData.Instance.userData.当日积分 = 10000;
        } else {
            CDXX_GameData.Instance.userData.当日积分 += number;
        }
        this.showCurJF();
    }

    ButtonClick(event: EventTouch) {
        const target = event.currentTarget;
        switch (target.name) {
            case "签到":
                if (CDXX_GameData.Instance.IsSignIn) {
                    CDXX_UIController.Instance.TipsPanel.show("已经签到过了！")
                    break;
                }
                CDXX_GameData.Instance.IsSignIn = true;
                this.addJF(300);
                CDXX_UIController.Instance.TipsPanel.show("签到成功！")
                break;
            case "广告":
                Banner.Instance.ShowVideoAd(() => {
                    CDXX_UIController.Instance.TipsPanel.show("奖励已发放！")
                    this.addJF(500);
                });
                break;
            case "1000":
                this.Trade(1000, 100000);
                break;
            case "8000":
                this.Trade(8000, 1000000);
                break;
        }

    }

    Trade(jf: number, jb: number) {
        if (CDXX_GameData.Instance.userData.当日积分 < jf) {
            CDXX_UIController.Instance.TipsPanel.show("积分不足！")
            return;
        }

        CDXX_GameData.Instance.userData.当日积分 -= jf;
        CDXX_GameData.Instance.userData.奖杯 += jb;
        this.showCurJF();
        CDXX_UIController.Instance.showCup();
        CDXX_UIController.Instance.TipsPanel.show("兑换成功！")
    }

}


