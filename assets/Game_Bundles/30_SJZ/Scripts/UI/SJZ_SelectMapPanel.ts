import { _decorator, Component, Label, Node, Event, Prefab, instantiate, math, Vec2, v2, v3, Size, resources, Vec3, RichText, Sprite, tween, Tween, director } from 'cc';
import NodeUtil from 'db://assets/Scripts/Framework/Utils/NodeUtil';
import { PanelBase } from 'db://assets/Scripts/Framework/UI/PanelBase';
import { SJZ_ItemData } from '../SJZ_Data';
import { SJZ_UIManager } from './SJZ_UIManager';
import { SJZ_Constant } from '../SJZ_Constant';
import { SJZ_GameManager } from '../SJZ_GameManager';
import { Tools } from 'db://assets/Scripts/Framework/Utils/Tools';
import { EasingType } from 'db://assets/Scripts/Framework/Utils/TweenUtil';
import { Panel, UIManager } from 'db://assets/Scripts/Framework/Managers/UIManager';
import { GameManager } from 'db://assets/Scripts/GameManager';
import { ProjectEvent, ProjectEventManager } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
import { SJZ_Audio, SJZ_AudioManager } from '../SJZ_AudioManager';
import { SJZ_DataManager } from '../SJZ_DataManager';
const { ccclass, property } = _decorator;

@ccclass('SJZ_SelectMapPanel')
export default class SJZ_SelectMapPanel extends PanelBase {
    Panel: Node = null;
    Map: Node = null;
    Maps: Node = null;
    lhdb: Node = null;
    DifficultyRichText: RichText = null;
    EntryCostRichText: RichText = null;
    LevelRequirementRichText: RichText = null;
    TimeLimitRichText: RichText = null;
    RegularButton: Sprite = null;
    RegularButtonRichText: RichText = null;
    SecretButton: Sprite = null;
    SecretButtonRichText: RichText = null;
    mapInfo: any = null;
    difficulty: number = 0;


    difficultyColorHex: string[] = ["#00ff00", "#ff0000"];
    difficultyStrs = ["简单", "困难"];

    protected onLoad(): void {
        this.Panel = NodeUtil.GetNode("Panel", this.node);
        this.Map = NodeUtil.GetNode("Map", this.node);
        this.Maps = NodeUtil.GetNode("Maps", this.node);
        this.lhdb = NodeUtil.GetNode("零号大坝", this.node);
        this.DifficultyRichText = NodeUtil.GetComponent("DifficultyRichText", this.node, RichText);
        this.EntryCostRichText = NodeUtil.GetComponent("EntryCostRichText", this.node, RichText);
        this.LevelRequirementRichText = NodeUtil.GetComponent("LevelRequirementRichText", this.node, RichText);
        this.TimeLimitRichText = NodeUtil.GetComponent("TimeLimitRichText", this.node, RichText);
        this.RegularButton = NodeUtil.GetComponent("RegularButton", this.node, Sprite);
        this.RegularButtonRichText = NodeUtil.GetComponent("RegularButtonRichText", this.node, RichText);
        this.SecretButton = NodeUtil.GetComponent("SecretButton", this.node, Sprite);
        this.SecretButtonRichText = NodeUtil.GetComponent("SecretButtonRichText", this.node, RichText);

        this.Show();
    }

    Show(): void {
        this.mapInfo = null;

        // this.ShowMap(this.lhdb.position.clone());
        // this.mapInfo = SJZ_Constant.MapInfo.零号大坝;
        // this.difficulty = 0;
        this.ShowInfoPanel(false);
        ProjectEventManager.emit(ProjectEvent.页面转换, GameManager.GameData.gameName);
    }

    ShowMap(target: Vec3) {
        Tween.stopAllByTarget(this.Map);
        tween(this.Map).to(0.3, { position: target.negative().multiplyScalar(2), scale: v3(2, 2, 1) }, { easing: EasingType.sineIn }).start();
    }

