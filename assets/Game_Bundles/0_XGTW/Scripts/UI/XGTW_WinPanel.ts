import { _decorator, Component, Node, Event, UIOpacity, Tween, tween } from 'cc';
const { ccclass, property } = _decorator;

import { XGTW_AudioManager } from '../XGTW_AudioManager';
import { XGTW_UIManager } from '../Framework/Managers/XGTW_UIManager';
import { XGTW_Constant } from '../Framework/Const/XGTW_Constant';
import NodeUtil from '../../../../Scripts/Framework/Utils/NodeUtil';
import { Panel, UIManager } from '../../../../Scripts/Framework/Managers/UIManager';
import Banner from '../../../../Scripts/Banner';
import { GameManager } from 'db://assets/Scripts/GameManager';
import { XGTW_DataManager } from '../Framework/Managers/XGTW_DataManager';
import { ProjectEventManager, ProjectEvent } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';

@ccclass('XGTW_WinPanel')
export default class XGTW_WinPanel extends Component {
    BlackMask: Node | null = null;
    protected onLoad(): void {
        this.BlackMask = NodeUtil.GetNode("BlackMask", this.node);
    }

    Show() {
        ProjectEventManager.emit(ProjectEvent.游戏结束, GameManager.GameData.gameName);
        XGTW_DataManager.EXP += 1000;
        XGTW_DataManager.RankPoint += 1000;
        Tween.stopAllByTarget(this.BlackMask);
        this.BlackMask.getComponent(UIOpacity).opacity = 255;
        tween(this.BlackMask.getComponent(UIOpacity)).to(1, { opacity: 0 }).start();
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