import { _decorator, Component, Node, Label, Event, color, Sprite } from 'cc';
const { ccclass, property } = _decorator;

import { XGTW_AudioManager } from '../../XGTW_AudioManager';
import NodeUtil from '../../../../../Scripts/Framework/Utils/NodeUtil';
import XGTW_GameManager from '../../XGTW_GameManager';
import { XGTW_Constant } from '../Const/XGTW_Constant';
import { XGTW_UIManager } from '../Managers/XGTW_UIManager';
import { UIManager } from '../../../../../Scripts/Framework/Managers/UIManager';
import { EventManager } from '../../../../../Scripts/Framework/Managers/EventManager';
import { XGTW_Event } from '../Managers/XGTW_Event';
import { XGTW_DataManager } from '../Managers/XGTW_DataManager';

@ccclass('XGTW_ZhuangJiaPanel')
export default class XGTW_ZhuangJiaPanel extends Component {
    TipLabel: Label | null = null;
    EnergyBatteryLabel: Label | null = null;
    EquipButton: Node = null;

    protected onLoad(): void {
        this.EquipButton = NodeUtil.GetNode("EquipButton", this.node);
        this.TipLabel = NodeUtil.GetComponent("TipLabel", this.node, Label);
        this.EnergyBatteryLabel = NodeUtil.GetComponent("EnergyBatteryLabel", this.node, Label);
    }

    Show() {
        this.RefreshEnergyBattery();
        this.RefreshEquipButton();
    }

    RefreshEquipButton() {
        this.EquipButton.getChildByName("0").active = !XGTW_GameManager.JJMode;
        this.EquipButton.getChildByName("1").active = XGTW_GameManager.JJMode;
        this.EquipButton.getChildByName("Tip").active = !XGTW_GameManager.JJMode;
    }

    RefreshEnergyBattery() {
        this.EnergyBatteryLabel.string = `${XGTW_DataManager.EnergyBattery}`;
        this.TipLabel.string = `(${XGTW_DataManager.EnergyBattery}/1)`;
    }

    protected onEnable(): void {
        EventManager.on(XGTW_Event.RefreshEnergyBattery, this.RefreshEnergyBattery, this);
    }

    protected onDisable(): void {
        EventManager.off(XGTW_Event.RefreshEnergyBattery, this.RefreshEnergyBattery, this);
    }

    OnButtonClick(event: Event) {
        XGTW_AudioManager.AudioClipPlay(XGTW_Constant.Audio.ButtonClick);

        switch (event.target.name) {
            case "EquipButton":
                if (XGTW_GameManager.JJMode) {
                    UIManager.ShowTip("已启用");
                    return;
                }

                if (XGTW_DataManager.EnergyBattery < 1) {
                    UIManager.ShowTip("资源不足");
                    XGTW_UIManager.Instance.ShowPanel(XGTW_Constant.Panel.EnergyTipPanel);
                    return;
                }

                UIManager.ShowTip("启用成功");
                XGTW_DataManager.EnergyBattery -= 1;
                XGTW_GameManager.JJMode = true;
                EventManager.Scene.emit(XGTW_Event.RefreshEquip);
                this.RefreshEquipButton();
                break;
            case "ReturnButton":
                XGTW_UIManager.Instance.HidePanel(XGTW_Constant.Panel.ZhuangJiaPanel);
                break;

        }
    }
}