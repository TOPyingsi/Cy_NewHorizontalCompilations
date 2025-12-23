import { _decorator, Component, Label, Node, Event, Prefab, instantiate, math, Vec2, v2, v3, Size, resources, Vec3, RichText, Sprite, tween, Tween, director } from 'cc';
import NodeUtil from 'db://assets/Scripts/Framework/Utils/NodeUtil';
import { PanelBase } from 'db://assets/Scripts/Framework/UI/PanelBase';
import { XGTS_ItemData } from '../XGTS_Data';
import { XGTS_UIManager } from './XGTS_UIManager';
import { XGTS_Constant } from '../XGTS_Constant';
import { XGTS_GameManager } from '../XGTS_GameManager';
import { Tools } from 'db://assets/Scripts/Framework/Utils/Tools';
import { EasingType } from 'db://assets/Scripts/Framework/Utils/TweenUtil';
import { Panel, UIManager } from 'db://assets/Scripts/Framework/Managers/UIManager';
import { GameManager } from 'db://assets/Scripts/GameManager';
import { ProjectEvent, ProjectEventManager } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
import { XGTS_Audio, XGTS_AudioManager } from '../XGTS_AudioManager';
import { XGTS_DataManager } from '../XGTS_DataManager';
import XGTS_CameraController from '../XGTS_CameraController';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
const { ccclass, property } = _decorator;

@ccclass('XGTS_SelectMapPanel')
export default class XGTS_SelectMapPanel extends PanelBase {
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

    playerNum: number = 0;

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

    Show(playerNum?: number): void {
        this.mapInfo = null;
        this.playerNum = playerNum;

        // this.ShowMap(this.lhdb.position.clone());
        // this.mapInfo = XGTS_Constant.MapInfo.零号大坝;
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


    destoryPlayer() {
        if (XGTS_GameManager.Instance.player) XGTS_GameManager.Instance.player.destroy();
        if (XGTS_GameManager.Instance.playerNode) XGTS_GameManager.Instance.playerNode.destroy();

        XGTS_GameManager.Instance.player = null;
        XGTS_GameManager.Instance.playerNode = null;

        EventManager.Scene.emit(XGTS_Constant.Event.RESET_CAMERA);

        XGTS_GameManager.Instance.playerNodes.forEach((node) => {
            node.destroy();
        })
        XGTS_GameManager.Instance.players.forEach((player) => {
            player.destroy();
        })
        XGTS_GameManager.Instance.playerNodes = [];
        XGTS_GameManager.Instance.players = [];
    }

    OnButtonClick(event: Event) {
        XGTS_AudioManager.Instance.PlaySFX(XGTS_Audio.ButtonClick);

        switch (event.target.name) {
            case "Map":
                this.ShowInfoPanel(false);
                this.ResetMap();
                break;
            case "零号大坝":
                if (this.mapInfo == XGTS_Constant.MapInfo.零号大坝) return;
                this.ShowMap(event.target.position.clone());
                this.mapInfo = XGTS_Constant.MapInfo.零号大坝;
                this.difficulty = 0;
                this.ShowInfoPanel(true);
                break;
            case "长弓溪谷":
                if (this.mapInfo == XGTS_Constant.MapInfo.长弓溪谷) return;
                this.ShowMap(event.target.position.clone());
                this.mapInfo = XGTS_Constant.MapInfo.长弓溪谷;
                this.difficulty = 0;
                this.ShowInfoPanel(true);
                break;
            case "烽火荣都":
                if (this.mapInfo == XGTS_Constant.MapInfo.烽火荣都) return;
                this.ShowMap(event.target.position.clone());
                this.mapInfo = XGTS_Constant.MapInfo.烽火荣都;
                this.difficulty = 0;
                this.ShowInfoPanel(true);
                break;
            case "校长办公室":
                if (this.mapInfo == XGTS_Constant.MapInfo.校长办公室) return;
                this.ShowMap(event.target.position.clone());
                this.mapInfo = XGTS_Constant.MapInfo.校长办公室;
                this.difficulty = 0;
                this.ShowInfoPanel(true);
                break;
            case "宿舍":
                if (this.mapInfo == XGTS_Constant.MapInfo.宿舍) return;
                this.ShowMap(event.target.position.clone());
                this.mapInfo = XGTS_Constant.MapInfo.宿舍;
                this.difficulty = 0;
                this.ShowInfoPanel(true);
                break;
            case "体育场":
                if (this.mapInfo == XGTS_Constant.MapInfo.体育场) return;
                this.ShowMap(event.target.position.clone());
                this.mapInfo = XGTS_Constant.MapInfo.体育场;
                this.difficulty = 0;
                this.ShowInfoPanel(true);
                break;
            case "电脑室":
                if (this.mapInfo == XGTS_Constant.MapInfo.电脑室) return;
                this.ShowMap(event.target.position.clone());
                this.mapInfo = XGTS_Constant.MapInfo.电脑室;
                this.difficulty = 0;
                this.ShowInfoPanel(true);
                break;
            case "仙界":
                if (this.mapInfo == XGTS_Constant.MapInfo.仙界) return;
                this.ShowMap(event.target.position.clone());
                this.mapInfo = XGTS_Constant.MapInfo.仙界;
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
                if (XGTS_DataManager.PlayerDatas[this.playerNum].GetTotalValue() >= this.mapInfo.EntryCosts[this.difficulty]) {
                    this.destoryPlayer();
                    XGTS_GameManager.isChangeScene = true;
                    UIManager.ShowPanel(Panel.LoadingPanel, this.mapInfo.MapName);
                } else {
                    UIManager.ShowTip(`战备价值不够`);
                }
                break;
            case "ReturnButton":
                XGTS_UIManager.Instance.HidePanel(XGTS_Constant.Panel.SelectMapPanel);
                break;


        }
    }
}