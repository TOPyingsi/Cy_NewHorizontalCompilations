import { _decorator, Component, Node, Label, Event, Tween, tween, v3 } from 'cc';
const { ccclass, property } = _decorator;

import { XGTW_AudioManager } from '../XGTW_AudioManager';
import NodeUtil from '../../../../Scripts/Framework/Utils/NodeUtil';
import { EasingType } from '../../../../Scripts/Framework/Utils/TweenUtil';
import { XGTW_ItemType, XGTW_Constant } from '../Framework/Const/XGTW_Constant';
import { XGTW_UIManager } from '../Framework/Managers/XGTW_UIManager';
import { UIManager } from '../../../../Scripts/Framework/Managers/UIManager';
import Banner from '../../../../Scripts/Banner';
import { Tools } from 'db://assets/Scripts/Framework/Utils/Tools';
import { XGTW_DataManager } from '../Framework/Managers/XGTW_DataManager';
import { ProjectEvent, ProjectEventManager } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
import { GameManager } from 'db://assets/Scripts/GameManager';

@ccclass('XGTW_RankPanel')
export default class XGTW_RankPanel extends Component {
    RankIcon: Node | null = null;
    RankDetialPanel: Node | null = null;
    RankLabel: Label | null = null;
    RankPointLabel: Label | null = null;
    rankRange: number[] = [1000, 5000, 10000, 20000];
    rank: string[] = ["新兵", "专家", "王牌", "狗区传说"];
    protected onLoad(): void {
        this.RankIcon = NodeUtil.GetNode("RankIcon", this.node);
        this.RankDetialPanel = NodeUtil.GetNode("RankDetialPanel", this.node);
        this.RankLabel = NodeUtil.GetComponent("RankLabel", this.node, Label);
        this.RankPointLabel = NodeUtil.GetComponent("RankPointLabel", this.node, Label);
    }
    Show() {
        ProjectEventManager.emit(ProjectEvent.弹出窗口, GameManager.GameData.gameName);
        this.RankDetialPanel.active = false;
        Tween.stopAllByTarget(this.RankIcon);
        this.RankIcon.setScale(3, 3);
        tween(this.RankIcon).to(0.3, { scale: v3(1.5, 1.5) }, { easing: EasingType.quadIn }).start();
        this.Refresh();


        XGTW_DataManager.EXP += 500;
        XGTW_DataManager.RankPoint += 500;
    }
    Refresh() {
        this.RankPointLabel.string = `段位积分：${XGTW_DataManager.RankPoint}`;

        let index = 0;

        if (XGTW_DataManager.EXP <= this.rankRange[1]) {
            this.RankLabel.string = this.rank[0];
            index = 0;
        }

        if (XGTW_DataManager.EXP > this.rankRange[1] && XGTW_DataManager.EXP <= this.rankRange[2]) {
            this.RankLabel.string = this.rank[1];
            index = 1;
        }

        if (XGTW_DataManager.EXP > this.rankRange[2] && XGTW_DataManager.EXP <= this.rankRange[3]) {
            this.RankLabel.string = this.rank[2];
            index = 2;
        }

        if (XGTW_DataManager.EXP > this.rankRange[3]) {
            this.RankLabel.string = this.rank[3];
            index = 3;
        }

        for (let i = 0; i < this.RankIcon.children.length; i++) {
            this.RankIcon.children[i].active = index == i;
        }
    }
    OnButtonClick(event: Event) {
        XGTW_AudioManager.AudioClipPlay(XGTW_Constant.Audio.ButtonClick);

        switch (event.target.name) {
            case "ReturnButton":
                XGTW_UIManager.Instance.HidePanel(XGTW_Constant.Panel.RankPanel);
                break;

            case "BuyTouKuiButton":
                if (XGTW_DataManager.RankPoint >= 2400) {
                    XGTW_DataManager.RankPoint -= 2400;
                    let data1 = XGTW_DataManager.ItemDatas.get(XGTW_ItemType.头盔).find(e => e.Name == "IND70战术");
                    XGTW_DataManager.AddPlayerItem(Tools.Clone(data1));
                    XGTW_UIManager.Instance.ShowPanel(XGTW_Constant.Panel.RewardPanel, [data1]);
                    this.Refresh();
                } else {
                    UIManager.ShowTip("段位积分不足");
                }

                break;

            case "BuyKuiJiaButton":
                if (XGTW_DataManager.RankPoint >= 3000) {
                    XGTW_DataManager.RankPoint -= 3000;
                    let data2 = XGTW_DataManager.ItemDatas.get(XGTW_ItemType.防弹衣).find(e => e.Name == "斯巴达B型防弹衣");
                    XGTW_DataManager.AddPlayerItem(Tools.Clone(data2));
                    XGTW_UIManager.Instance.ShowPanel(XGTW_Constant.Panel.RewardPanel, [data2]);
                    this.Refresh();
                } else {
                    UIManager.ShowTip("段位积分不足");
                }

                break;

            case "BuyGunButton":
                if (XGTW_DataManager.RankPoint >= 4000) {
                    XGTW_DataManager.RankPoint -= 4000;
                    let data3 = XGTW_DataManager.JunXuItems.find(e => e.Name == "AUG-祥瑞");
                    XGTW_DataManager.AddPlayerItem(Tools.Clone(data3));
                    XGTW_UIManager.Instance.ShowPanel(XGTW_Constant.Panel.RewardPanel, [data3]);
                    this.Refresh();
                } else {
                    UIManager.ShowTip("段位积分不足");
                }
                break;

            case "RankDetailButton":
                this.RankDetialPanel.active = true;
                break;
            case "RankDetialPanelReturnButton":
                this.RankDetialPanel.active = false;
                break;

        }
    }
}