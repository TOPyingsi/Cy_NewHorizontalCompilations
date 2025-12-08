import { _decorator, Component, EventTouch, Label, Node } from 'cc';
import { XYMJXXB_GameData } from '../XYMJXXB_GameData';
import { UIManager } from '../../../../Scripts/Framework/Managers/UIManager';
import { XYMJXXB_AudioManager } from '../XYMJXXB_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('XYMJXXB_PassPanel')
export class XYMJXXB_PassPanel extends Component {
    public static PassLevel: string[] = ["青铜", "白银", "黄金", "铂金", "钻石", "超凡", "传说", "神话"];

    start() {
        this.ShowData();
    }




    Init() {


    }



    //根据赛季经验获刷新当前段位和经验
    ShowData() {
        let seasonExp = XYMJXXB_GameData.Instance.GameData[1];
        const totalLevel = Math.floor(seasonExp / 200);
        const rankIndex = Math.floor(totalLevel / 5);
        let levelInRank = (totalLevel % 5) + 1;//小段位
        if (totalLevel >= 40) levelInRank = 5;
        const rankName = XYMJXXB_PassPanel.PassLevel[Math.min(rankIndex, XYMJXXB_PassPanel.PassLevel.length - 1)];
        this.node.getChildByPath("段位展示/段位").getComponent(Label).string = `${rankName}${levelInRank}`;
        const currentLevelExp = seasonExp % 200;
        // 显示经验
        this.node.getChildByPath("段位展示/经验").getComponent(Label).string = `经验要求:${currentLevelExp}/200`;
        this.node.getChildByName("星星").children.forEach((child, index) => {
            if (index < levelInRank) {
                child.children[0].active = true;
            } else { child.children[0].active = false; }
        });
        this.node.getChildByName("段位奖励").children.forEach((child, index) => {
            if (XYMJXXB_GameData.Instance.SportsCompetitionSeasonData[index] == 0) {
                child.getChildByName("已领取Mask").active = false;
            } else {
                child.getChildByName("已领取Mask").active = true;
            }
        });
    }


    OnbuttomClick(btn: EventTouch) {
        XYMJXXB_AudioManager.globalAudioPlay("点击");
        switch (btn.target.name) {
            case "返回":
                this.node.active = false;
                break;
            case "加经验":
                XYMJXXB_GameData.Instance.GameData[1] += 100;
                this.ShowData();
                break;
            case "0":
            case "1":
            case "2":
            case "3":
            case "4":
            case "5":
            case "6":
            case "7":
                //获取段位奖励
                this.GetAward(Number(btn.target.name));
                break;
            default:
                break;
        }
    }

    Award: number[] = [100, 1000, 2000, 3000, 5000, 8000, 10000, 15000];//金砖奖励
    //点击获得段位奖励
    GetAward(Levle: number) {
        let seasonExp = XYMJXXB_GameData.Instance.GameData[1];
        const totalLevel = Math.floor(seasonExp / 200);
        let lv = Math.floor(totalLevel / 5);
        if (lv < Levle) {
            UIManager.ShowTip("段位不足！无法获得该奖励！");
            return;
        }
        if (XYMJXXB_GameData.Instance.SportsCompetitionSeasonData[Levle] == 0) {
            XYMJXXB_GameData.Instance.SportsCompetitionSeasonData[Levle] = 1;
            XYMJXXB_GameData.Instance.ChanggeGoldBar(this.Award[Levle]);
            if (Levle == 7) {
                XYMJXXB_GameData.Instance.SkinData.push("S1限定头像！");
            }
            UIManager.ShowTip("领取成功！");
            this.ShowData();
        } else {
            UIManager.ShowTip("你已经领取过该奖励！");
        }
    }
}