    ResetMap() {
        Tween.stopAllByTarget(this.Map);
        tween(this.Map).to(0.3, { position: Vec3.ZERO, scale: Vec3.ONE }, { easing: EasingType.sineIn }).start();
    }

    ShowInfoPanel(active: boolean) {
        this.Panel.active = active;
        if (active) {
            super.Show(this.Panel);
            this.RefreshPanel();
        } else {
            this.mapInfo = null;
        }
    }

    RefreshPanel() {
        if (this.mapInfo == null) return;
        this.RegularButton.color = this.difficulty == 0 ? Tools.GetColorFromHex("#5EA770") : Tools.GetColorFromHex("#293E51");
        this.SecretButton.color = this.difficulty == 1 ? Tools.GetColorFromHex("#5EA770") : Tools.GetColorFromHex("#293E51");
        this.RegularButtonRichText.string = `<b><color=${this.difficulty == 0 ? "#ffffff" : "#a9a9aa"}>常规行动</color></b>`;
        this.SecretButtonRichText.string = `<b><color=${this.difficulty == 1 ? "#ffffff" : "#a9a9aa"}>机密行动</color></b>`;

        this.DifficultyRichText.string = `<b><color=${this.difficultyColorHex[this.difficulty]} >${this.difficultyStrs[this.difficulty]}</color></b>`;
        this.EntryCostRichText.string = `<b><color=#ffffff>${this.mapInfo.EntryCosts[this.difficulty]}</color></b>`;
        this.LevelRequirementRichText.string = `<b><color=#ffffff>${this.mapInfo.LevelRequirements[this.difficulty]}</color></b>`;
        this.TimeLimitRichText.string = `<b><color=#ffffff>${this.mapInfo.TimeLimit}</color></b>`;
        this.Maps.children.forEach(child => {
            child.active = child.name == this.mapInfo.Name;
        });
    }

    OnButtonClick(event: Event) {
        SJZ_AudioManager.Instance.PlaySFX(SJZ_Audio.ButtonClick);

        switch (event.target.name) {
            case "Map":
                this.ShowInfoPanel(false);
                this.ResetMap();
                break;
            case "零号大坝":
                if (this.mapInfo == SJZ_Constant.MapInfo.零号大坝) return;
                this.ShowMap(event.target.position.clone());
                this.mapInfo = SJZ_Constant.MapInfo.零号大坝;
                this.difficulty = 0;
                this.ShowInfoPanel(true);
                break;
            case "长弓溪谷":
                if (this.mapInfo == SJZ_Constant.MapInfo.长弓溪谷) return;
                this.ShowMap(event.target.position.clone());
                this.mapInfo = SJZ_Constant.MapInfo.长弓溪谷;
                this.difficulty = 0;
                this.ShowInfoPanel(true);
                break;
            case "烽火荣都":
                if (this.mapInfo == SJZ_Constant.MapInfo.烽火荣都) return;
                this.ShowMap(event.target.position.clone());
                this.mapInfo = SJZ_Constant.MapInfo.烽火荣都;
                this.difficulty = 0;
                this.ShowInfoPanel(true);
                break;
            case "RegularButton":
                this.difficulty = 0;
                this.RefreshPanel();
                break;
            case "SecretButton":
                this.difficulty = 1;
                this.RefreshPanel();
                break;
            case "StartButton":
                if (SJZ_DataManager.PlayerData.GetTotalValue() >= this.mapInfo.EntryCosts[this.difficulty]) {
                    UIManager.ShowPanel(Panel.LoadingPanel, this.mapInfo.MapName);
                } else {
                    UIManager.ShowTip(`战备价值不够`);
                }
                break;
            case "ReturnButton":
                SJZ_UIManager.Instance.HidePanel(SJZ_Constant.Panel.SelectMapPanel);
                break;


        }
    }
}