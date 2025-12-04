import { _decorator, Component, EventTouch, Label, Node } from 'cc';
import { SJNDGZ_GameData } from './SJNDGZ_GameData';
import { SJNDGZ_UIController } from './SJNDGZ_UIController';
import Banner from 'db://assets/Scripts/Banner';
const { ccclass, property } = _decorator;

@ccclass('SJNDGZ_JF')
export class SJNDGZ_JF extends Component {
    private static _instance: SJNDGZ_JF = null;

    public static get Instance() {
        if (!SJNDGZ_JF._instance) {
            SJNDGZ_JF._instance = new SJNDGZ_JF();
        }
        return SJNDGZ_JF._instance;
    }

    @property(Label)
    CurLabel: Label = null;

    protected onLoad(): void {
        SJNDGZ_JF._instance = this;
        this.node.active = false;
    }

    protected start(): void {
        this.showCurJF();
    }

    showCurJF() {
        this.CurLabel.string = SJNDGZ_GameData.Instance.userData.当日积分.toString();
    }

    addJF(number: number) {
        if (SJNDGZ_GameData.Instance.userData.当日积分 + number >= 10000) {
            SJNDGZ_GameData.Instance.userData.当日积分 = 10000;
        } else {
            SJNDGZ_GameData.Instance.userData.当日积分 += number;
        }
        if (this.CurLabel) this.showCurJF();
    }

    ButtonClick(event: EventTouch) {
        const target = event.currentTarget;
        switch (target.name) {
            case "签到":
                if (SJNDGZ_GameData.Instance.IsSignIn) {
                    SJNDGZ_UIController.Instance.TipsPanel.show("已经签到过了！")
                    break;
                }
                SJNDGZ_GameData.Instance.IsSignIn = true;
                this.addJF(300);
                SJNDGZ_UIController.Instance.TipsPanel.show("签到成功！")
                break;
            case "广告":
                Banner.Instance.ShowVideoAd(() => {
                    SJNDGZ_UIController.Instance.TipsPanel.show("奖励已发放！")
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
        if (SJNDGZ_GameData.Instance.userData.当日积分 < jf) {
            SJNDGZ_UIController.Instance.TipsPanel.show("积分不足！")
            return;
        }

        SJNDGZ_GameData.Instance.userData.当日积分 -= jf;
        SJNDGZ_GameData.Instance.userData.奖杯 += jb;
        this.showCurJF();
        SJNDGZ_UIController.Instance.showCup();
        SJNDGZ_UIController.Instance.TipsPanel.show("兑换成功！")
    }

}


