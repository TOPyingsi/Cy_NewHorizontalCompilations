import { _decorator, Component, EventTouch, Label, Node, Sprite } from 'cc';
import { XYMJ_GameData } from '../XYMJ_GameData';
import { UIManager } from '../../../../Scripts/Framework/Managers/UIManager';
import { XYMJ_AudioManager } from '../XYMJ_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('XYMJ_ForgePanel')
export class XYMJ_ForgePanel extends Component {


    start() {

    }
    protected onEnable(): void {
        this.Show();
    }
    OnbuttomClick(btn: EventTouch) {
        XYMJ_AudioManager.globalAudioPlay("点击");
        switch (btn.target.name) {
            case "返回":
                this.node.active = false;
                break;
            case "钞票锻造0":
                this.upGun(0, true, 100000000, 1);
                break;
            case "钞票锻造1":
                this.upGun(0, true, 100000000, 10);
                break;
            case "钞票锻造2":
                this.upGun(1, true, 200000000, 1);
                break;
            case "钞票锻造3":
                this.upGun(1, true, 200000000, 10);
                break;
            case "金砖锻造0":
                this.upGun(0, false, 100, 1);
                break;
            case "金砖锻造1":
                this.upGun(0, false, 100, 10);
                break;
            case "金砖锻造2":
                this.upGun(1, false, 200, 1);
                break;
            case "金砖锻造3":
                this.upGun(1, false, 200, 10);
                break;
        }
    }
    //刷新状态
    Show() {
        this.node.getChildByPath("巨龙传说/进度条").getComponent(Sprite).fillRange = XYMJ_GameData.Instance.GameData[2] / 100;
        this.node.getChildByPath("至尊天极武士/进度条").getComponent(Sprite).fillRange = XYMJ_GameData.Instance.GameData[3] / 100;
        this.node.getChildByPath("巨龙传说/进度条文本").getComponent(Label).string = `${XYMJ_GameData.Instance.GameData[2]}/ 100`;
        this.node.getChildByPath("至尊天极武士/进度条文本").getComponent(Label).string = `${XYMJ_GameData.Instance.GameData[3]}/ 100`;
    }

    //升级武器（0,巨龙，1至尊天极）
    upGun(id: number, isMoney: boolean, price: number, Num: number) {
        if (isMoney) {
            if (XYMJ_GameData.Instance.Money >= price * Num) {
                XYMJ_GameData.Instance.ChanggeMoney(-price * Num);
                if (id == 0) {
                    XYMJ_GameData.Instance.GameData[2] += Num;
                }
                if (id == 1) {
                    XYMJ_GameData.Instance.GameData[3] += Num;
                }
            } else {
                UIManager.ShowTip("货币不足,无法锻造！");
            }
        } else {
            if (XYMJ_GameData.Instance.GoldBar >= price * Num) {
                XYMJ_GameData.Instance.ChanggeGoldBar(-price * Num)
                if (id == 0) {
                    XYMJ_GameData.Instance.GameData[2] += Num;
                }
                if (id == 1) {
                    XYMJ_GameData.Instance.GameData[3] += Num;
                }
            } else {
                UIManager.ShowTip("货币不足,无法锻造！");
            }
        }

        //判断获得武器
        if (id == 0) {
            if (XYMJ_GameData.Instance.GameData[2] >= 100) {
                UIManager.ShowTip("恭喜你获得武器：巨龙传说");
                XYMJ_GameData.Instance.GameData[2] -= 100;
                XYMJ_GameData.Instance.pushKnapsackData("巨龙传说", 1);
            }
        }
        if (id == 1) {
            if (XYMJ_GameData.Instance.GameData[3] >= 100) {
                UIManager.ShowTip("恭喜你获得武器：至尊天极武士");
                XYMJ_GameData.Instance.GameData[3] -= 100;
                XYMJ_GameData.Instance.pushKnapsackData("至尊天极武士", 1);
            }
        }
        this.Show();
    }
}


