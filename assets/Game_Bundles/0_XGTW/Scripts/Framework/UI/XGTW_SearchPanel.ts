import { _decorator, Component, Node, Label, Event, color, Sprite, v3, tween, SpriteFrame } from 'cc';
const { ccclass, property } = _decorator;

import { XGTW_DataManager } from '../Managers/XGTW_DataManager';
import { XGTW_AudioManager } from '../../XGTW_AudioManager';
import { BundleManager } from '../../../../../Scripts/Framework/Managers/BundleManager';
import NodeUtil from '../../../../../Scripts/Framework/Utils/NodeUtil';
import { XGTW_Constant } from '../Const/XGTW_Constant';
import { XGTW_UIManager } from '../Managers/XGTW_UIManager';
import { UIManager } from '../../../../../Scripts/Framework/Managers/UIManager';
import { GameManager } from '../../../../../Scripts/GameManager';
import { EventManager } from '../../../../../Scripts/Framework/Managers/EventManager';
import { XGTW_Event } from '../Managers/XGTW_Event';
import Banner from '../../../../../Scripts/Banner';

const searchCost = [20000, 40000, 60000, 80000, 100000, 120000, 140000, 160000, 180000, 200000];
const qbSearchCost = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20];

@ccclass('XGTW_SearchPanel')
export default class XGTW_SearchPanel extends Component {
    ProgressValue: Node | null = null;
    SearchButton_0: Node | null = null;
    SearchButton_1: Node | null = null;
    SearchButton_2: Node | null = null;
    InfoPanel: Node | null = null;
    ProgressGetButton: Node | null = null;

    MoneyLabel: Label = null;
    SkinPieceLabel: Label = null;
    HuiZhangPieceLabel: Label = null;
    KCQBLabel: Label = null;

    ProgressIcon: Sprite | null = null;
    Progress: Node | null = null;
    ProgressLabel: Label | null = null;
    SearchButton_0_MoneyLabel: Label | null = null;
    SearchButton_0_QBLabel: Label | null = null;

    index: number = 0;//星级
    GameIsOver: boolean = false;//游戏是否结束(领奖)

    protected onLoad(): void {
        this.ProgressValue = NodeUtil.GetNode("ProgressValue", this.node);
        this.SearchButton_0 = NodeUtil.GetNode("SearchButton_0", this.node);
        this.SearchButton_1 = NodeUtil.GetNode("SearchButton_1", this.node);
        this.SearchButton_2 = NodeUtil.GetNode("SearchButton_2", this.node);
        this.InfoPanel = NodeUtil.GetNode("InfoPanel", this.node);
        this.ProgressGetButton = NodeUtil.GetNode("ProgressGetButton", this.node);
        this.Progress = NodeUtil.GetNode("Progress", this.node);
        this.ProgressIcon = NodeUtil.GetComponent("ProgressIcon", this.node, Sprite);
        this.ProgressLabel = NodeUtil.GetComponent("ProgressLabel", this.node, Label);
        this.SearchButton_0_MoneyLabel = NodeUtil.GetComponent("SearchButton_0_MoneyLabel", this.node, Label);
        this.SearchButton_0_QBLabel = NodeUtil.GetComponent("SearchButton_0_QBLabel", this.node, Label);
        this.MoneyLabel = NodeUtil.GetComponent("MoneyLabel", this.node, Label);
        this.SkinPieceLabel = NodeUtil.GetComponent("SkinPieceLabel", this.node, Label);
        this.HuiZhangPieceLabel = NodeUtil.GetComponent("HuiZhangPieceLabel", this.node, Label);
        this.KCQBLabel = NodeUtil.GetComponent("KCQBLabel", this.node, Label);
    }

    Show() {
        this.Refresh();
        this.RefreshMoney();
        this.RefreshSkinPiece();
        this.RefreshHuiZhangPiece();
        this.RefreshKCQB();
    }

    public AwardName: string[] = ["徽章碎片", "徽章碎片", "徽章碎片", "徽章碎片", "能源电池", "能源电池", "皮肤碎片", "皮肤碎片"];
    public AwardNumber: number[] = [1, 5, 10, 15, 1, 3, 1, 3];

    //刷新界面
    Refresh() {
        this.ProgressGetButton.active = this.GameIsOver;
        if (this.index == 7) this.ProgressGetButton.active = true;
        this.ProgressValue.active = !this.GameIsOver;
        if (this.index == 7) this.ProgressValue.active = false;
        this.ProgressValue.children.forEach((cd, index: number) => {
            if (index < this.index) {
                cd.children[0].active = true;
            } else {
                cd.children[0].active = false;
            }
        })
        BundleManager.LoadSpriteFrame(GameManager.GameData.DefaultBundle, `Res/Sprites/Items/特殊道具/${this.AwardName[this.index]}`).then((sf: SpriteFrame) => {
            this.ProgressIcon.spriteFrame = sf;
        });
        if (this.index == 0) this.ProgressIcon.spriteFrame = null;
        this.ProgressLabel.string = `${this.index}`;
        this.SearchButton_0_MoneyLabel.string = `${searchCost[this.index]}`;
        this.SearchButton_0_QBLabel.string = `${qbSearchCost[this.index]}`;
        this.SearchButton_2.active = this.index >= 1;
        this.SearchButton_0.getChildByName("Tip").active = this.index >= 1;
        this.SearchButton_1.getChildByName("Tip").active = this.index >= 1;
    }

    RefreshProgress(index: number) {
        this.ProgressLabel.string = `${index}`;
        for (let i = 0; i < this.ProgressValue.children.length; i++) {
            const element = this.ProgressValue.children[i];
            element.getChildByName("Done").active = Number(element.name) < index;
        }
    }

    ShowInfoPanel(active: boolean) {
        this.InfoPanel.active = active;
    }

