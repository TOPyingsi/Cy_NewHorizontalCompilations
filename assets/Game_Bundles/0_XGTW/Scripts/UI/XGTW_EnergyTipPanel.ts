import { _decorator, Component, Event, Node, tween, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

import { XGTW_AudioManager } from '../XGTW_AudioManager';
import { XGTW_Constant } from '../Framework/Const/XGTW_Constant';
import { XGTW_UIManager } from '../Framework/Managers/XGTW_UIManager';
import Banner from '../../../../Scripts/Banner';
import NodeUtil from '../../../../Scripts/Framework/Utils/NodeUtil';
import { XGTW_DataManager } from '../Framework/Managers/XGTW_DataManager';
import { ProjectEventManager, ProjectEvent } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
import { GameManager } from 'db://assets/Scripts/GameManager';

@ccclass('XGTW_EnergyTipPanel')
export default class XGTW_EnergyTipPanel extends Component {
    Panel: Node = null;

    protected onLoad(): void {
        this.Panel = NodeUtil.GetNode("Panel", this.node);
    }

    Show() {
        ProjectEventManager.emit(ProjectEvent.弹出窗口, GameManager.GameData.gameName);
        this.Panel.setScale(Vec3.ZERO);
        tween(this.Panel).to(0.2, { scale: Vec3.ONE }, { easing: 'backOut' }).start();
    }

    OnButtonClick(event: Event) {
        XGTW_AudioManager.AudioClipPlay(XGTW_Constant.Audio.ButtonClick);

        switch (event.target.name) {
            case "Mask":
            case "CloseButton":
                XGTW_UIManager.Instance.HidePanel(XGTW_Constant.Panel.EnergyTipPanel);
                break;
            case "Button":
                Banner.Instance.ShowVideoAd(() => {
                    XGTW_DataManager.EnergyBattery += 1;
                    XGTW_UIManager.Instance.HidePanel(XGTW_Constant.Panel.EnergyTipPanel);
                })
                break;

        }
    }
}