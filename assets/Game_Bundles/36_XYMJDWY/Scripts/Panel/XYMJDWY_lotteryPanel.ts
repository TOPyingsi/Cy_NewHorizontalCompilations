import { _decorator, Component, EventTouch, Node } from 'cc';
import { XYMJDWY_GameData } from '../XYMJDWY_GameData';
import { UIManager } from '../../../../Scripts/Framework/Managers/UIManager';
import { XYMJDWY_AudioManager } from '../XYMJDWY_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('XYMJDWY_lotteryPanel')
export class XYMJDWY_lotteryPanel extends Component {
    public static lotteryPanelIndex: number = 0;//抽奖页数
    private static lotteryPaneldate: string[][] = [
        ["忍者奥义", "忍者传说", "正义忍者1", "正义忍者2"],
        ["甜心宝贝1", "甜心宝贝2", "甜心宝贝3", "甜心宝贝4"]
    ]

    start() {

    }
    protected onEnable(): void {
        this.node.getChildByName("Content").children.forEach((element, index) => {
            element.active = index == XYMJDWY_lotteryPanel.lotteryPanelIndex;
        });
    }
    OnbuttomClick(btn: EventTouch) {
        XYMJDWY_AudioManager.globalAudioPlay("点击");
        switch (btn.target.name) {
            case "抽奖1按钮":
                this.GetSkin(0);
                break;
            case "抽奖2按钮":
                this.GetSkin(1);
                break;
            case "返回":
                this.node.active = false;
                break;
        }
    }


    //从奖池中获得皮肤
    GetSkin(index: number) {
        if (XYMJDWY_GameData.Instance.GoldBar >= 200) {
            XYMJDWY_GameData.Instance.ChanggeGoldBar(-200);
            if (Math.random() * 100 < 10) {
                //抽中逻辑
                let leng = XYMJDWY_lotteryPanel.lotteryPaneldate[XYMJDWY_lotteryPanel.lotteryPanelIndex].length;
                let AwardName: string = XYMJDWY_lotteryPanel.lotteryPaneldate[XYMJDWY_lotteryPanel.lotteryPanelIndex][Math.floor(Math.random() * leng)];
                if (XYMJDWY_GameData.Instance.SkinData.indexOf(AwardName) != -1) {
                    UIManager.ShowTip("抽到重复皮肤" + AwardName + ",返还800金块！");
                } else {
                    XYMJDWY_GameData.Instance.SkinData.push(AwardName);
                    UIManager.ShowTip("恭喜解锁皮肤" + AwardName + "！");
                }

            } else {
                UIManager.ShowTip("很遗憾！没有抽中皮肤！");
            }
        } else {
            UIManager.ShowTip("金砖不足！");
        }
    }
}


