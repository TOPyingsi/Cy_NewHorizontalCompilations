import { _decorator, Node, Event, tween, v3, Tween, Label, Sprite, SpriteFrame, Vec3 } from 'cc';
import { AudioManager, Audios } from 'db://assets/Scripts/Framework/Managers/AudioManager';
import { Panel, UIManager } from 'db://assets/Scripts/Framework/Managers/UIManager';
import { PanelBase } from 'db://assets/Scripts/Framework/UI/PanelBase';
import NodeUtil from 'db://assets/Scripts/Framework/Utils/NodeUtil';
import { Bacon_Constant } from './Bacon_Constant';
import { BaconAudio, Bacon_Manager } from './Bacon_Manager';
import Banner from 'db://assets/Scripts/Banner';
import { Tools } from 'db://assets/Scripts/Framework/Utils/Tools';
import { GameManager } from 'db://assets/Scripts/GameManager';
import { ProjectEventManager, ProjectEvent } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';

const { ccclass, property } = _decorator;

@ccclass('Bacon_WinPanel')
export default class Bacon_WinPanel extends PanelBase {

    Panel: Node = null;
    TimeLabel: Label = null;
    CountLabel: Label = null;

    protected onLoad(): void {
        this.Panel = NodeUtil.GetNode("Panel", this.node);
        this.TimeLabel = NodeUtil.GetComponent("TimeLabel", this.node, Label);
        this.CountLabel = NodeUtil.GetComponent("CountLabel", this.node, Label);
    }

    Show(time: number, count: number) {
        ProjectEventManager.emit(ProjectEvent.弹出窗口, GameManager.GameData.gameName);
        AudioManager.Instance.PlaySFX(Bacon_Manager.Instance.audios[BaconAudio.win]);
        super.Show(this.Panel);
        this.TimeLabel.string = `用时：${Tools.FillWithZero(Math.floor(time / 60), 2)}:${Tools.FillWithZero(Math.floor(time % 60), 2)}`;
        this.CountLabel.string = `次数：${count}次`;
        Banner.Instance.ShowCustomAd();
    }

    OnButtonClick(event: Event) {
        AudioManager.Instance.PlayCommonSFX(Audios.ButtonClick);

        const nextLv = () => {
            Bacon_Manager.Lv++;
            UIManager.HidePanel(`${GameManager.GameData.DefaultBundle}/${Bacon_Constant.UI.BaconWinPanel}`);
            Bacon_Manager.Instance.gamePanel.Show();
        }

        switch (event.target.name) {
            case "MoreBaconButton":
                Banner.Instance.ShowVideoAd(() => {
                    Bacon_Manager.Bacon += 30;
                    nextLv();
                });
                break;
            case "ContinueButton":
            case "Mask":
            case "CloseButton":
                Bacon_Manager.Bacon += 2;
                nextLv();
                break;

        }
    }
}