    OnButtonClick(event: Event) {
        XGTW_AudioManager.AudioClipPlay(XGTW_Constant.Audio.ButtonClick);

        switch (event.target.name) {
            case "SearchButton_0":
                this.reconnaissance(1);
                break;
            case "SearchButton_1":
                this.reconnaissance(2);
                break;
            case "SearchButton_2":
                this.reconnaissance(0);
                break;
            case "ReturnButton":
                XGTW_UIManager.Instance.HidePanel(XGTW_Constant.Panel.SearchPanel);
                break;
            case "DuiHuanButton":
                XGTW_UIManager.Instance.ShowPanel(XGTW_Constant.Panel.KanChaShopPanel);
                break;
            case "YiLanButton":
                this.ShowInfoPanel(true);
                break;
            case "InfoPanelCloseButton":
                this.ShowInfoPanel(false);
                break;
            case "ProgressGetButton"://领奖
                this.GetAward();
                break;
        }
    }

    //勘察(0免费1普通2高级)
    reconnaissance(num: number) {
        if (this.IsBeginAnimation) { return; }
        if (this.GameIsOver) {
            UIManager.ShowTip("请先领走奖励！");
            return;
        }
        if (this.index == 7) {
            UIManager.ShowTip("已经达到最高等级！");
            return;
        }
        if (num == 0) {//免费
            if (this.GetIssucceed(20)) {
                this.succeedorfailing(true);
            } else {
                this.succeedorfailing(false);
            }
        }
        if (num == 1) {//消耗成本
            if (XGTW_DataManager.Money >= searchCost[this.index] && XGTW_DataManager.KCQB >= qbSearchCost[this.index]) {
                XGTW_DataManager.Money -= searchCost[this.index];
                XGTW_DataManager.KCQB -= qbSearchCost[this.index];
                if (this.GetIssucceed(40)) {
                    this.succeedorfailing(true);
                } else {
                    this.succeedorfailing(false);
                }
            } else {
                UIManager.ShowTip("资源不足！无法勘察！");
            }
        }
        if (num == 2) {//看视频
            Banner.Instance.ShowVideoAd(() => {
                if (this.GetIssucceed(90)) {
                    this.succeedorfailing(true);
                } else {
                    this.succeedorfailing(false);
                }
            })
        }
    }

    //提供概率返回是否成功
    GetIssucceed(num: number): boolean {
        let a = Math.random() * 100;
        if (a < num) {
            return true;
        } else {
            return false;
        }
    }
    //成功或者失败
    succeedorfailing(succeed: boolean) {
        if (succeed) {
            this.Show_reconnaissance(true);
            this.index++;

        } else {
            this.Show_reconnaissance(false);
            if (this.index > 0) {
                this.GameIsOver = true;
            }
        }
        this.Refresh();
    }

    IsBeginAnimation: boolean = false;
    //展示侦查成功和失败的标签
    Show_reconnaissance(succeed: boolean) {
        let nd = succeed == true ? this.node.getChildByPath("UI/勘察成功") : this.node.getChildByPath("UI/勘察失败");
        nd.setScale(v3(1, 1, 1));
        nd.active = true;
        this.IsBeginAnimation = true;
        tween(nd)
            .to(0.5, { scale: v3(3, 3, 3) }, { easing: "backOut" })
            .delay(1)
            .call(() => {
                nd.active = false;
                this.IsBeginAnimation = false;
            }).start();
    }

    //获得奖励
    GetAward() {
        //根据领走奖励
        switch (this.AwardName[this.index]) {
            case "徽章碎片":
                XGTW_DataManager.HuiZhangPiece += this.AwardNumber[this.index];
                UIManager.ShowTip(`获得徽章碎片×${this.AwardNumber[this.index]}`);
                break;
            case "能源电池":
                XGTW_DataManager.EnergyBattery += this.AwardNumber[this.index];
                UIManager.ShowTip(`获得能源电池×${this.AwardNumber[this.index]}`);
                break;
            case "皮肤碎片":
                XGTW_DataManager.SkinPiece += this.AwardNumber[this.index];
                UIManager.ShowTip(`获得皮肤碎片×${this.AwardNumber[this.index]}`);
                break;
        }
        //展示(没有实现)
        this.index = 0;
        this.GameIsOver = false;
        this.Refresh();
    }

    RefreshMoney() {
        this.MoneyLabel.string = `${XGTW_DataManager.Money}`;
    }
    RefreshSkinPiece() {
        this.SkinPieceLabel.string = `${XGTW_DataManager.SkinPiece}`;
    }
    RefreshHuiZhangPiece() {
        this.HuiZhangPieceLabel.string = `${XGTW_DataManager.HuiZhangPiece}`;
    }
    RefreshKCQB() {
        this.KCQBLabel.string = `${XGTW_DataManager.KCQB}`;
    }

    protected onEnable(): void {
        EventManager.on(XGTW_Event.RefreshMoney, this.RefreshMoney, this);
        EventManager.on(XGTW_Event.RefreshSkinPiece, this.RefreshSkinPiece, this);
        EventManager.on(XGTW_Event.RefreshHuiZhangPiece, this.RefreshHuiZhangPiece, this);
        EventManager.on(XGTW_Event.RefreshKCQB, this.RefreshKCQB, this);
    }
    protected onDisable(): void {
        EventManager.off(XGTW_Event.RefreshMoney, this.RefreshMoney, this);
        EventManager.off(XGTW_Event.RefreshSkinPiece, this.RefreshSkinPiece, this);
        EventManager.off(XGTW_Event.RefreshHuiZhangPiece, this.RefreshHuiZhangPiece, this);
        EventManager.off(XGTW_Event.RefreshKCQB, this.RefreshKCQB, this);
    }
}