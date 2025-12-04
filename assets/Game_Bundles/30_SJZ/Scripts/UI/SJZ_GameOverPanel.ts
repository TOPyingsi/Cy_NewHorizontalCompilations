import { _decorator, Component, Node, Event, UIOpacity, Tween, tween, RichText, Label, sys } from 'cc';
const { ccclass, property } = _decorator;

import NodeUtil from '../../../../Scripts/Framework/Utils/NodeUtil';
import { Panel, UIManager } from '../../../../Scripts/Framework/Managers/UIManager';
import Banner from '../../../../Scripts/Banner';
import { GameManager } from 'db://assets/Scripts/GameManager';
import { ProjectEventManager, ProjectEvent } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
import { PanelBase } from 'db://assets/Scripts/Framework/UI/PanelBase';
import { Tools } from 'db://assets/Scripts/Framework/Utils/Tools';
import { SJZ_MatchData } from '../SJZ_Data';
import { SJZ_DataManager } from '../SJZ_DataManager';
import { SJZ_AudioManager, SJZ_Audio } from '../SJZ_AudioManager';
import { SJZ_LvManager } from '../SJZ_LvManager';
import PrefsManager from 'db://assets/Scripts/Framework/Managers/PrefsManager';
import { SJZ_Constant } from '../SJZ_Constant';
import { SJZ_GameManager } from '../SJZ_GameManager';

@ccclass('SJZ_GameOverPanel')
export default class SJZ_GameOverPanel extends PanelBase {
    Panel: Node | null = null;
    DetailPanel: Node | null = null;
    PanelResultRichText: RichText | null = null;
    PanelCheliLabel: Label | null = null;
    PanelTimeLabel: Label | null = null;

    DetailPanelResultRichText: RichText | null = null;
    DetailPanelMapLabel: Label | null = null;
    DetailPanelCheliLabel: Label | null = null;
    DetailPanelTimeLabel: Label | null = null;
    DetailPanlMoneyLabel: Label | null = null;
    DetailPanlKillPLabel: Label | null = null;
    DetailPanlKillELabel: Label | null = null;

    protected onLoad(): void {
        this.Panel = NodeUtil.GetNode("Panel", this.node);
        this.DetailPanel = NodeUtil.GetNode("DetailPanel", this.node);
        this.PanelResultRichText = NodeUtil.GetComponent("PanelResultRichText", this.node, RichText);
        this.PanelCheliLabel = NodeUtil.GetComponent("PanelCheliLabel", this.node, Label);
        this.PanelTimeLabel = NodeUtil.GetComponent("PanelTimeLabel", this.node, Label);

        this.DetailPanelResultRichText = NodeUtil.GetComponent("DetailPanelResultRichText", this.node, RichText);
        this.DetailPanelMapLabel = NodeUtil.GetComponent("DetailPanelMapLabel", this.node, Label);
        this.DetailPanelCheliLabel = NodeUtil.GetComponent("DetailPanelCheliLabel", this.node, Label);
        this.DetailPanelTimeLabel = NodeUtil.GetComponent("DetailPanelTimeLabel", this.node, Label);
        this.DetailPanlMoneyLabel = NodeUtil.GetComponent("DetailPanlMoneyLabel", this.node, Label);
        this.DetailPanlKillPLabel = NodeUtil.GetComponent("DetailPanlKillPLabel", this.node, Label);
        this.DetailPanlKillELabel = NodeUtil.GetComponent("DetailPanlKillELabel", this.node, Label);
    }

    data: SJZ_MatchData = null;

    Show(win: boolean, data: SJZ_MatchData) {
        SJZ_GameManager.IsGameOver = true;
        SJZ_AudioManager.Instance.StopBGM();
        SJZ_DataManager.SaveData();
        super.Show(this.Panel);
        this.data = data;
        this.DetailPanel.active = false;
        this.RefreshPanel(win);
        this.RefreshDetailPanel(win);

        if (SJZ_LvManager.Instance.matchData.MapName == "训练场") {
            // PrefsManager.SetBool(SJZ_Constant.Key.FirstInGame, false);
            sys.localStorage.setItem(SJZ_Constant.Key.isHavePassTutorial, true);
        }

        ProjectEventManager.emit(ProjectEvent.游戏结束, GameManager.GameData.gameName);
    }

    RefreshPanel(win: boolean) {
        this.PanelResultRichText.string = `<b><color=${win ? "#95f0a6" : "#bd4b41"}>${win ? "撤离成功" : "撤离失败"}</color></b>`;
        this.PanelCheliLabel.string = this.data.MapName;
        this.PanelTimeLabel.string = Tools.FormatTime(this.data.Time);
    }

    RefreshDetailPanel(win: boolean) {
        this.DetailPanelResultRichText.string = `<b><color=${win ? "#95f0a6" : "#bd4b41"}>${win ? "撤离成功" : "撤离失败"}</color></b>`;
        this.DetailPanelMapLabel.string = this.data.MapName;
        this.DetailPanelCheliLabel.string = this.data.EvacuationSite;
        this.DetailPanelTimeLabel.string = Tools.FormatTime(this.data.Time);
        this.DetailPanlMoneyLabel.string = `${this.data.Reward.toLocaleString()}`;
        this.DetailPanlKillPLabel.string = `${this.data.KilledPC}`;
        this.DetailPanlKillELabel.string = `${this.data.KilledPE}`;
    }

    OnButtonClick(event: Event) {
        SJZ_AudioManager.Instance.PlaySFX(SJZ_Audio.ButtonClick);

        switch (event.target.name) {
            case "Panel":
                this.Panel.active = false;
                this.DetailPanel.active = true;
                break;
            case "ContinueButton":
                UIManager.ShowPanel(Panel.LoadingPanel, [GameManager.GameData, GameManager.GameData.startScene]);
                break;
        }
    }
}