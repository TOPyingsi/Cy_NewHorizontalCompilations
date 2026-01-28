import { _decorator, Component, EventTouch, Label, Node } from 'cc';
import { CDXX2_GameData } from './CDXX2_GameData';
import { CDXX2_UIController } from './CDXX2_UIController';
import Banner from 'db://assets/Scripts/Banner';
const { ccclass, property } = _decorator;

/*
“每日积分”单例模块：
负责显示、累加当日积分（上限 1w）；
提供签到、看广告、积分换奖杯三种入口；
所有操作即时刷新 UI 并弹提示。
*/

@ccclass('CDXX2_JF')
export class CDXX2_JF extends Component {
    public static _instance: CDXX2_JF = null;

    public static get Instance() {
        if (!CDXX2_JF._instance) {
            CDXX2_JF._instance = new CDXX2_JF();
        }
        return CDXX2_JF._instance;
    }

    @property(Label)
    CurLabel: Label = null;

    protected onLoad(): void {
        CDXX2_JF._instance = this;
        // this.node.active = false;
    }

    protected start(): void {
        this.showCurJF();
    }

    showCurJF() {
        if (this.CurLabel) this.CurLabel.string = CDXX2_GameData.Instance.userData.当日积分.toString();
    }

    addJF(number: number) {
        if (CDXX2_GameData.Instance.userData.当日积分 + number >= 10000) {
            CDXX2_GameData.Instance.userData.当日积分 = 10000;
        } else {
            CDXX2_GameData.Instance.userData.当日积分 += number;
        }
        this.showCurJF();
    }

    ButtonClick(event: EventTouch) {
        const target = event.currentTarget;
        switch (target.name) {
            case "签到":
                if (CDXX2_GameData.Instance.IsSignIn) {
                    CDXX2_UIController.Instance.TipsPanel.show("已经签到过了！")
                    break;
                }
                CDXX2_GameData.Instance.IsSignIn = true;
                this.addJF(300);
                CDXX2_UIController.Instance.TipsPanel.show("签到成功！")
                break;
            case "广告":
                Banner.Instance.ShowVideoAd(() => {
                    CDXX2_UIController.Instance.TipsPanel.show("奖励已发放！")
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
        if (CDXX2_GameData.Instance.userData.当日积分 < jf) {
            CDXX2_UIController.Instance.TipsPanel.show("积分不足！")
            return;
        }

        CDXX2_GameData.Instance.userData.当日积分 -= jf;
        CDXX2_GameData.Instance.userData.奖杯 += jb;
        this.showCurJF();
        CDXX2_UIController.Instance.showCup();
        CDXX2_UIController.Instance.TipsPanel.show("兑换成功！")
    }

}


