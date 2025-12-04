import { _decorator, Component, Label, Node, Event, tween, Tween, UIOpacity } from 'cc';
const { ccclass, property } = _decorator;

import XGTW_Bullet from "../XGTW_Bullet";
import { XGTW_AudioManager } from '../XGTW_AudioManager';
import NodeUtil from '../../../../Scripts/Framework/Utils/NodeUtil';
import XGTW_GameManager from '../XGTW_GameManager';
import { XGTW_UIManager } from '../Framework/Managers/XGTW_UIManager';
import { XGTW_Constant } from '../Framework/Const/XGTW_Constant';
import { Panel, UIManager } from '../../../../Scripts/Framework/Managers/UIManager';
import Banner from '../../../../Scripts/Banner';
import { GameManager } from '../../../../Scripts/GameManager';
import { XGTW_DataManager } from '../Framework/Managers/XGTW_DataManager';
import { ProjectEventManager, ProjectEvent } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';

@ccclass('XGTW_FailPanel')
export default class XGTW_FailPanel extends Component {
    NameLabel: Label | null = null;
    WeaponNameLabel: Label | null = null;
    BlackMask: Node | null = null;
    protected onLoad(): void {
        this.NameLabel = NodeUtil.GetComponent("NameLabel", this.node, Label);
        this.WeaponNameLabel = NodeUtil.GetComponent("WeaponNameLabel", this.node, Label);
        this.BlackMask = NodeUtil.GetNode("BlackMask", this.node);
    }
    Show(hitBullet: XGTW_Bullet) {
        ProjectEventManager.emit(ProjectEvent.游戏结束, GameManager.GameData.gameName);
        XGTW_GameManager.JJMode = false;
        XGTW_DataManager.EXP += 500;
        XGTW_DataManager.RankPoint += 500;
        Tween.stopAllByTarget(this.BlackMask.getComponent(UIOpacity));
        this.BlackMask.getComponent(UIOpacity).opacity = 255;
        tween(this.BlackMask.getComponent(UIOpacity)).to(1, { opacity: 0 }).start();

        if (hitBullet) {
            this.NameLabel.string = `${hitBullet.playerData.Name}`;
            this.WeaponNameLabel.string = `${hitBullet.weapon.Name}`;
        }
    }
    OnButtonClick(event: Event) {
        XGTW_AudioManager.AudioClipPlay(XGTW_Constant.Audio.ButtonClick);

        switch (event.target.name) {
            case "EndButton":
                UIManager.ShowPanel(Panel.LoadingPanel, [GameManager.GameData, GameManager.GameData.startScene]);
                break;
        }
    }
}